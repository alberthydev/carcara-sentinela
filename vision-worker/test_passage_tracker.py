import pytest

from passage_tracker import PassageConfig, PassageTracker


def _frame(index, vehicles, stray=False):
    frame = {"frame": index * 3, "segundo": index * 0.2, "veiculos": [], "placas": []}
    for vehicle_id, (x, y, plate, confidence) in enumerate(vehicles):
        box = {"x": x, "y": y, "largura": 80, "altura": 60}
        frame["veiculos"].append({"id": vehicle_id, "caixa": box, "confianca_detector": 0.9})
        if plate:
            frame["placas"].append({
                "veiculo_id": vehicle_id, "placa": plate, "ocr_executado": True,
                "confianca_ocr": confidence, "confianca_detector": 0.9,
            })
    if stray:
        frame["placas"].append({
            "veiculo_id": None, "placa": "ABC1234", "ocr_executado": True,
            "confianca_ocr": 0.99, "confianca_detector": 0.99,
        })
    return frame


def _run(frames, camera="portao", session="gravacao-1", line=100):
    tracking = PassageTracker(PassageConfig(camera, line), session)
    events = []
    for frame in frames:
        events.extend(tracking.add(frame))
    return events + tracking.finish()


def test_placa_isolada_ou_segurada_sem_veiculo_nao_gera_passagem():
    assert _run(_frame(index, [], stray=True) for index in range(6)) == []


def test_dois_veiculos_em_sentidos_opostos_tem_votos_ids_e_eventos_independentes():
    frames = []
    for index, (x1, x2) in enumerate(zip((30, 45, 60, 75, 90), (90, 75, 60, 45, 30))):
        vehicles = [(x1, 0, "ABC1234", 0.95), (x2, 90, "DEF1G23", 0.94)]
        frames.append(_frame(index, vehicles if index % 2 == 0 else vehicles[::-1]))
    events = _run(frames)
    assert [(event["placa"], event["direcao"], event["estado"]) for event in events] == [
        ("ABC1234", "entrada", "confirmada"), ("DEF1G23", "saida", "confirmada"),
    ]
    assert all(event["leituras"] == 5 for event in events)
    assert len({event["evento_id"] for event in events}) == 2
    assert _run(frames) == events
    for variant in (_run(frames, camera="portao-2"), _run(frames, session="reconexao")):
        assert {event["evento_id"] for event in variant}.isdisjoint(event["evento_id"] for event in events)


@pytest.mark.parametrize(("xs", "plates", "confidence", "line", "reason"), [
    ((40, 75), ("ABC1234", "ABC1234"), 0.9, 100, "leituras_insuficientes"),
    ((30, 45, 60, 75), ("ABC1234", "ABC1234", "ABC1234", "ABC1234"), 0.5, 100, "leituras_insuficientes"),
    ((30, 45, 60, 75), ("ABC1234", "ABC1234", "DEF1G23", "DEF1G23"), 0.9, 100, "empate"),
    ((30, 45, 60, 75), ("ABC1234", "ABC1234", "ABC1234", "ABC1234"), 0.9, None, "sentido_inconclusivo"),
    ((30, 45, 60, 75, 58, 42, 28), ("ABC1234",) * 7, 0.9, 100, "sentido_inconclusivo"),
])
def test_evidencia_inconclusiva_nunca_libera(xs, plates, confidence, line, reason):
    frames = [_frame(index, [(x, 0, plate, confidence)]) for index, (x, plate) in enumerate(zip(xs, plates))]
    events = _run(frames, line=line)
    assert len(events) == 1
    assert events[0]["estado"] == "revisao"
    assert events[0]["motivo"] == reason
    assert events[0]["liberacao_automatica"] is False


def test_encerramento_na_reconexao_nao_libera_trajetoria_incompleta():
    tracker = PassageTracker(PassageConfig("portao", 100), "sessao-1")
    for index, x in enumerate((30, 45, 60, 75)):
        assert tracker.add(_frame(index, [(x, 0, "ABC1234", 0.9)])) == []
    assert tracker.finish(complete=False)[0]["estado"] == "revisao"
    assert tracker.finish() == []


def test_oclusao_ambigua_nao_transfere_votos_entre_veiculos():
    frames = [
        _frame(0, [(40, 0, "ABC1234", 0.9), (78, 0, "DEF1G23", 0.9)]),
        _frame(1, [(60, 0, "ABC1234", 0.9)]),
        _frame(2, [(80, 0, "DEF1G23", 0.9)]),
    ]
    assert not any(event["liberacao_automatica"] for event in _run(frames))
