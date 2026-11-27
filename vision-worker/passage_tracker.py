"""Conservative per-camera passage decisions over finalized frame evidence."""

from collections import Counter
from dataclasses import dataclass, field
from hashlib import sha256

from yolo_evidence import _iou


@dataclass(frozen=True)
class PassageConfig:
    camera_id: str
    line_x: int | None = None
    entry_increases_x: bool = True
    deadband_px: int = 10
    gap_s: float = 1.0

    def __post_init__(self):
        if self.deadband_px < 1 or not 0 < self.gap_s <= 10:
            raise ValueError("Margem da linha e tempo de perda devem ser positivos")
        if self.line_x is not None and self.line_x <= self.deadband_px:
            raise ValueError("A linha deve ter margem dos dois lados")


def _box(item: dict) -> tuple:
    return tuple(item["caixa"][key] for key in ("x", "y", "largura", "altura"))


@dataclass
class _Track:
    id: str
    box: tuple
    last_s: float
    first_frame: int
    frames: int = 0
    votes: Counter = field(default_factory=Counter)
    first_side: int = 0
    last_side: int = 0
    crossings: int = 0
    interrupted: bool = False


class PassageTracker:
    def __init__(self, config: PassageConfig, session_id: str):
        self.config = config
        self.session_id = session_id
        self.tracks: dict[int, _Track] = {}
        self.next_id = 0
        self.last_frame = -1
        self.last_s = 0.0

    def add(self, evidence: dict) -> list[dict]:
        """Consume each sampled frame in order after its OCR window is flushed."""
        frame = evidence["frame"]
        second = evidence["segundo"]
        if frame <= self.last_frame or second < self.last_s:
            raise ValueError("Os quadros devem chegar em ordem crescente")
        self.last_frame, self.last_s = frame, second
        finished = self._expire(second)
        vehicles = {item["id"]: _box(item) for item in evidence["veiculos"]
                    if item["confianca_detector"] >= 0.5}
        links = {vehicle: [key for key, track in self.tracks.items()
                           if _iou(box, track.box) >= 0.25]
                 for vehicle, box in vehicles.items()}
        claimants = Counter(key for matches in links.values() for key in matches)
        votes = self._votes(evidence)
        for key, box in vehicles.items():
            matches = links[key]
            if len(matches) == 1 and claimants[matches[0]] == 1:
                track = self.tracks[matches[0]]
            else:
                for match in matches:
                    self.tracks[match].interrupted = True
                track = self._new_track(box, second, frame, bool(matches))
            self._observe(track, box, second, votes.get(key, set()))
        return finished

    @staticmethod
    def _votes(evidence: dict) -> dict[int, set[str]]:
        votes: dict[int, set[str]] = {}
        for candidate in evidence["placas"]:
            owner = candidate["veiculo_id"]
            confidence = candidate["confianca_ocr"]
            if (owner is not None and candidate["ocr_executado"] and candidate["placa"]
                    and confidence is not None and confidence >= 0.75
                    and candidate["confianca_detector"] >= 0.5):
                votes.setdefault(owner, set()).add(candidate["placa"])
        return votes

    def _new_track(self, box: tuple, second: float, frame: int, interrupted: bool) -> _Track:
        key = self.next_id
        self.next_id += 1
        token = sha256(f"{self.config.camera_id}\0{self.session_id}\0{frame}\0{key}".encode()).hexdigest()
        track = _Track(token, box, second, frame, interrupted=interrupted)
        self.tracks[key] = track
        return track

    def _observe(self, track: _Track, box: tuple, second: float, votes: set[str]) -> None:
        track.frames += 1
        track.last_s, track.box = second, box
        track.interrupted |= len(votes) > 1
        if len(votes) == 1:
            track.votes.update(votes)
        if self.config.line_x is None:
            return
        delta = box[0] + box[2] / 2 - self.config.line_x
        if abs(delta) < self.config.deadband_px:
            return
        side = 1 if delta > 0 else -1
        if not track.first_side:
            track.first_side = side
        elif side != track.last_side:
            track.crossings += 1
        track.last_side = side

    def _expire(self, now: float) -> list[dict]:
        stale = [key for key, track in self.tracks.items() if now - track.last_s > self.config.gap_s]
        return [self._decision(self.tracks.pop(key)) for key in stale]

    def finish(self, *, complete: bool = True) -> list[dict]:
        tracks = list(self.tracks.values())
        self.tracks.clear()
        if not complete:
            for track in tracks:
                track.interrupted = True
        return [self._decision(track) for track in tracks]

    def _decision(self, track: _Track) -> dict:
        ranking = track.votes.most_common(2)
        plate, count = ranking[0] if ranking else (None, 0)
        confidence = count / track.votes.total() if count else 0.0
        tie = len(ranking) > 1 and ranking[1][1] == count
        direction = None
        if track.crossings == 1:
            increasing = track.last_side > track.first_side
            direction = "entrada" if increasing == self.config.entry_increases_x else "saida"
        reason = None
        if track.interrupted:
            reason = "trajetoria_ou_ocr_ambiguo"
        elif tie:
            reason = "empate"
        elif count < 3 or confidence < 0.75:
            reason = "leituras_insuficientes" if count < 3 else "confianca_insuficiente"
        elif direction is None:
            reason = "sentido_inconclusivo"
        return {
            "versao": 2, "camera_id": self.config.camera_id, "evento_id": track.id,
            "estado": "revisao" if reason else "confirmada", "motivo": reason,
            "placa": None if tie else plate, "direcao": direction, "quadros": track.frames,
            "leituras": count, "confianca": round(confidence, 3),
            "liberacao_automatica": reason is None,
        }
