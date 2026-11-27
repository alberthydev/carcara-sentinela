"""Run one profile against a local, labeled video manifest."""

import argparse
import hashlib
import json
import os
import platform
import subprocess
from collections import Counter
from pathlib import Path
from time import perf_counter

import cv2
import numpy as np

from plate_worker import normalizar_placa, process_video
from yolo_evidence import YoloPipeline, _iou, _overlap
from benchmark_ocr import PaddleOcr, normalize_with_positions


def _box(item):
    return tuple(item["caixa"][key] for key in ("x", "y", "largura", "altura"))


def _reference(passage, frame):
    if passage["inicio"] <= frame <= passage["fim"]:
        return passage.get("caixas", {}).get(str(frame), passage.get("caixa"))
    return None


def _distance(expected, actual):
    previous = list(range(len(actual) + 1))
    for index, expected_char in enumerate(expected, 1):
        current = [index]
        for column, actual_char in enumerate(actual, 1):
            current.append(min(current[-1] + 1, previous[column] + 1,
                               previous[column - 1] + (expected_char != actual_char)))
        previous = current
    return previous[-1]


def _evaluate(result, passages):
    votes = [Counter() for _ in passages]
    vehicle_seen = [False for _ in passages]
    for frame in result.get("quadros", []):
        matches = []
        for index, passage in enumerate(passages):
            reference = _reference(passage, frame["frame"])
            if reference:
                matches.extend((_iou(reference, _box(vehicle)), index, vehicle["id"])
                               for vehicle in frame["veiculos"])
        used_passages, used_vehicles = set(), set()
        for overlap, index, vehicle in sorted(matches, reverse=True):
            if overlap >= 0.5 and index not in used_passages and vehicle not in used_vehicles:
                vehicle_seen[index] = True
                used_passages.add(index)
                used_vehicles.add(vehicle)

    counted = set()
    for reading in result["deteccoes"]:
        frame = reading["frame"]
        box = _box(reading)
        owners = []
        for index, passage in enumerate(passages):
            reference = _reference(passage, frame)
            if reference and _overlap(reference, box) >= 0.8 * box[2] * box[3]:
                owners.append(index)
        if len(owners) == 1:
            index = owners[0]
            key = index, frame, reading["placa"]
            if key not in counted:
                votes[index][reading["placa"]] += 1
                counted.add(key)

    observations = []
    for passage, counts, seen in zip(passages, votes, vehicle_seen):
        ranking = counts.most_common(2)
        reading = ranking[0][0] if ranking and (len(ranking) == 1 or ranking[0][1] > ranking[1][1]) else ""
        expected = passage["placa"]
        observations.append(dict(exata=reading == expected, sem_leitura=not reading,
                                 erros=_distance(expected, reading), caracteres=len(expected),
                                 veiculo_detectado=seen if "quadros" in result else None))
    return observations


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("manifest", type=Path)
    parser.add_argument("--every", type=int, default=5)
    parser.add_argument("--use-roi", action="store_true")
    parser.add_argument("--threads", type=int, default=1)
    parser.add_argument("--repeat", type=int, default=3)
    parser.add_argument("--neural-ocr-model", type=Path)
    parser.add_argument("--correct-positions", action="store_true")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    if min(args.repeat, args.every, args.threads) < 1:
        parser.error("repeat, every e threads devem ser positivos")
    cv2.setNumThreads(args.threads)
    clips = json.loads(args.manifest.read_text(encoding="utf-8"))
    if not clips:
        parser.error("Informe pelo menos um vídeo")
    for clip in clips:
        for passage in clip["passagens"]:
            if not passage.get("placa") or normalizar_placa(passage["placa"]) != passage["placa"]:
                parser.error("Use placas normalizadas no manifesto")
            if not (passage.get("caixa") or passage.get("caixas")):
                parser.error("Anote caixas dos veículos para medir acerto por passagem")

    started = perf_counter()
    pipeline = YoloPipeline.from_env()
    if args.neural_ocr_model and not pipeline:
        parser.error("OCR neural requer VISION_DETECTOR=yolo para comparar os mesmos recortes")
    read_ocr = PaddleOcr(args.neural_ocr_model) if args.neural_ocr_model else None
    startup = perf_counter() - started
    tesseract = subprocess.check_output([os.getenv("TESSERACT_CMD", "tesseract"), "--version"],
                                       text=True).splitlines()[0]
    observations, runs, scenarios = [], [], []
    negative_clips = 0
    negative_reads = 0
    negative_releases = 0
    normalize = normalize_with_positions if args.correct_positions else normalizar_placa
    for clip in clips:
        for repeat in range(args.repeat):
            result = process_video(args.manifest.parent / clip["video"], sample_every=args.every,
                                   roi=clip.get("roi") if args.use_roi else None,
                                   pipeline=pipeline, profile=True, read_ocr=read_ocr, normalize=normalize)
            runs.append(result["perfil"])
            if repeat == 0:
                evaluated = _evaluate(result, clip["passagens"])
                observations.extend(evaluated)
                scenarios.append(dict(cenario=clip["cenario"], passagens=evaluated,
                                      leituras=len(result["deteccoes"]),
                                      candidatos_placa=sum(len(frame["placas"])
                                                          for frame in result.get("quadros", []))))
                if not clip["passagens"]:
                    negative_clips += 1
                    negative_reads += bool(result["deteccoes"])
                    negative_releases += result["liberacao_automatica"]

    chars = sum(item["caracteres"] for item in observations)
    report = dict(
        plataforma=platform.platform(), cpu=platform.processor(), cpus=os.cpu_count(),
        python=platform.python_version(), opencv=cv2.__version__, tesseract=tesseract,
        gpu_opencl=cv2.ocl.Device_getDefault().name() if os.getenv("VISION_YOLO_DEVICE") == "opencl" else None,
        perfil={key: value for key, value in os.environ.items()
                if key.startswith(("VISION_YOLO_", "VISION_OCR_", "VISION_PLATE_", "VISION_VEHICLE_"))
                and not key.endswith("_MODEL")},
        pesos={kind: hashlib.sha256(Path(os.environ[f"VISION_{kind}_MODEL"]).read_bytes()).hexdigest()
               for kind in ("VEHICLE", "PLATE")} if pipeline else {},
        manifesto_sha256=hashlib.sha256(args.manifest.read_bytes()).hexdigest(),
        ocr_sha256=hashlib.sha256(args.neural_ocr_model.read_bytes()).hexdigest()
        if args.neural_ocr_model else None,
        correcao_posicional=args.correct_positions,
        detector="yolo" if pipeline else "opencv", carga_modelos_s=startup,
        every=args.every, roi=args.use_roi, threads=args.threads, repeticoes=args.repeat,
        videos=len(clips), passagens=len(observations),
        acertos_exatos=sum(item["exata"] for item in observations),
        sem_leitura=sum(item["sem_leitura"] for item in observations),
        correspondencias_incorretas=sum(not item["exata"] and not item["sem_leitura"]
                                        for item in observations),
        cer=sum(item["erros"] for item in observations) / chars if chars else None,
        veiculos_detectados=sum(item["veiculo_detectado"] for item in observations) if pipeline else None,
        negativos=negative_clips, negativos_com_leitura=negative_reads,
        negativos_com_liberacao=negative_releases,
        latencia_p50_s=float(np.percentile([run["total_s"] for run in runs], 50)),
        latencia_p95_s=float(np.percentile([run["total_s"] for run in runs], 95)),
        total_etapas={key: sum(run[key] for run in runs) for key in runs[0]},
        cenarios=scenarios,
    )
    serialized = json.dumps(report, indent=2, ensure_ascii=True)
    if args.output:
        args.output.write_text(serialized + "\n", encoding="utf-8")
    else:
        print(serialized)


if __name__ == "__main__":
    main()
