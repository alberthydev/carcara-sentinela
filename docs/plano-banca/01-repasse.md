# Etapa 01 — Repasse técnico

Execução local em 26/11/2026, a partir de `main` no commit `3969e26`.
O checkout estava alinhado com a referência local de `origin/main`. A pasta
`docs/` já existia como conteúdo não rastreado. Foram editados trechos dos
roteiros existentes e acrescentado este repasse.

**Repasse técnico disponível para a etapa 02.** O perfil experimental e seu
contrato foram verificados. O aceite de qualidade e latência do piloto segue pendente.

## Revisão do plano

- O orquestrador agora explicita a cobertura dos pontos da banca, os arquivos
  compartilhados e a ordem de integração. O custo de processamento pode ser
  medido assim que 01 a 03 forem integradas. A estimativa financeira depende
  também da topologia que a etapa 05 documentar.
- Os roteiros separam repasse de contrato de aceite experimental. A mesma
  matriz rotulada sustenta a comparação de 01, a compatibilidade de 03 e os
  custos de 04. Os limites de latência e qualidade do piloto serão definidos
  antes da escolha operacional. A etapa 07 continua por último e recebe os
  requisitos de licença, revisão e hash dos pesos. A apresentação usa as
  telas atuais e a melhoria visual e de usabilidade fica fora do pacote.
- O código confirma que o RTSP atual lê apenas o primeiro quadro, a Layer 1
  usa LPR e SSE e a Layer 2 aceita vídeo ou JSON pelo painel Dev. O Compose
  define execução local. O CD descreve publicação de imagens API, app e worker
  no GHCR. A hospedagem em execução continua para verificação na etapa 05.
  O CI já cobre testes/build do worker e testes, type-check e builds da API e
  do app em alterações nas respectivas pastas. Uma mudança apenas em docs não
  dispara esses workflows.
- O README legado do worker divergia do controlador. Os testes existentes
  verificam que `liberacao_automatica: false` pode abrir ou fechar acesso
  com o formato legado. O resultado YOLO versão 1 retorna `revisao` antes
  de consultar ou gravar acessos. A correção geral continua na etapa 02.

## Arquivos modificados

| Área | Arquivos e decisões |
| --- | --- |
| Plano | `ORQUESTRADOR.md`, `01-velocidade-yolo-ocr.md`, `02-falsos-registros.md`, `03-cameras-rtsp.md`, `04-custo-servidor.md`, `07-producao.md` e este repasse. Os roteiros 05 e 06 foram conferidos |
| Worker | `plate_worker.py`, `server.py`, `yolo_detector.py`, `yolo_evidence.py`, `.env.example` e `Dockerfile`. Carregamento local de dois ONNX e seleção de OCR por veículo dentro de uma janela |
| Benchmark | `benchmark.py`, `benchmark_fixture.py`, `benchmark_ocr.py` e `test_yolo_worker.py`. Comparação por passagem anotada e teste opcional de upload com pesos reais |
| Integração | `api/src/controllers/visaoController.ts`, `api/src/docs/openapi.yaml`, `api/tests/api-layer1.test.ts` e `app/src/views/DashboardMainView.vue`. O painel e a CLI enviam o marcador de revisão sem transportar os quadros no POST da API |
| Documentação | `README.md`, `vision-worker/README.md` e `.gitignore`. Pesos, vídeos e resultados locais ficam em `.stage01-local/` |

## Reprodução

Os comandos abaixo partem da raiz. Use os pesos, hashes e versões do
[README do worker](../../vision-worker/README.md). A foto original tem SHA-1
`07daae5bc0e53a26661b8618825935277d36e94d`. O manifesto local gerado tem
SHA-256 `62fe3b05d99c07f545c8dfcecc6828da7bd4d1c81f4f629c619649c797bb6244`.

```bash
python vision-worker/benchmark_fixture.py .stage01-local/fiat.jpg .stage01-local/clips
export VISION_VEHICLE_MODEL="$PWD/.stage01-local/yolox_nano.onnx"
export VISION_PLATE_MODEL="$PWD/.stage01-local/plate.onnx"
export VISION_YOLO_DEVICE=cpu VISION_OCR_BEST=1 VISION_OCR_WINDOW=3
bench() { python vision-worker/benchmark.py .stage01-local/clips/manifest.json "$@"; }
VISION_DETECTOR=opencv bench --every 5
VISION_DETECTOR=opencv bench --every 5 --use-roi
export VISION_DETECTOR=yolo
bench --every 5
bench --every 5 --use-roi
VISION_OCR_BEST=3 bench --every 5 --use-roi
bench --every 3 --use-roi
VISION_VEHICLE_MODEL="$PWD/.stage01-local/yolox_tiny.onnx" bench --every 5 --use-roi
bench --use-roi --neural-ocr-model .stage01-local/ppocr-en.onnx
bench --use-roi --neural-ocr-model .stage01-local/ppocr-en.onnx --correct-positions
VISION_OCR_BEST=3 bench --use-roi --neural-ocr-model .stage01-local/ppocr-en.onnx
OPENCV_OPENCL_DEVICE=:GPU: OPENCV_DNN_OPENCL_ALLOW_ALL_DEVICES=1 VISION_YOLO_DEVICE=opencl \
  bench --use-roi --output .stage01-local/opencl-roi.json
bench --use-roi --every 10 --neural-ocr-model .stage01-local/ppocr-en.onnx
```

## Resultados do benchmark

Windows 11, Ryzen 7 5700X (8 núcleos, 16 threads) e Radeon RX 580 2048SP
(OpenCL Ellesmere). Python 3.12.10, OpenCV 4.12.0, NumPy 2.2.6,
Tesseract 5.4.0.20240606 e ONNX Runtime 1.23.2 para PP-OCRv4. Uma thread
OpenCV e três repetições para cada um dos cinco clipes. Latência por clipe
de um segundo após carregar os pesos. Os tempos por etapa são a soma em
15 execuções. CER inclui ausências de leitura. O detector de contornos
fica sem métrica de cobertura porque produz somente regiões de placa.

| Perfil | Exatas / 5 | Sem leitura | CER | Veículos / 5 | p50 / p95 (s) | Chamadas OCR | Decode / detector / OCR (s) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| OpenCV + Tesseract, 1:5 | 0 | 2 | 48,6% | — | 5,42 / 9,53 | 543 | 0,59 / 0,20 / 74,43 |
| OpenCV + Tesseract, 1:5, ROI | 0 | 2 | 48,6% | — | 6,37 / 11,89 | 543 | 0,81 / 0,20 / 94,45 |
| Nano CPU + Tesseract, 1:5, OCR 1 | 1 | 4 | 80,0% | 5 | 1,32 / 1,79 | 15 | 0,82 / 17,50 / 2,56 |
| Nano CPU + Tesseract, 1:5, ROI, OCR 1 | 2 | 3 | 60,0% | 5 | 1,43 / 1,63 | 15 | 0,90 / 17,78 / 2,71 |
| Nano CPU + Tesseract, 1:5, ROI, OCR 3 | 3 | 1 | 28,6% | 5 | 1,55 / 1,87 | 45 | 0,65 / 14,96 / 6,70 |
| Nano CPU + Tesseract, 1:3, ROI, OCR 1 | 3 | 2 | 40,0% | 5 | 1,99 / 2,18 | 30 | 0,67 / 24,14 / 4,14 |
| Tiny CPU + Tesseract, 1:5, ROI, OCR 1 | 2 | 3 | 60,0% | 5 | 1,40 / 1,66 | 15 | 0,62 / 18,53 / 2,13 |
| Nano CPU + PP-OCRv4, 1:5, ROI, OCR 1 | 5 | 0 | 0,0% | 5 | 1,13 / 1,24 | 15 | 0,67 / 15,32 / 0,42 |
| Nano CPU + PP-OCRv4, 1:5, ROI, OCR 1, correção posicional | 5 | 0 | 0,0% | 5 | 1,12 / 1,24 | 15 | 0,76 / 15,63 / 0,42 |
| Nano CPU + PP-OCRv4, 1:5, ROI, OCR 3 | 5 | 0 | 0,0% | 5 | 1,12 / 1,20 | 45 | 0,65 / 14,80 / 1,23 |
| Nano OpenCL + Tesseract, 1:5, ROI, OCR 1 | 2 | 3 | 60,0% | 5 | 2,81 / 3,17 | 15 | 0,58 / 41,05 / 2,01 |
| Nano CPU + PP-OCRv4, 1:10, ROI, OCR 1 | 5 | 0 | 0,0% | 5 | 0,66 / 0,81 | 15 | 0,58 / 9,23 / 0,42 |

O OpenCV executou OCR no clipe negativo e gerou três recomendações de
passagem incorretas nos cinco positivos. O melhor perfil Tesseract com
YOLO teve uma correspondência incorreta e uma ausência, ambas em placas
Mercosul. Todos os perfis YOLO detectaram os veículos anotados e deixaram
a placa isolada sem OCR. O marcador de revisão manteve a persistência
desativada para todos os perfis YOLO. A correção posicional preservou
5/5 acertos e zero correspondências incorretas com PP-OCRv4. A amostra
pequena não justifica ativá-la.

Na comparação com Tesseract e os mesmos parâmetros, OpenCL preservou os
acertos da CPU e quase dobrou o p95 (1,63 s para 3,17 s). O OpenCV abriu
o dispositivo físico, mas o driver rejeitou uma opção ao compilar um
kernel de teste (`CL_INVALID_COMPILER_OPTIONS`). A medição descreve o
perfil OpenCL como executado no host, com possibilidade de fallback.

O perfil de menor custo observado que manteve cinco acertos foi Nano em CPU
com ROI, PP-OCRv4, amostragem 1:10 e um OCR por janela e veículo. Ante a linha
de base sem ROI, o p95 de processamento caiu 91% (9,53 s para 0,81 s) e as
chamadas de OCR caíram 97% (543 para 15). Nos mesmos recortes YOLO de 1:5,
o tempo agregado do OCR caiu de 2,71 s (Tesseract) para 0,42 s (PP-OCRv4).
A carga e aquecimento medidos do perfil neural variaram de 0,68 s a 15,10 s
entre execuções locais. Repita essa medição no ambiente do piloto. Os pesos
são reutilizados entre quadros.

A escolha é provisória. A amostragem 1:10 viu apenas dois quadros por clipe
de bancada. Valide 1:5 e 1:10 em passagens reais curtas e simultâneas e
preserve quadros suficientes para a confirmação da etapa 02. A ROI deve ser
calibrada por câmera. O worker padrão continua com OpenCV + Tesseract e o
modo YOLO do serviço usa Tesseract. PP-OCRv4 está disponível no benchmark.

## Validação

| Comando | Resultado |
| --- | --- |
| `python -m pytest -q` no worker | 19 passaram, 2 testes de upload foram pulados sem configuração |
| `VISION_SMOKE_VIDEO=../.stage01-local/clips/dia.avi python -m pytest -q` no worker, após configurar os dois ONNX e `VISION_DETECTOR=yolo` | 21 passaram, incluindo upload do perfil legado com vídeo sintético e upload YOLO com inferência real |
| `npm test` na API | 27 passaram em loopback, incluindo Layer 1 e o bloqueio de gravação do resultado experimental. As operações de persistência são simuladas |
| `npm run type-check` e `npm run build` na API | Passaram |
| `npm run type-check`, `npm test` e `npm run build` no app | Passaram. O Vitest executou 2 testes e reportou aviso de espera no encerramento |
| `docker build --tag carcara-sentinela-vision-worker:stage01 vision-worker` | Passou. A CLI no contêiner sem rede detectou veículo e placa no clipe diurno e leu a placa fictícia |
| `docker compose config --quiet` e `docker compose -f docker-compose.dev.yml config --quiet` | Passaram |
| `git diff --check` e parse YAML do OpenAPI | Passaram |

## Evidência e pendências

- Os clipes de bancada têm 1280×576 pixels, 15 quadros a 15 fps. São cinco
  clipes, cinco passagens anotadas e um negativo, todos gerados de uma foto
  licenciada com placas fictícias. Incluem variações de luz, compressão e tremor,
  dois veículos e uma placa isolada. As três repetições por perfil medem tempo.
  A qualidade usa a primeira execução de cada clipe. [Foto de Rudolf Stricker](https://commons.wikimedia.org/wiki/File:Fiat_500_front_20080621.jpg).
- A inferência foi executada com os ONNX reais, com um teste de upload HTTP
  e um smoke em Docker. Placas sintéticas e fotos compostas são insumos de
  bancada. O cenário de compressão e tremor só simula características de
  celular. A placa isolada não contém um pedestre.
- A etapa 02 já pode consumir `versao_evidencia: 1` e `quadros`. Use caixas do
  frame completo, IDs locais e os vínculos de placa como candidatos. Implemente
  identidade da passagem, confirmação e idempotência. Use o caminho
  experimental de revisão nos ensaios até haver persistência segura.
- O aceite da etapa 01 exige vídeos autorizados, separados por origem entre
  ajuste e avaliação, cobrindo placas antigas e Mercosul, celular real, baixa
  iluminação, perspectiva oblíqua, passagens simultâneas e pedestre com placa.
  Avalie retificação onde houver distorção, compare OCR e limiares novamente e
  verifique o limite de latência do campus. Para uso institucional, resolva
  também os termos dos pesos AGPL-3.0 de placa ou valide um substituto.
- Nenhuma imagem ou peso foi publicado. Os testes executados foram locais,
  e a etapa 07 permanece no fim do plano.
