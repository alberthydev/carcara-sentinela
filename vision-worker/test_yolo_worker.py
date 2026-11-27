import json
import os
from pathlib import Path
from threading import Thread
from urllib.request import Request, urlopen

import cv2
import numpy as np
import pytest

import plate_worker
from benchmark import _evaluate
from benchmark_ocr import normalize_with_positions
from server import VisionServer
from yolo_detector import Detection, OnnxDetector
from yolo_evidence import YoloPipeline


class FakeDetector:
    def __init__(self, detections):
        self.detections = detections

    def detect(self, frame):
        return self.detections


def make_video(path):
    writer = cv2.VideoWriter(str(path), cv2.VideoWriter_fourcc(*"MJPG"), 10, (320, 160))
    assert writer.isOpened()
    try:
        for background in (0, 60, 120, 180, 240):
            writer.write(np.full((160, 320, 3), background, dtype=np.uint8))
    finally:
        writer.release()


def test_video_preserva_coordenadas_e_seleciona_ocr_por_veiculo(tmp_path, monkeypatch):
    path = tmp_path / "video.avi"
    make_video(path)
    vehicles = FakeDetector([
        Detection((0, 0, 110, 110), "car", 0.9),
        Detection((115, 0, 110, 110), "truck", 0.8),
    ])
    plates = FakeDetector([
        Detection((15, 55, 70, 21), "license_plate", 0.8),
        Detection((130, 55, 70, 21), "license_plate", 0.8),
        Detection((15, 90, 40, 10), "license_plate", 0.7),
        Detection((40, 112, 70, 21), "license_plate", 0.9),
    ])
    reads = iter([("ABC1234", 0.92), ("ABC1D23", 0.8)] * 2)
    monkeypatch.setattr(plate_worker, "_ocr_with_confidence", lambda _: next(reads))
    result = plate_worker.process_video(path, sample_every=2, roi="10,15,240,135",
                                        pipeline=YoloPipeline(vehicles, plates, 2, 1), profile=True)
    assert result["frames_processados"] == 5
    assert result["versao_evidencia"] == 1
    assert result["liberacao_automatica"] is False
    assert result["perfil"]["chamadas_ocr"] == 4
    assert [frame["frame"] for frame in result["quadros"]] == [0, 2, 4]
    frame0 = result["quadros"][0]
    assert frame0["placas"][0]["caixa"] == {"x": 25, "y": 70, "largura": 70, "altura": 21}
    assert frame0["placas"][0]["confianca_ocr"] == 0.92
    assert [plate["veiculo_id"] for plate in frame0["placas"]] == [0, 1, 0, None]
    assert not frame0["placas"][2]["ocr_executado"]
    assert not frame0["placas"][3]["ocr_executado"]
    passages = [
        dict(inicio=0, fim=4, caixa=[10, 15, 110, 110], placa="ABC1234"),
        dict(inicio=0, fim=4, caixa=[125, 15, 110, 110], placa="ABC1D23"),
    ]
    assert all(passage["exata"] and passage["veiculo_detectado"]
               for passage in _evaluate(result, passages))


def test_placa_sem_veiculo_ou_com_associacao_ambigua_nao_roda_ocr(tmp_path, monkeypatch):
    path = tmp_path / "video.avi"
    make_video(path)
    vehicles = FakeDetector([Detection((0, 0, 120, 100), "car", 0.9),
                             Detection((10, 0, 100, 100), "bus", 0.8)])
    plates = FakeDetector([Detection((15, 10, 70, 21), "license_plate", 0.8),
                           Detection((150, 10, 70, 21), "license_plate", 0.8)])
    monkeypatch.setattr(plate_worker, "_ocr_with_confidence", lambda _: pytest.fail("OCR inesperado"))
    outcome = plate_worker.process_video(path, pipeline=YoloPipeline(vehicles, plates))
    assert outcome["deteccoes"] == []
    assert outcome["placa_recomendada"] is None
    assert all(candidate["veiculo_id"] is None for candidate in outcome["quadros"][0]["placas"])


def test_yolox_filtra_classes_e_decodifica_caixa():
    detector = object.__new__(OnnxDetector)
    detector.kind, detector.confidence = "vehicle", 0.25
    detector.grid = np.asarray([[5, 5], [5, 6]], dtype=np.float32)
    detector.strides = np.asarray([[8], [8]], dtype=np.float32)
    output = np.zeros((1, 2, 85), dtype=np.float32)
    output[0, :, 4] = 0.8
    output[0, 0, 7] = 0.75  # car
    output[0, 1, 5] = 0.9   # person
    boxes, classes, scores = detector.decode(output)
    assert boxes.tolist() == [[36, 36, 8, 8]]
    assert classes.tolist() == [2]
    assert scores.tolist() == pytest.approx([0.6])


def test_yolov8_placa_valida_formato_e_confianca():
    detector = object.__new__(OnnxDetector)
    detector.kind, detector.confidence = "plate", 0.25
    output = np.array([[[12, 20], [10, 10], [8, 3], [4, 4], [0.8, 0.1]]],
                      dtype=np.float32)
    boxes, classes, scores = detector.decode(output)
    assert boxes.tolist() == [[8, 8, 8, 4]]
    assert classes.tolist() == [0]
    assert scores.tolist() == pytest.approx([0.8])
    with pytest.raises(ValueError, match="incompatível"):
        detector.decode(output.transpose(0, 2, 1))


def test_correcao_posicional_preserva_validos_e_rejeita_empate():
    assert normalize_with_positions("ABC1D23") == "ABC1D23"
    assert normalize_with_positions("ABCIZ34") is None  # ABC1234 ou ABC1Z34
    assert normalize_with_positions("ABC1D2I") == "ABC1D21"


def test_modo_yolo_exige_os_dois_pesos(monkeypatch):
    monkeypatch.setenv("VISION_DETECTOR", "yolo")
    monkeypatch.delenv("VISION_PLATE_MODEL", raising=False)
    with pytest.raises(ValueError, match="VISION_PLATE_MODEL"):
        YoloPipeline.from_env()


def test_onnx_reais_com_veiculo_e_placa_no_mesmo_quadro():
    video = os.getenv("VISION_SMOKE_VIDEO")
    if not video:
        pytest.skip("Configure os pesos documentados e VISION_SMOKE_VIDEO")
    pipeline = YoloPipeline.from_env()
    assert pipeline is not None
    result = _upload(Path(video), pipeline)
    assert any(frame["veiculos"] and frame["placas"] for frame in result["quadros"])
    assert result["liberacao_automatica"] is False
    assert result["imagem_placa"].startswith("data:image/jpeg;base64,")
    assert len(result["imagem_placa"]) <= 80_023


def test_upload_legado_preserva_formato(tmp_path):
    if not os.getenv("VISION_SMOKE_VIDEO"):
        pytest.skip("Configure VISION_SMOKE_VIDEO para o teste HTTP local")
    path = tmp_path / "baseline.avi"
    make_video(path)
    result = _upload(path, None)
    assert result["frames_processados"] == 5
    assert result["deteccoes"] == []
    assert result["placa_recomendada"] is None
    assert "versao_evidencia" not in result
    assert "imagem_placa" not in result


def _upload(path, pipeline):
    with VisionServer(("127.0.0.1", 0), pipeline) as server:
        thread = Thread(target=server.serve_forever)
        thread.start()
        try:
            request = Request(
                f"http://127.0.0.1:{server.server_port}/process",
                data=path.read_bytes(),
                headers={"Content-Type": "application/octet-stream", "X-Video-Name": path.name},
            )
            with urlopen(request, timeout=30) as response:
                assert response.status == 200
                return json.load(response)
        finally:
            server.shutdown()
            thread.join()
