"""Generate presentation frames and fictional inputs using the real worker."""

import argparse
import json
from pathlib import Path

import cv2
import numpy as np

from passage_tracker import PassageConfig, PassageTracker
from plate_worker import process_video
from yolo_evidence import YoloPipeline

VEHICLE_COLOR = (221, 151, 47)
PLATE_COLOR = (88, 204, 236)
WHITE = (245, 250, 253)


def _box(x, y, width, height):
    return dict(x=x, y=y, largura=width, altura=height)


def _slice(item):
    return tuple(item["caixa"][key] for key in ("x", "y", "largura", "altura"))


def _label(image, text, at, color=WHITE, size=0.75):
    cv2.putText(image, text, at, cv2.FONT_HERSHEY_SIMPLEX, size, color, 2, cv2.LINE_AA)


def _save(path, image):
    options = [cv2.IMWRITE_JPEG_QUALITY, 92] if path.suffix == ".jpg" else []
    if not cv2.imwrite(str(path), image, options):
        raise OSError(f"Não foi possível gravar {path}")


def _read_video(path, detection, image_path, title):
    result = process_video(path, pipeline=detection)
    samples = [(frame, plate) for frame in result["quadros"] for plate in frame["placas"]]
    if not samples:
        raise RuntimeError(f"O YOLO não detectou recortes em {path.name}")
    frame, crop = max(samples, key=lambda pair: (
        bool(pair[1]["placa"]), pair[1]["ocr_executado"], pair[1]["confianca_detector"],
    ))
    video = cv2.VideoCapture(str(path))
    try:
        video.set(cv2.CAP_PROP_POS_FRAMES, frame["frame"])
        ok, source = video.read()
        if not ok:
            raise RuntimeError(f"Não foi possível reabrir {path.name}")
    finally:
        video.release()

    x, y, w, h = _slice(crop)
    plate = source[y:y + h, x:x + w].copy()
    for vehicle in frame["veiculos"]:
        a, b, c, d = _slice(vehicle)
        cv2.rectangle(source, (a, b), (a + c, b + d), VEHICLE_COLOR, 5)
    cv2.rectangle(source, (x, y), (x + w, y + h), PLATE_COLOR, 5)
    visual = np.full((530, 1360, 3), (40, 33, 28), dtype=np.uint8)
    visual[66:471, 24:924] = cv2.resize(source, (900, 405), interpolation=cv2.INTER_AREA)
    w_out = 388
    h_out = min(250, round(w_out * h / w))
    visual[138:138 + h_out, 948:948 + w_out] = cv2.resize(plate, (w_out, h_out))
    _label(visual, title, (24, 44), size=0.92)
    _label(visual, "Recorte YOLO", (948, 110))
    reading = crop["placa"] or ("sem leitura" if crop["ocr_executado"] else "sem tentativa")
    _label(visual, f"OCR  {reading}", (948, 185 + h_out), size=0.72)
    _label(visual, f"Quadro {frame['frame']}  /  Detector {crop['confianca_detector']:.0%}",
           (948, 227 + h_out), size=0.62)
    _label(visual, "Carro", (24, 508), VEHICLE_COLOR)
    _label(visual, "Placa", (148, 508), PLATE_COLOR)
    _label(visual, "Clipe de bancada  /  Placa de teste", (430, 508), size=0.68)
    _save(image_path, visual)
    result["video"] = path.name
    return result


def _simulated_passages():
    paired = PassageTracker(PassageConfig("bancada", 155), "demonstracao-pareada")
    pedestrian = PassageTracker(PassageConfig("bancada", 155), "demonstracao-pedestre")
    for index, x in enumerate((70, 87, 104, 121, 138)):
        evidence = dict(frame=index * 3, segundo=index * 0.2, veiculos=[], placas=[])
        for vehicle_id, (y, plate) in enumerate(((25, "ABC1D23"), (140, "DEF1G23"))):
            evidence["veiculos"].append(dict(
                id=vehicle_id, caixa=_box(x, y, 100, 65), confianca_detector=0.97,
            ))
            evidence["placas"].append(dict(
                veiculo_id=vehicle_id, caixa=_box(x + 15, y + 25, 70, 24), placa=plate,
                ocr_executado=True, confianca_detector=0.97, confianca_ocr=0.96,
            ))
        assert not paired.add(evidence)
        assert not pedestrian.add({
            **evidence, "veiculos": [],
            "placas": [{**evidence["placas"][0], "veiculo_id": None}],
        })
    events, ignored = paired.finish(), pedestrian.finish()
    assert [(event["placa"], event["estado"], event["direcao"]) for event in events] == [
        ("ABC1D23", "confirmada", "entrada"), ("DEF1G23", "confirmada", "entrada"),
    ]
    assert ignored == []
    return events, ignored


def _illustrate(image_path, events, pedestrian=False):
    image = np.full((460, 1360, 3), (40, 33, 28), dtype=np.uint8)
    _label(image, "Caixas simuladas", (32, 48), size=0.94)
    cv2.rectangle(image, (32, 78), (880, 424), (60, 53, 46), -1)
    if pedestrian:
        cv2.circle(image, (400, 154), 35, VEHICLE_COLOR, -1)
        cv2.line(image, (400, 197), (400, 308), VEHICLE_COLOR, 55, cv2.LINE_AA)
        for side in (-1, 1):
            cv2.line(image, (400, 294), (400 + 44 * side, 388), VEHICLE_COLOR, 20, cv2.LINE_AA)
            cv2.line(image, (400, 215), (400 + 55 * side, 255), VEHICLE_COLOR, 20, cv2.LINE_AA)
        cv2.rectangle(image, (320, 239), (480, 285), PLATE_COLOR, -1)
        _label(image, "ABC1D23", (334, 272), (40, 33, 28))
        _label(image, "Placa sem carro", (920, 164), PLATE_COLOR, 0.85)
        _label(image, f"{len(events)} eventos", (920, 230), size=1.04)
        _label(image, "Sem novo acesso", (920, 278), size=0.8)
    else:
        cv2.line(image, (452, 90), (452, 412), PLATE_COLOR, 4)
        _label(image, "Linha de passagem", (345, 405), PLATE_COLOR, 0.62)
        for index, event in enumerate(events):
            y = 115 + index * 135
            cv2.rectangle(image, (116, y), (305, y + 70), VEHICLE_COLOR, 3)
            cv2.arrowedLine(image, (322, y + 35), (580, y + 35), WHITE, 4, tipLength=0.12)
            cv2.rectangle(image, (602, y), (791, y + 70), VEHICLE_COLOR, 3)
            _label(image, event["placa"], (622, y + 45), PLATE_COLOR)
            _label(image, event["placa"], (920, y + 30), size=0.88)
            _label(image, "Entrada confirmada", (920, y + 66), VEHICLE_COLOR)
    _save(image_path, image)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("clips", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    pipeline = YoloPipeline.from_env()
    if pipeline is None:
        parser.error("Configure o perfil YOLO e os pesos do ensaio")
    args.output.mkdir(parents=True, exist_ok=True)
    day = _read_video(args.clips / "dia.avi", pipeline, args.output / "captura-dia.jpg",
                      "Reconhecimento com YOLO + Tesseract")
    phone = _read_video(args.clips / "compressao-e-tremor-simulados.avi", pipeline,
                        args.output / "celular-simulado.jpg", "Tremor e perdas de imagem simulados")
    events, ignored = _simulated_passages()
    _illustrate(args.output / "dois-veiculos.png", events)
    _illustrate(args.output / "pedestre.png", ignored, pedestrian=True)
    data = {
        "revisao.json": {"video": "revisão sintética", "versao_evidencia": 1,
                         "placa_recomendada": "ABC1234", "confianca_recomendada": 0.5,
                         "liberacao_automatica": False},
        "entrada-um.json": events[0],
        "entrada-dois.json": events[1],
        "pedestre.json": ignored,
        "inferencia.json": {"dia": day, "celular_simulado": phone},
    }
    for name, payload in data.items():
        (args.output / name).write_text(json.dumps(payload, indent=2, ensure_ascii=True) + "\n",
                                        encoding="utf-8")
    print(f"Dia: {day['placa_recomendada'] or 'sem leitura'}")
    print(f"Celular simulado: {phone['placa_recomendada'] or 'sem leitura'}")
    print(f"Passagens confirmadas simuladas: {len(events)}. Eventos do pedestre: {len(ignored)}.")


if __name__ == "__main__":
    main()
