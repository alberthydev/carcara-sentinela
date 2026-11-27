"""Frame evidence and bounded OCR selection for experimental uploads."""

import os
from dataclasses import dataclass, field
from pathlib import Path
from time import perf_counter
from typing import Any

import cv2

from yolo_detector import OnnxDetector


@dataclass(frozen=True)
class YoloPipeline:
    vehicles: OnnxDetector
    plates: OnnxDetector
    ocr_window: int = 3
    ocr_best: int = 1

    @classmethod
    def from_env(cls) -> "YoloPipeline | None":
        backend = os.getenv("VISION_DETECTOR", "opencv")
        if backend == "opencv":
            return None
        if backend != "yolo":
            raise ValueError("VISION_DETECTOR deve ser opencv ou yolo")
        window = int(os.getenv("VISION_OCR_WINDOW", "3"))
        best = int(os.getenv("VISION_OCR_BEST", "1"))
        if window < 1 or not 0 <= best <= window:
            raise ValueError("OCR requer janela positiva e orçamento entre zero e a janela")
        vehicle_model = os.getenv("VISION_VEHICLE_MODEL")
        plate_model = os.getenv("VISION_PLATE_MODEL")
        if not vehicle_model or not plate_model:
            raise ValueError("Configure VISION_VEHICLE_MODEL e VISION_PLATE_MODEL")
        device = os.getenv("VISION_YOLO_DEVICE", "cpu")
        return cls(
            OnnxDetector(Path(vehicle_model),
                         int(os.getenv("VISION_VEHICLE_SIZE", "416")), "vehicle",
                         device, float(os.getenv("VISION_VEHICLE_CONFIDENCE", "0.25"))),
            OnnxDetector(Path(plate_model),
                         int(os.getenv("VISION_PLATE_SIZE", "640")), "plate",
                         device, float(os.getenv("VISION_PLATE_CONFIDENCE", "0.25"))),
            window, best,
        )


def _overlap(first, second) -> int:
    x, y, w, h = first
    a, b, c, d = second
    return max(0, min(x + w, a + c) - max(x, a)) * max(0, min(y + h, b + d) - max(y, b))


def _iou(first, second) -> float:
    intersection = _overlap(first, second)
    return intersection / (first[2] * first[3] + second[2] * second[3] - intersection)


def _box_dict(box, offset) -> dict:
    x, y, width, height = box
    return {"x": x + offset[0], "y": y + offset[1], "largura": width, "altura": height}


@dataclass
class _OcrGroup:
    box: tuple
    frame: int
    crops: list = field(default_factory=list)


class VideoEvidence:
    def __init__(self, pipeline: YoloPipeline, read_ocr, normalize, metrics):
        self.pipeline = pipeline
        self.read_ocr = read_ocr
        self.normalize = normalize
        self.metrics = metrics
        self.frames: list[dict] = []
        self.readings: list[dict] = []
        self.groups: list[_OcrGroup] = []

    def add(self, frame, number: int, second: float, offset: tuple) -> None:
        started = perf_counter()
        vehicles = self.pipeline.vehicles.detect(frame)
        plates = self.pipeline.plates.detect(frame)
        self.metrics["detector_s"] += perf_counter() - started
        started = perf_counter()
        evidence: dict[str, Any] = {
            "frame": number, "segundo": second,
            "veiculos": [
                {"id": index, "classe": obj.label, "caixa": _box_dict(obj.box, offset),
                 "confianca_detector": obj.confidence}
                for index, obj in enumerate(vehicles)
            ],
            "placas": [],
        }
        sample = len(self.frames)
        candidate_by_vehicle = {}
        for plate in plates:
            x, y, width, height = plate.box
            # Ambiguous geometry stays visible for the next stage, without an OCR vote.
            owners = [index for index, vehicle in enumerate(vehicles)
                      if _overlap(plate.box, vehicle.box) >= 0.8 * width * height]
            owner = owners[0] if len(owners) == 1 else None
            candidate = {"caixa": _box_dict(plate.box, offset), "classe": plate.label,
                         "confianca_detector": plate.confidence, "veiculo_id": owner,
                         "ocr_executado": False, "placa": None, "confianca_ocr": None}
            evidence["placas"].append(candidate)
            if owner is None or width < 60 or height < 20 or not self.pipeline.ocr_best:
                continue
            crop = frame[y:y + height, x:x + width]
            gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
            sharpness = float(cv2.Laplacian(gray, cv2.CV_64F).var())
            quality = (sharpness * width * height) ** 0.5 * plate.confidence
            previous = candidate_by_vehicle.get(owner)
            if previous is None or quality > previous[0]:
                candidate_by_vehicle[owner] = quality, crop, candidate

        if self.pipeline.ocr_best:
            self._select(vehicles, candidate_by_vehicle, sample, number, second)
        self.frames.append(evidence)
        self.metrics["selecao_s"] += perf_counter() - started
        if len(self.frames) % self.pipeline.ocr_window == 0:
            self.flush()

    def _select(self, vehicles, candidates, sample, number, second):
        available = [group for group in self.groups if group.frame == sample - 1]
        matches = [(index, group, _iou(vehicle.box, group.box))
                   for index, vehicle in enumerate(vehicles) for group in available]
        by_vehicle = {}
        used_groups = set()
        for index, group, score in sorted(matches, key=lambda match: -match[2]):
            if score < 0.3 or index in by_vehicle or id(group) in used_groups:
                continue
            by_vehicle[index] = group
            used_groups.add(id(group))
        for index, vehicle in enumerate(vehicles):
            group = by_vehicle.get(index)
            if group is None:
                group = _OcrGroup(vehicle.box, sample)
                self.groups.append(group)
            group.box, group.frame = vehicle.box, sample
            if index in candidates:
                quality, crop, candidate = candidates[index]
                if len(group.crops) < self.pipeline.ocr_best or quality > group.crops[-1][0]:
                    group.crops.append((quality, crop.copy(), candidate, number, second))
                    group.crops.sort(key=lambda entry: -entry[0])
                    del group.crops[self.pipeline.ocr_best:]

    def flush(self) -> None:
        for group in self.groups:
            for _, crop, candidate, number, second in group.crops:
                started = perf_counter()
                raw_text, confidence = self.read_ocr(crop)
                text = self.normalize(raw_text)
                self.metrics["ocr_s"] += perf_counter() - started
                self.metrics["chamadas_ocr"] += 1
                candidate.update(ocr_executado=True, placa=text, confianca_ocr=confidence)
                if text:
                    self.readings.append(
                        {"placa": text, "frame": number, "segundo": second,
                         "confianca": candidate["confianca_detector"], "caixa": candidate["caixa"]}
                    )
        self.groups.clear()
