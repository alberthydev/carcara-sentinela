import json
import os
import re
import tempfile
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from plate_worker import process_video


def rtsp_enabled() -> bool:
    return os.getenv("VISION_RTSP_ENABLED", "false").lower() == "true"


class VisionHandler(BaseHTTPRequestHandler):
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
            self._respond(200, {
                "status": "enabled" if rtsp_enabled() else "disabled",
                "servico": "vision-worker",
                "recurso": "rtsp",
            })
            return
        self._respond(404, {"erro": "Endpoint não encontrado."})

    def do_POST(self) -> None:
        if self.path == "/rtsp/connect":
            if not rtsp_enabled():
                self._respond(503, {"erro": "A integração RTSP está desativada."})
                return
            try:
                body = json.loads(self.rfile.read(int(self.headers.get("Content-Length", "0"))))
                url = body.get("url", "")
                if not isinstance(url, str) or not re.match(r"^rtsps?://", url):
                    self._respond(400, {"erro": "Informe uma URL RTSP válida."})
                    return
                import cv2

                capture = cv2.VideoCapture(url)
                conectado = capture.isOpened()
                if conectado:
                    conectado, _ = capture.read()
                capture.release()
                self._respond(
                    200 if conectado else 502,
                    {"status": "connected" if conectado else "unavailable"},
                )
            except (ValueError, json.JSONDecodeError):
                self._respond(400, {"erro": "JSON inválido para conexão RTSP."})
            except Exception as error:
                print(f"Erro ao conectar à câmera RTSP: {error}")
                self._respond(502, {"erro": "Não foi possível conectar à câmera RTSP."})
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

            resultado = process_video(video_path)
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
    server = ThreadingHTTPServer((host, port), VisionHandler)
    print(f"Vision worker HTTP ouvindo em {host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
