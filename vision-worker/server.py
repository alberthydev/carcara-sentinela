import base64
import json
import os
import tempfile
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from plate_worker import process_video
from passage_tracker import PassageConfig
from rtsp_worker import RtspService
from yolo_evidence import YoloPipeline


def preview_placa(video_path: Path, result: dict) -> str | None:
    """Return one small plate crop from the uploaded file, when available."""
    import cv2

    if "quadros" in result:
        candidates = [
            (frame["frame"], plate) for frame in result["quadros"] for plate in frame["placas"]
        ]
    else:
        candidates = [(item["frame"], item) for item in result.get("deteccoes", [])]
    if not candidates:
        return None

    frame_number, plate = max(candidates, key=lambda item: (
        bool(item[1].get("placa")) and item[1]["placa"] == result.get("placa_recomendada"),
        item[1].get("ocr_executado", False),
        item[1].get("confianca_detector", item[1].get("confianca", 0)),
    ))
    caixa = plate["caixa"]
    x, y, width, height = (caixa[key] for key in ("x", "y", "largura", "altura"))
    capture = cv2.VideoCapture(str(video_path))
    try:
        if not capture.set(cv2.CAP_PROP_POS_FRAMES, frame_number):
            return None
        ok, frame = capture.read()
        if not ok or capture.get(cv2.CAP_PROP_POS_FRAMES) != frame_number + 1:
            return None
        crop = frame[y:y + height, x:x + width]
        if not crop.size:
            return None
        crop_height, crop_width = crop.shape[:2]
        scale = min(1, 420 / crop_width, 210 / crop_height)
        if scale < 1:
            crop = cv2.resize(crop, (max(1, round(crop_width * scale)), max(1, round(crop_height * scale))),
                              interpolation=cv2.INTER_AREA)
        encoded, data = cv2.imencode(".jpg", crop, [cv2.IMWRITE_JPEG_QUALITY, 78])
        if encoded and len(data) <= 60_000:
            return "data:image/jpeg;base64," + base64.b64encode(data).decode("ascii")
    except cv2.error:
        return None
    finally:
        capture.release()
    return None


class VisionServer(ThreadingHTTPServer):
    def __init__(self, address: tuple[str, int], pipeline: YoloPipeline | None = None,
                 sample_every: int = 5, roi: str | None = None,
                 passage_config: PassageConfig = PassageConfig("upload"),
                 rtsp: RtspService | None = None):
        if sample_every < 1:
            raise ValueError("VISION_EVERY deve ser maior que zero")
        self.pipeline = pipeline
        self.sample_every = sample_every
        self.roi = roi
        self.passage_config = passage_config
        self.rtsp = rtsp
        super().__init__(address, VisionHandler)


class VisionHandler(BaseHTTPRequestHandler):
    server: VisionServer

    def _respond(self, status: int, payload: dict) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Access-Control-Allow-Origin", os.getenv("CORS_ORIGIN", "*"))
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Video-Name")
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", os.getenv("CORS_ORIGIN", "*"))
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Video-Name")
        self.end_headers()

    def do_GET(self) -> None:
        if self.path == "/health":
            self._respond(200, {"status": "ok", "servico": "vision-worker"})
            return
        if self.path == "/rtsp/status":
            service = self.server.rtsp
            self._respond(200, {
                "status": "enabled" if service else "disabled",
                "servico": "vision-worker",
                "recurso": "rtsp",
                **(service.status() if service else {}),
            })
            return
        self._respond(404, {"erro": "Endpoint não encontrado."})

    def do_POST(self) -> None:
        if self.path == "/rtsp/connect":
            service = self.server.rtsp
            if service is None:
                self._respond(503, {"erro": "A integração RTSP está desativada."})
                return
            try:
                body = json.loads(self.rfile.read(int(self.headers.get("Content-Length", "0"))))
                camera_id = body.get("camera_id") if isinstance(body, dict) else None
                if not isinstance(camera_id, str):
                    self._respond(400, {"erro": "Informe o identificador da câmera configurada."})
                    return
                state = service.status()["cameras"].get(camera_id)
                if state is None:
                    self._respond(404, {"erro": "Câmera RTSP não configurada."})
                    return
                self._respond(
                    200 if state == "connected" else 503,
                    {"status": state},
                )
            except ValueError:
                self._respond(400, {"erro": "JSON inválido para conexão RTSP."})
            return

        if self.path != "/process":
            self._respond(404, {"erro": "Endpoint não encontrado."})
            return

        content_type = self.headers.get("Content-Type", "")
        if not content_type.startswith("application/octet-stream"):
            self._respond(415, {"erro": "Envie o vídeo como application/octet-stream."})
            return

        content_length = int(self.headers.get("Content-Length", "0"))
        if content_length <= 0:
            self._respond(400, {"erro": "O vídeo enviado está vazio."})
            return

        suffix = Path(self.headers.get("X-Video-Name", "video.mp4")).suffix or ".mp4"
        try:
            with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as video:
                video.write(self.rfile.read(content_length))
                video_path = Path(video.name)

            resultado = process_video(
                video_path, sample_every=self.server.sample_every,
                roi=self.server.roi, pipeline=self.server.pipeline,
                passage_config=self.server.passage_config if self.server.pipeline else None,
            )
            preview = preview_placa(video_path, resultado)
            if preview:
                resultado["imagem_placa"] = preview
            self._respond(200, resultado)
        except (ValueError, FileNotFoundError, RuntimeError) as error:
            self._respond(400, {"erro": str(error)})
        except Exception as error:
            print(f"Erro ao processar vídeo: {error}")
            self._respond(500, {"erro": "Erro interno ao processar o vídeo."})
        finally:
            if "video_path" in locals():
                video_path.unlink(missing_ok=True)


def main() -> None:
    host = os.getenv("VISION_HOST", "0.0.0.0")
    port = int(os.getenv("VISION_PORT", "8000"))
    pipeline = YoloPipeline.from_env()
    sample_every = int(os.getenv("VISION_EVERY", "5"))
    line_x = os.getenv("VISION_PASSAGE_LINE_X")
    direction = os.getenv("VISION_PASSAGE_ENTRY", "right")
    if direction not in {"left", "right"}:
        raise ValueError("VISION_PASSAGE_ENTRY deve ser left ou right")
    passages = PassageConfig("upload", int(line_x) if line_x else None, direction == "right")
    rtsp = RtspService.from_env(pipeline)
    with VisionServer((host, port), pipeline, sample_every, os.getenv("VISION_ROI"), passages, rtsp) as server:
        try:
            if rtsp:
                rtsp.start()
            print(f"Vision worker HTTP ouvindo em {host}:{port}")
            server.serve_forever()
        finally:
            if rtsp:
                rtsp.close()


if __name__ == "__main__":
    main()
