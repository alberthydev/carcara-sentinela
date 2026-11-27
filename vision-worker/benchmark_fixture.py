"""Generate local benchmark clips from the attributed Fiat photo and fictional plates."""

import argparse
import json
from pathlib import Path

import cv2
import numpy as np


def _plate(frame, x, y, width, text):
    height = round(width / 3)
    cv2.rectangle(frame, (x, y), (x + width, y + height), (0, 0, 0), -1)
    cv2.rectangle(frame, (x + 2, y + 2), (x + width - 2, y + height - 2), (242, 242, 242), -1)
    top = y + 3
    if text[4].isalpha():
        top += round(height * 0.2)
        cv2.rectangle(frame, (x + 2, y + 2), (x + width - 2, top), (125, 50, 25), -1)
    font = cv2.FONT_HERSHEY_SIMPLEX
    scale = cv2.getFontScaleFromHeight(font, round(height * 0.55), 2)
    (text_width, text_height), _ = cv2.getTextSize(text, font, scale, 2)
    if text_width > width - 6:
        scale *= (width - 6) / text_width
        (text_width, text_height), _ = cv2.getTextSize(text, font, scale, 2)
    cv2.putText(frame, text, (x + (width - text_width) // 2, top + text_height + 1),
                font, scale, (15, 15, 15), 2, cv2.LINE_AA)


def generate(photo, output):
    output.mkdir(parents=True, exist_ok=True)
    descriptions = [
        ("dia", [(315, 60, 640, "ABC1234")], "290,35,720,500"),
        ("baixa-luz-simulada", [(315, 60, 640, "ABC1D23")], "290,35,720,500"),
        ("compressao-e-tremor-simulados", [(315, 60, 640, "ABC1234")], "285,30,740,510"),
        ("dois-veiculos", [(40, 75, 576, "ABC1234"), (650, 75, 576, "ABC1D23")], "20,50,1240,460"),
        ("placa-isolada", [], "450,200,380,160"),
    ]
    clips = []
    for scenario, cars, roi in descriptions:
        filename = f"{scenario}.avi"
        passages = [dict(inicio=0, fim=14, placa=text, caixas={}) for _, _, _, text in cars]
        video = cv2.VideoWriter(str(output / filename), cv2.VideoWriter_fourcc(*"MJPG"), 15, (1280, 576))
        if not video.isOpened():
            raise RuntimeError("O codec MJPG não está disponível")
        try:
            for index in range(15):
                frame = np.full((576, 1280, 3), 92, dtype=np.uint8)
                dx = index - 7
                dy = index % 4 - 2 if scenario == "compressao-e-tremor-simulados" else 0
                for passage, (x, y, width, text) in zip(passages, cars):
                    x, y = x + dx, y + dy
                    height = round(width * photo.shape[0] / photo.shape[1])
                    frame[y:y + height, x:x + width] = cv2.resize(photo, (width, height))
                    _plate(frame, x + round(width * 0.77), y + round(height * 0.67),
                           round(width * 0.185), text)
                    passage["caixas"][str(index)] = [x + round(width * 0.035), y + round(height * 0.035),
                                                    round(width * 0.92), round(height * 0.92)]
                if scenario == "baixa-luz-simulada":
                    frame = cv2.convertScaleAbs(frame, alpha=0.38)
                if scenario == "compressao-e-tremor-simulados":
                    _, encoded = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 24])
                    frame = cv2.imdecode(encoded, cv2.IMREAD_COLOR)
                if not cars:
                    _plate(frame, 560 + dx, 250, 140, "ABC1234")
                video.write(frame)
        finally:
            video.release()
        clips.append(dict(video=filename, cenario=scenario, roi=roi, passagens=passages))
    (output / "manifest.json").write_text(json.dumps(clips, indent=2), encoding="utf-8")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("photo", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    photo = cv2.imread(str(args.photo))
    if photo is None or photo.shape[:2] != (1173, 1740):
        parser.error("Informe a foto Fiat 500 original (1740 x 1173), descrita no README")
    generate(photo, args.output)
