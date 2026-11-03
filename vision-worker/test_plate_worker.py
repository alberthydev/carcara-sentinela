import pytest

from plate_worker import (
    _plate_regions,
    consolidar_deteccoes,
    normalizar_placa,
    parse_roi,
)


@pytest.mark.parametrize(
    ("entrada", "esperada"),
    [
        ("abc-1234", "ABC1234"),
        ("abc1d23", "ABC1D23"),
        (" ABC 1234 ", "ABC1234"),
    ],
)
def test_normaliza_placas_brasileiras(entrada, esperada):
    assert normalizar_placa(entrada) == esperada


@pytest.mark.parametrize("entrada", ["AB1234", "ABC123", "ABC12345", ""])
def test_rejeita_texto_que_nao_e_placa(entrada):
    assert normalizar_placa(entrada) is None


def test_exige_regioes_de_placa_com_tamanho_minimo():
    pytest.importorskip("cv2")
    import numpy as np

    frame = np.zeros((100, 200, 3), dtype=np.uint8)
    assert _plate_regions(frame) == []


def test_consolida_placa_repetida_e_habilita_liberacao_automatica():
    deteccoes = [
        {"placa": "QJF5373"},
        {"placa": "QJF5373"},
        {"placa": "QJF5373"},
        {"placa": "AIF5373"},
    ]

    resultado = consolidar_deteccoes(deteccoes)

    assert resultado["placa_recomendada"] == "QJF5373"
    assert resultado["confianca_recomendada"] == 0.75
    assert resultado["liberacao_automatica"] is True


def test_nao_libera_com_apenas_uma_leitura():
    resultado = consolidar_deteccoes([{"placa": "QJF5373"}])

    assert resultado["placa_recomendada"] == "QJF5373"
    assert resultado["confianca_recomendada"] == 1.0
    assert resultado["liberacao_automatica"] is False
    assert "menos de 3 leituras iguais" in resultado["motivo_bloqueio"]


def test_nao_pesa_deteccoes_duplicadas_no_mesmo_frame():
    deteccoes = [
        {"placa": "DUF5373", "frame": 0},
        {"placa": "DUF5373", "frame": 0},
        {"placa": "QJF5373", "frame": 65},
        {"placa": "QJF5373", "frame": 70},
    ]

    resultado = consolidar_deteccoes(deteccoes)

    assert resultado["placa_recomendada"] == "QJF5373"
    assert resultado["confianca_recomendada"] == 0.667
    assert resultado["empate"] is False


def test_interpreta_regiao_de_interesse():
    assert parse_roi("10,20,300,120", 640, 480) == (10, 20, 300, 120)


def test_rejeita_regiao_de_interesse_fora_do_video():
    with pytest.raises(ValueError):
        parse_roi("500,20,300,120", 640, 480)
