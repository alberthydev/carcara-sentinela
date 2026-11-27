import argparse
import json
import os
import re
import subprocess
import sys
import urllib.request
from collections import Counter
from hashlib import file_digest
from pathlib import Path
from time import perf_counter
from typing import TYPE_CHECKING, Any, Callable

if TYPE_CHECKING:
    from passage_tracker import PassageConfig
    from yolo_evidence import YoloPipeline

PLATE_PATTERNS = (
    re.compile(r"^[A-Z]{3}[0-9]{4}$"),
    re.compile(r"^[A-Z]{3}[0-9][A-Z][0-9]{2}$"),
)
MIN_READINGS_FOR_AUTOMATIC_RELEASE = 3
MIN_CONFIDENCE_FOR_AUTOMATIC_RELEASE = 0.75


def _opencv() -> Any:
    try:
        import cv2
    except ImportError as error:
        raise RuntimeError(
            "OpenCV não está instalado. Execute: pip install -r requirements.txt"
        ) from error
    return cv2


def normalizar_placa(texto: str) -> str | None:
    candidato = re.sub(r"[^A-Z0-9]", "", texto.upper())
    if any(pattern.fullmatch(candidato) for pattern in PLATE_PATTERNS):
        return candidato
    return None


def consolidar_deteccoes(
    deteccoes: list[dict[str, Any]],
    minimo_leituras: int = MIN_READINGS_FOR_AUTOMATIC_RELEASE,
    confianca_minima: float = MIN_CONFIDENCE_FOR_AUTOMATIC_RELEASE,
) -> dict[str, Any]:
    if minimo_leituras < 1:
        raise ValueError("minimo_leituras deve ser maior que zero")
    if not 0 < confianca_minima <= 1:
        raise ValueError("confianca_minima deve estar entre zero e um")

    deteccoes_unicas = []
    chaves_vistas: set[tuple[str, int]] = set()
    for detection in deteccoes:
        frame = detection.get("frame")
        chave = (detection["placa"], frame) if isinstance(frame, int) else None
        if chave is not None and chave in chaves_vistas:
            continue
        if chave is not None:
            chaves_vistas.add(chave)
        deteccoes_unicas.append(detection)

    contagem = Counter(detection["placa"] for detection in deteccoes_unicas)
    frequentes = [
        {"placa": placa, "leituras": leituras}
        for placa, leituras in contagem.most_common()
    ]
    if not frequentes:
        return {
            "placa_recomendada": None,
            "confianca_recomendada": 0.0,
            "liberacao_automatica": False,
            "motivo_bloqueio": "nenhuma leitura válida",
            "empate": False,
            "placas_mais_frequentes": [],
        }

    recomendada = frequentes[0]
    total = len(deteccoes_unicas)
    confianca = round(recomendada["leituras"] / total, 3)
    empate = len(frequentes) > 1 and frequentes[1]["leituras"] == recomendada["leituras"]
    motivos = []
    if recomendada["leituras"] < minimo_leituras:
        motivos.append(f"menos de {minimo_leituras} leituras iguais")
    if confianca < confianca_minima:
        motivos.append(f"confiança abaixo de {confianca_minima:.2f}")
    if empate:
        motivos.append("empate entre placas")
    liberacao = not motivos

    return {
        "placa_recomendada": recomendada["placa"],
        "confianca_recomendada": confianca,
        "liberacao_automatica": liberacao,
        "empate": empate,
        "motivo_bloqueio": None if liberacao else "; ".join(motivos),
        "placas_mais_frequentes": frequentes,
    }


def _tesseract(crop: Any, output_format: tuple[str, ...] = ()) -> str:
    cv2 = _opencv()
    height, width = crop.shape[:2]
    if width < 60 or height < 20:
        return ""

    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    enlarged = cv2.resize(gray, (360, 96), interpolation=cv2.INTER_CUBIC)
    _, threshold = cv2.threshold(enlarged, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    encoded, buffer = cv2.imencode(".png", threshold)
    if not encoded:
        return ""

    try:
        result = subprocess.run(
            [
                os.getenv("TESSERACT_CMD", "tesseract"),
                "stdin",
                "stdout",
                "--psm",
                "7",
                "--dpi",
                "300",
                "-c",
                "tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
                *output_format,
            ],
            input=buffer.tobytes(),
            capture_output=True,
            check=False,
            timeout=10,
            env={**os.environ, "OMP_THREAD_LIMIT": "1"},
        )
    except subprocess.TimeoutExpired:
        print("Tesseract excedeu o tempo limite de 10 segundos.", file=sys.stderr)
        return ""
    if result.returncode != 0:
        mensagem = result.stderr.decode("utf-8", errors="ignore").strip()
        print(
            f"Tesseract falhou ({result.returncode}): {mensagem or 'sem diagnóstico'}",
            file=sys.stderr,
        )
        return ""
    return result.stdout.decode("utf-8", errors="ignore")


def _ocr(crop: Any) -> str:
    return _tesseract(crop)


def _ocr_with_confidence(crop: Any) -> tuple[str, float | None]:
    words, scores = [], []
    for line in _tesseract(crop, ("tsv",)).splitlines()[1:]:
        fields = line.split("\t", 11)
        if len(fields) != 12 or fields[0] != "5" or not fields[11].strip():
            continue
        score = float(fields[10])
        words.append(fields[11])
        if 0 <= score <= 100:
            scores.append(score / 100)
    return " ".join(words), sum(scores) / len(scores) if scores else None


def _plate_regions(frame: Any) -> list[tuple[int, int, int, int]]:
    cv2 = _opencv()
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 100, 200)
    contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    regions = []

    for contour in contours:
        x, y, width, height = cv2.boundingRect(contour)
        ratio = width / height if height else 0
        area = width * height
        if 2.0 <= ratio <= 6.5 and area >= 1200 and width >= 60 and height >= 20:
            regions.append((x, y, width, height))

    return regions


def parse_roi(value: str | None, frame_width: int, frame_height: int) -> tuple[int, int, int, int] | None:
    if not value:
        return None
    try:
        x, y, width, height = (int(part) for part in value.split(","))
    except ValueError as error:
        raise ValueError("roi deve ter o formato x,y,largura,altura") from error
    if width <= 0 or height <= 0 or x < 0 or y < 0:
        raise ValueError("roi deve ter dimensões e coordenadas positivas")
    if x + width > frame_width or y + height > frame_height:
        raise ValueError("roi deve estar dentro das dimensões do vídeo")
    return x, y, width, height


def process_video(
    video_path: Path,
    sample_every: int = 5,
    roi: str | None = None,
    minimo_leituras: int = MIN_READINGS_FOR_AUTOMATIC_RELEASE,
    confianca_minima: float = MIN_CONFIDENCE_FOR_AUTOMATIC_RELEASE,
    *,
    pipeline: "YoloPipeline | None" = None,
    profile: bool = False,
    read_ocr: Callable[[Any], tuple[str, float | None]] | None = None,
    normalize: Callable[[str], str | None] = normalizar_placa,
    passage_config: "PassageConfig | None" = None,
) -> dict[str, Any]:
    started_video = perf_counter()
    cv2 = _opencv()
    if sample_every < 1:
        raise ValueError("sample_every deve ser maior que zero")
    if not video_path.is_file():
        raise FileNotFoundError(f"Vídeo não encontrado: {video_path}")

    capture = cv2.VideoCapture(str(video_path))
    if not capture.isOpened():
        raise RuntimeError(f"Não foi possível abrir o vídeo: {video_path}")

    frame_number = 0
    detections: list[dict[str, Any]] = []
    metrics = dict(decodificacao_s=0.0, detector_s=0.0, selecao_s=0.0, ocr_s=0.0,
                   chamadas_ocr=0, frames_amostrados=0)
    evidence = None

    try:
        fps = capture.get(cv2.CAP_PROP_FPS) or 30.0
        frame_width = int(capture.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT))
        roi_bounds = parse_roi(roi, frame_width, frame_height)
        if (passage_config and passage_config.line_x is not None
                and passage_config.line_x + passage_config.deadband_px >= frame_width):
            raise ValueError("A linha de passagem deve ficar dentro do vídeo com margem dos dois lados")
        if pipeline is not None:
            from yolo_evidence import VideoEvidence

            evidence = VideoEvidence(pipeline, read_ocr or _ocr_with_confidence, normalize, metrics)
        while True:
            started = perf_counter()
            success, frame = capture.read()
            metrics["decodificacao_s"] += perf_counter() - started
            if not success:
                break
            if frame_number % sample_every:
                frame_number += 1
                continue

            offset_x, offset_y = 0, 0
            frame_for_detection = frame
            if roi_bounds:
                roi_x, roi_y, roi_width, roi_height = roi_bounds
                frame_for_detection = frame[
                    roi_y : roi_y + roi_height, roi_x : roi_x + roi_width
                ]
                offset_x, offset_y = roi_x, roi_y

            metrics["frames_amostrados"] += 1
            second = round(frame_number / fps, 3)
            if evidence is not None:
                evidence.add(frame_for_detection, frame_number, second, (offset_x, offset_y))
                frame_number += 1
                continue

            started = perf_counter()
            regions = _plate_regions(frame_for_detection)
            metrics["detector_s"] += perf_counter() - started
            for x, y, width, height in regions:
                x += offset_x
                y += offset_y
                started = perf_counter()
                text = normalize(_ocr(frame[y : y + height, x : x + width]))
                metrics["ocr_s"] += perf_counter() - started
                metrics["chamadas_ocr"] += 1
                if text:
                    detections.append(
                        {
                            "placa": text,
                            "frame": frame_number,
                            "segundo": second,
                            "confianca": 0.5,
                            "caixa": {"x": x, "y": y, "largura": width, "altura": height},
                        }
                    )
            frame_number += 1
    finally:
        capture.release()

    if evidence is not None:
        evidence.flush()
        detections = sorted(evidence.readings, key=lambda reading: reading["frame"])
    consolidacao = consolidar_deteccoes(
        detections,
        minimo_leituras=minimo_leituras,
        confianca_minima=confianca_minima,
    )
    result = {
        "video": str(video_path),
        "frames_processados": frame_number,
        "roi": roi_bounds,
        "deteccoes": detections,
        **consolidacao,
    }
    if evidence is not None:
        result.update(
            versao_evidencia=1,
            quadros=evidence.frames,
            liberacao_automatica=False,
            motivo_bloqueio="evidência experimental: confirmação por passagem pendente",
        )
        if passage_config is not None:
            from passage_tracker import PassageTracker

            with video_path.open("rb") as source:
                tracker = PassageTracker(passage_config, file_digest(source, "sha256").hexdigest())
            passages = []
            for frame in evidence.frames:
                passages.extend(tracker.add(frame))
            passages.extend(tracker.finish())
            result["passagens"] = passages
            result["motivo_bloqueio"] = "upload requer confirmação manual"
    if profile:
        result["perfil"] = {**metrics, "total_s": perf_counter() - started_video,
                            "duracao_video_s": frame_number / fps}
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description="Detecta placas em um vídeo local.")
    parser.add_argument("--video", required=True, type=Path)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--api-url", help="URL base da API para enviar o resultado")
    parser.add_argument("--token", help="JWT para autenticação na API")
    parser.add_argument("--every", type=int, default=5, dest="sample_every")
    parser.add_argument("--profile", action="store_true", help="Inclui tempos do pipeline")
    parser.add_argument("--line-x", type=int, help="Linha vertical de passagem para diagnóstico YOLO")
    parser.add_argument("--entry-decreases-x", action="store_true")
    parser.add_argument(
        "--roi",
        help="Região de interesse no formato x,y,largura,altura",
    )
    parser.add_argument(
        "--min-readings",
        type=int,
        default=MIN_READINGS_FOR_AUTOMATIC_RELEASE,
        help="Leituras iguais mínimas para liberação automática",
    )
    parser.add_argument(
        "--min-confidence",
        type=float,
        default=MIN_CONFIDENCE_FOR_AUTOMATIC_RELEASE,
        help="Confiança mínima para liberação automática",
    )
    args = parser.parse_args()

    from yolo_evidence import YoloPipeline
    from passage_tracker import PassageConfig

    pipeline = YoloPipeline.from_env()
    resultado = process_video(
        args.video,
        sample_every=args.sample_every,
        roi=args.roi,
        minimo_leituras=args.min_readings,
        confianca_minima=args.min_confidence,
        pipeline=pipeline,
        profile=args.profile,
        passage_config=PassageConfig("upload", args.line_x, not args.entry_decreases_x) if pipeline else None,
    )
    serializado = json.dumps(resultado, ensure_ascii=False, indent=2)
    if args.output:
        args.output.write_text(serializado + "\n", encoding="utf-8")
    else:
        print(serializado)

    if args.api_url:
        if not args.token:
            parser.error("--token é obrigatório quando --api-url é informado")
        payload = resultado
        if resultado.get("versao_evidencia") == 1:
            payload = {key: resultado[key] for key in (
                "versao_evidencia", "liberacao_automatica", "placa_recomendada",
            )}
        requisicao = urllib.request.Request(
            f"{args.api_url.rstrip('/')}/api/users/visao/evento",
            data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {args.token}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        with urllib.request.urlopen(requisicao, timeout=15) as resposta:
            print(resposta.read().decode("utf-8"))


if __name__ == "__main__":
    main()
