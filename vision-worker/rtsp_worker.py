"""Continuous capture and bounded delivery of Layer 2 passage decisions."""

from collections import Counter
from dataclasses import dataclass, field
from http.client import HTTPException
import json
import os
from pathlib import Path
from queue import Empty, Full, Queue
import re
from threading import Event, Lock, Thread
from time import monotonic
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener
from uuid import uuid4

import cv2

from passage_tracker import PassageConfig, PassageTracker
from plate_worker import _ocr_with_confidence, normalizar_placa, parse_roi
from yolo_evidence import VideoEvidence


@dataclass(frozen=True)
class Camera:
    passage: PassageConfig
    url: str = field(repr=False)
    every: int = 5
    roi: str | None = None


def load_cameras(path: Path) -> list[Camera]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(raw, list) or not raw:
        raise ValueError("Configure pelo menos uma fonte RTSP")
    cameras = []
    ids = set()
    for index, item in enumerate(raw):
        try:
            camera_id, url = item["id"], item["url"]
            line, entry = item["line_x"], item["entry"]
            every = item.get("every", 5)
            roi = item.get("roi")
            address = urlsplit(url)
            if (not re.fullmatch(r"[a-zA-Z0-9_.-]{1,64}", camera_id) or camera_id in ids
                    or address.scheme not in {"rtsp", "rtsps"} or not address.hostname
                    or type(line) is not int or type(every) is not int or every < 1
                    or entry not in {"right", "left"} or (roi is not None and not isinstance(roi, str))):
                raise ValueError
            cameras.append(Camera(PassageConfig(camera_id, line, entry == "right"), url, every, roi))
            ids.add(camera_id)
        except (KeyError, TypeError, ValueError, AttributeError):
            raise ValueError(f"Configuração RTSP inválida na posição {index + 1}") from None
    return cameras


class _NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def api_delivery(base_url: str, token: str):
    address = urlsplit(base_url)
    if (address.scheme not in {"http", "https"} or not address.hostname or address.username
            or address.password or address.query or address.fragment or len(token) < 32):
        raise ValueError("Configure VISION_API_URL e a credencial dedicada VISION_INGEST_TOKEN")
    endpoint = base_url.rstrip("/") + "/api/users/visao/passagem"
    opener = build_opener(_NoRedirect())

    def send(event):
        request = Request(endpoint, data=json.dumps(event).encode("utf-8"), method="POST",
                          headers={"Authorization": "Bearer " + token, "Content-Type": "application/json"})
        try:
            with opener.open(request, timeout=3) as response:
                body = json.load(response)
                if not isinstance(body, dict):
                    raise ValueError("Resposta de visão inválida")
                status = body.get("status")
                return status if isinstance(status, str) else "rejeitado"
        except HTTPError as error:
            with error:
                if error.code == 429 or 500 <= error.code <= 599:
                    raise OSError("API temporariamente indisponível") from None
                return "revisao" if error.code == 409 else "rejeitado"
        except (URLError, TimeoutError, HTTPException, ValueError):
            raise OSError("API sem resposta válida") from None

    return send


def open_rtsp(url: str):
    return cv2.VideoCapture(url, cv2.CAP_FFMPEG, [
        cv2.CAP_PROP_OPEN_TIMEOUT_MSEC, 4000,
        cv2.CAP_PROP_READ_TIMEOUT_MSEC, 3000,
    ])


class RtspService:
    def __init__(self, cameras, pipeline, send, *, queue_size=64, capture=open_rtsp,
                 reconnect_start=1.0, retry_start=1.0, max_age=60.0,
                 read_ocr=_ocr_with_confidence):
        if queue_size < 1:
            raise ValueError("O tamanho da fila RTSP deve ser positivo")
        self.pipeline = pipeline
        self.cameras = cameras
        self.send = send
        self.capture = capture
        self.read_ocr = read_ocr
        self.reconnect_start = reconnect_start
        self.retry_start = retry_start
        self.max_age = max_age
        self.stop = Event()
        self.lock = Lock()
        self.queue = Queue(maxsize=queue_size)
        self.states = {camera.passage.camera_id: "connecting" for camera in cameras}
        self.frames = Counter()
        self.counts = Counter()
        self.threads = []

    @classmethod
    def from_env(cls, pipeline):
        if os.getenv("VISION_RTSP_ENABLED", "false").lower() != "true":
            return None
        if pipeline is None:
            raise ValueError("RTSP contínuo exige VISION_DETECTOR=yolo")
        filename = os.getenv("VISION_CAMERAS_FILE")
        if not filename:
            raise ValueError("Configure VISION_CAMERAS_FILE com as fontes autorizadas")
        os.environ["OPENCV_FFMPEG_LOGLEVEL"] = "-8"
        os.environ.setdefault("OPENCV_FFMPEG_CAPTURE_OPTIONS", "rtsp_transport;tcp")
        cv2.setLogLevel(0)
        cameras = load_cameras(Path(filename))
        send = api_delivery(os.getenv("VISION_API_URL", ""), os.getenv("VISION_INGEST_TOKEN", ""))
        return cls(cameras, pipeline, send, queue_size=int(os.getenv("VISION_RTSP_QUEUE_SIZE", "64")))

    def start(self):
        self.threads = [Thread(target=self._deliver, daemon=True)]
        self.threads += [Thread(target=self._capture, args=(camera,), daemon=True) for camera in self.cameras]
        for thread in self.threads:
            thread.start()

    def close(self):
        self.stop.set()
        for thread in self.threads:
            thread.join(timeout=5)

    def status(self):
        with self.lock:
            return {
                "cameras": dict(self.states), "fila": self.queue.qsize(),
                "limite_fila": self.queue.maxsize, "contadores": dict(self.counts),
                "quadros_amostrados": dict(self.frames),
            }

    def _count(self, key):
        with self.lock:
            self.counts[key] += 1

    def _state(self, camera, state):
        with self.lock:
            self.states[camera.passage.camera_id] = state

    def _capture(self, camera):
        delay = self.reconnect_start
        while not self.stop.is_set():
            capture = None
            connected = False
            self._state(camera, "connecting")
            tracker = PassageTracker(camera.passage, uuid4().hex)
            try:
                capture = self.capture(camera.url)
                if capture.isOpened():
                    connected = self._read(camera, capture, tracker)
            except Exception:
                self._count("erros_captura")
            finally:
                if capture is not None:
                    capture.release()
                for event in tracker.finish(complete=False):
                    self._offer(event)
            if self.stop.is_set():
                break
            self._state(camera, "reconnecting")
            self._count("reconexoes")
            if connected:
                delay = self.reconnect_start
            if self.stop.wait(delay):
                break
            delay = min(30.0, delay * 2)
        self._state(camera, "stopped")

    def _read(self, camera, capture, tracker):
        origin = monotonic()
        number = 0
        roi = None
        dimensions = None
        metrics = dict(detector_s=0.0, selecao_s=0.0, ocr_s=0.0, chamadas_ocr=0)
        evidence = VideoEvidence(self.pipeline, self.read_ocr, normalizar_placa, metrics)
        while not self.stop.is_set():
            ok, frame = capture.read()
            if not ok:
                break
            second = monotonic() - origin
            shape = frame.shape[:2]
            if dimensions is None:
                dimensions = shape
                height, width = dimensions
                roi = parse_roi(camera.roi, width, height)
                if camera.passage.line_x + camera.passage.deadband_px >= width:
                    raise ValueError("Linha RTSP fora do quadro")
                if roi and not roi[0] + camera.passage.deadband_px < camera.passage.line_x < roi[0] + roi[2] - camera.passage.deadband_px:
                    raise ValueError("A região RTSP deve cobrir os dois lados da linha")
                self._state(camera, "connected")
            elif shape != dimensions:
                raise ValueError("Resolução RTSP mudou durante a captura")
            if number % camera.every == 0:
                x, y, w, h = roi or (0, 0, frame.shape[1], frame.shape[0])
                evidence.add(frame[y:y + h, x:x + w], number, second, (x, y))
                with self.lock:
                    self.frames[camera.passage.camera_id] += 1
                if len(evidence.frames) == self.pipeline.ocr_window:
                    for sample in evidence.frames:
                        for event in tracker.add(sample):
                            self._offer(event)
                    evidence.frames.clear()
                    evidence.readings.clear()
            number += 1
        return number > 0

    def _offer(self, event):
        if event["estado"] != "confirmada":
            self._count("revisao_worker")
            return
        try:
            self.queue.put_nowait((event, monotonic()))
            self._count("enfileirados")
        except Full:
            self._count("descartados_fila_cheia")

    def _deliver(self):
        while not self.stop.is_set():
            try:
                event, queued = self.queue.get(timeout=0.2)
            except Empty:
                continue
            try:
                self._submit(event, queued)
            finally:
                self.queue.task_done()

    def _submit(self, event, queued):
        delay = self.retry_start
        for attempt in range(5):
            if self.stop.is_set() or monotonic() - queued >= self.max_age:
                break
            try:
                status = self.send(event)
                self._count(status if status in {"conhecido", "desconhecido", "revisao"} else "rejeitado")
                return
            except OSError:
                self._count("falhas_entrega")
                remaining = self.max_age - (monotonic() - queued)
                if attempt == 4 or remaining <= 0 or self.stop.wait(min(delay, remaining)):
                    break
                delay = min(8.0, delay * 2)
        self._count("descartados_entrega")
