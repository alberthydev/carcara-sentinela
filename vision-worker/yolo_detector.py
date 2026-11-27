"""Inference for raw YOLOX COCO and single-class YOLOv8 ONNX exports."""

from dataclasses import dataclass
from pathlib import Path
from threading import Lock

import cv2
import numpy as np

VEHICLES = {2: "car", 3: "motorcycle", 5: "bus", 7: "truck"}


@dataclass(frozen=True)
class Detection:
    box: tuple[int, int, int, int]
    label: str
    confidence: float


class OnnxDetector:
    def __init__(self, path: Path, size: int, kind: str, device: str, confidence: float):
        if path.suffix.lower() != ".onnx" or not path.is_file():
            raise ValueError(f"Informe um arquivo ONNX local para {kind}: {path}")
        if size < 32 or size % 32 or not 0 < confidence <= 1:
            raise ValueError("Use resolução múltipla de 32 e confiança entre zero e um")
        self.size, self.kind, self.confidence = size, kind, confidence
        self.lock = Lock()
        if device == "cpu":
            backend, target = cv2.dnn.DNN_BACKEND_OPENCV, cv2.dnn.DNN_TARGET_CPU
        elif device == "opencl":
            backend, target = cv2.dnn.DNN_BACKEND_OPENCV, cv2.dnn.DNN_TARGET_OPENCL
            cv2.ocl.setUseOpenCL(True)
            if (target not in cv2.dnn.getAvailableTargets(backend)
                    or not cv2.ocl.Device_getDefault().type() & cv2.ocl.Device_TYPE_GPU):
                raise ValueError("OpenCL DNN exige um dispositivo GPU habilitado")
        elif device == "cuda":
            backend, target = cv2.dnn.DNN_BACKEND_CUDA, cv2.dnn.DNN_TARGET_CUDA
            if target not in cv2.dnn.getAvailableTargets(backend):
                raise ValueError("CUDA exige uma compilação OpenCV DNN com suporte CUDA")
        else:
            raise ValueError("Dispositivo YOLO deve ser cpu, opencl ou cuda")
        self.net = cv2.dnn.readNetFromONNX(str(path))
        self.net.setPreferableBackend(backend)
        self.net.setPreferableTarget(target)

        if kind == "vehicle":
            grids, strides = [], []
            for stride in (8, 16, 32):
                y, x = np.indices((size // stride, size // stride))
                grids.append(np.column_stack((x.ravel(), y.ravel())))
                strides.extend([stride] * x.size)
            self.grid = np.concatenate(grids).astype(np.float32)
            self.strides = np.asarray(strides, dtype=np.float32)[:, None]
        self.detect(np.zeros((size, size, 3), dtype=np.uint8))

    def detect(self, frame: np.ndarray) -> list[Detection]:
        height, width = frame.shape[:2]
        scale = self.size / max(height, width)
        resized = cv2.resize(frame, (max(1, int(width * scale)), max(1, int(height * scale))))
        scaled_height, scaled_width = resized.shape[:2]
        vehicle = self.kind == "vehicle"
        xpad = 0 if vehicle else (self.size - scaled_width) // 2
        ypad = 0 if vehicle else (self.size - scaled_height) // 2
        canvas = np.full((self.size, self.size, 3), 114, dtype=np.uint8)
        canvas[ypad:ypad + scaled_height, xpad:xpad + scaled_width] = resized
        blob = cv2.dnn.blobFromImage(canvas, 1.0 if vehicle else 1 / 255, swapRB=not vehicle)
        with self.lock:
            self.net.setInput(blob)
            output = self.net.forward().copy()
        boxes, classes, scores = self.decode(output)
        # Vehicle classes are mutually exclusive. Suppress duplicate boxes across classes.
        keep = cv2.dnn.NMSBoxes(boxes.tolist(), scores.tolist(), 0.0, 0.45) if len(boxes) else []
        detections = []
        sx, sy = scaled_width / width, scaled_height / height
        for index in keep:
            x, y, w, h = boxes[index]
            left = max(0, int(np.floor((x - xpad) / sx)))
            top = max(0, int(np.floor((y - ypad) / sy)))
            right = min(width, int(np.ceil((x + w - xpad) / sx)))
            bottom = min(height, int(np.ceil((y + h - ypad) / sy)))
            if right > left and bottom > top:
                label = VEHICLES[int(classes[index])] if vehicle else "license_plate"
                detections.append(Detection((left, top, right - left, bottom - top),
                                            label, float(scores[index])))
        return detections

    def decode(self, output: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
        if self.kind == "vehicle":
            if output.shape != (1, len(self.grid), 85):
                raise ValueError(f"Saída YOLOX COCO incompatível: {output.shape}")
            rows = output[0]
            classes = rows[:, 5:].argmax(axis=1)
            scores = rows[:, 4] * rows[np.arange(len(rows)), 5 + classes]
            mask = np.isin(classes, list(VEHICLES)) & (scores >= self.confidence)
            boxes = rows[mask, :4].copy()
            boxes[:, :2] = (boxes[:, :2] + self.grid[mask]) * self.strides[mask]
            boxes[:, 2:] = np.exp(boxes[:, 2:]) * self.strides[mask]
        else:
            if output.ndim != 3 or output.shape[0] != 1 or output.shape[1] != 5:
                raise ValueError(f"Saída YOLOv8 de placa incompatível: {output.shape}")
            rows = output[0].T
            scores = rows[:, 4]
            classes = np.zeros(len(rows), dtype=int)
            mask = scores >= self.confidence
            boxes = rows[mask, :4].copy()
        boxes[:, :2] -= boxes[:, 2:] / 2
        valid = np.isfinite(boxes).all(axis=1) & (boxes[:, 2:] > 0).all(axis=1)
        scores = scores[mask]
        valid &= np.isfinite(scores) & (scores <= 1)
        return boxes[valid], classes[mask][valid], scores[valid]
