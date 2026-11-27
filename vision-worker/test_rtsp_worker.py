import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from threading import Event, Thread
from time import monotonic

import numpy as np
import pytest

import rtsp_worker
from passage_tracker import PassageConfig, PassageTracker
from rtsp_worker import Camera, RtspService, api_delivery, load_cameras, open_rtsp
from yolo_detector import Detection
from yolo_evidence import YoloPipeline


class _Source:
    def __init__(self, positions=(), opened=True):
        self.positions = iter(positions)
        self.opened = opened
        self.released = Event()

    def isOpened(self):
        return self.opened

    def read(self):
        signal = next(self.positions, None)
        if signal is None:
            return False, None
        return True, np.full((180, 240, 3), signal, dtype=np.uint8)

    def release(self):
        self.released.set()


class _Vehicles:
    def detect(self, frame):
        x = int(frame[0, 0, 0])
        return [Detection((x, 20, 80, 100), "car", 0.99)] if x else []


class _Plates:
    def detect(self, frame):
        x = int(frame[0, 0, 0])
        return [Detection((x + 5, 80, 70, 25), "license_plate", 0.99)] if x else []


def _pipeline():
    return YoloPipeline(_Vehicles(), _Plates(), 1, 1)


def _camera():
    return Camera(PassageConfig("portao", 100), "rtsp://localhost/fixture", 1)


def test_leitura_continua_expira_passagem_e_expede_um_evento(monkeypatch):
    seconds = iter(index / 4 for index in range(100))
    monkeypatch.setattr(rtsp_worker, "monotonic", lambda: next(seconds))
    camera = _camera()
    service = RtspService([camera], _pipeline(), lambda _: "conhecido",
                          read_ocr=lambda _: ("ABC1234", 0.94))
    tracker = PassageTracker(camera.passage, "primeira-conexao")
    assert service._read(camera, _Source([25, 42, 61, 77, 92] + [0] * 7), tracker)
    assert not tracker.finish()
    event, _ = service.queue.get_nowait()
    assert event["placa"] == "ABC1234"
    assert event["direcao"] == "entrada"
    assert service.status()["quadros_amostrados"] == {"portao": 12}
    assert service.queue.empty()


def test_fila_limitada_reenvia_o_mesmo_evento_e_contabiliza_descarte():
    requests = []

    def send(event):
        requests.append(event.copy())
        if len(requests) < 3:
            raise OSError("timeout simulado")
        return "conhecido"

    camera = _camera()
    service = RtspService([camera], _pipeline(), send, queue_size=1, retry_start=0)
    decision = {"evento_id": "mesmo-id", "estado": "confirmada"}
    service._offer(decision)
    service._offer({"evento_id": "fila-cheia", "estado": "confirmada"})
    service._offer({"estado": "revisao"})
    service._submit(*service.queue.get_nowait())
    assert requests == [decision, decision, decision]
    service._submit(decision, monotonic() - 61)
    assert requests == [decision, decision, decision]
    assert service.status()["contadores"] == {
        "enfileirados": 1, "descartados_fila_cheia": 1, "revisao_worker": 1,
        "falhas_entrega": 2, "conhecido": 1, "descartados_entrega": 1,
    }


def test_falha_de_captura_fecha_fonte_e_reconecta():
    primeira = _Source(opened=False)
    segunda = _Source([25])
    camera = _camera()
    attempts = iter((primeira, segunda))
    service = RtspService([camera], _pipeline(), lambda _: "conhecido",
                          capture=lambda _: next(attempts), reconnect_start=0.001,
                          read_ocr=lambda _: ("ABC1234", 0.94))
    thread = Thread(target=service._capture, args=(camera,))
    thread.start()
    try:
        assert primeira.released.wait(1)
        assert segunda.released.wait(1)
    finally:
        service.stop.set()
        thread.join(1)
    assert not thread.is_alive()
    assert service.status()["cameras"] == {"portao": "stopped"}
    assert service.queue.empty()


def test_configuracao_valida_camera_sem_expor_credenciais(tmp_path):
    path = tmp_path / "cameras.json"
    secret = "senha-ficticia"
    row = {"id": "portao", "url": f"rtsp://usuario:{secret}@localhost/stream",
           "line_x": 100, "entry": "left"}
    path.write_text(json.dumps([row]), encoding="utf-8")
    [camera] = load_cameras(path)
    assert secret not in repr(camera)
    assert camera.passage.entry_increases_x is False
    path.write_text(json.dumps([row, row]), encoding="utf-8")
    with pytest.raises(ValueError, match="posição 2") as info:
        load_cameras(path)
    assert secret not in str(info.value)


def test_decodifica_fonte_rtsp_de_bancada():
    url = os.getenv("VISION_TEST_RTSP_URL")
    if not url:
        pytest.skip("Configure um stream RTSP de bancada autorizado")
    cap = open_rtsp(url)
    try:
        assert cap.isOpened()
        frames = [cap.read() for _ in range(6)]
        assert all(ok and frame.shape == (576, 1280, 3) for ok, frame in frames)
        assert not np.array_equal(frames[0][1], frames[-1][1])
    finally:
        cap.release()


def test_reenvio_http_apos_503_preserva_corpo_e_credencial():
    if not os.getenv("VISION_TEST_RTSP_URL"):
        pytest.skip("O perfil de bancada também autoriza o servidor HTTP em loopback")
    requests = []

    class Api(BaseHTTPRequestHandler):
        def do_POST(self):
            body = self.rfile.read(int(self.headers["Content-Length"]))
            requests.append((self.path, self.headers["Authorization"], json.loads(body)))
            self.send_response(503 if len(requests) == 1 else 200)
            self.end_headers()
            if len(requests) > 1:
                self.wfile.write(b'{"status":"conhecido","repetido":true}')

    with HTTPServer(("127.0.0.1", 0), Api) as server:
        thread = Thread(target=server.serve_forever)
        thread.start()
        try:
            credential = "fixture" * 6
            send = api_delivery(f"http://127.0.0.1:{server.server_port}", credential)
            service = RtspService([_camera()], _pipeline(), send, retry_start=0)
            event = {"evento_id": "mesmo-id", "estado": "confirmada"}
            service._submit(event, monotonic())
            assert requests == [("/api/users/visao/passagem", "Bearer " + credential, event)] * 2
            assert service.status()["contadores"] == {"falhas_entrega": 1, "conhecido": 1}
        finally:
            server.shutdown()
            thread.join(2)
