"""Optional OCR experiments local to the benchmark."""

import re

import cv2
import numpy as np

from plate_worker import normalizar_placa


class PaddleOcr:
    def __init__(self, path):
        import onnxruntime as ort

        options = ort.SessionOptions()
        options.intra_op_num_threads = 1
        options.inter_op_num_threads = 1
        self.session = ort.InferenceSession(str(path), options, providers=["CPUExecutionProvider"])
        self.input_name = self.session.get_inputs()[0].name
        metadata = self.session.get_modelmeta().custom_metadata_map
        self.alphabet = ["", *metadata["character"].splitlines(), " "]
        self(np.zeros((48, 160, 3), dtype=np.uint8))

    def __call__(self, crop):
        height, width = crop.shape[:2]
        scaled_width = min(320, max(1, round(width * 48 / height)))
        image = cv2.resize(crop, (scaled_width, 48)).astype(np.float32) / 127.5 - 1
        padded = np.zeros((1, 3, 48, 320), dtype=np.float32)
        padded[0, :, :, :scaled_width] = image.transpose(2, 0, 1)
        scores = self.session.run(None, {self.input_name: padded})[0][0]
        if scores.shape[-1] != len(self.alphabet):
            raise ValueError("O alfabeto CTC não corresponde à saída deste ONNX")
        letters, confidence = [], []
        previous = 0
        for row in scores:
            index = int(row.argmax())
            if index and index != previous:
                letters.append(self.alphabet[index])
                confidence.append(float(row[index]))
            previous = index
        return "".join(letters), float(np.mean(confidence)) if confidence else None


def normalize_with_positions(text):
    valid = normalizar_placa(text)
    if valid:
        return valid
    text = re.sub(r"[^A-Z0-9]", "", text.upper())
    if len(text) != 7:
        return None
    to_digit = str.maketrans("OILZSBG", "0112586")
    to_letter = str.maketrans("012586", "OIZSBG")
    letters = (0, 1, 2)
    alternatives = set()
    for positions in (letters, (*letters, 4)):
        guess = "".join(char.translate(to_letter if index in positions else to_digit)
                        for index, char in enumerate(text))
        if normalizar_placa(guess):
            alternatives.add(guess)
    return alternatives.pop() if len(alternatives) == 1 else None
