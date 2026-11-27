# Worker de visão computacional - Layer 2

O worker gera evidência de visão para a Layer 2. O perfil padrão usa contornos
OpenCV e Tesseract. O perfil experimental usa dois detectores YOLO em OpenCV DNN
e Tesseract. Os dois perfis aceitam upload HTTP e execução por CLI.

## Uso

```bash
cd vision-worker
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
python plate_worker.py --video ../amostras/meu-veiculo.mp4 --output resultado.json
```

O modo integrado expõe um endpoint HTTP. A UI envia o vídeo diretamente para o
worker; ele processa o arquivo e devolve o JSON em memória, sem exigir que o
usuário gere ou selecione `result.json`:

```bash
docker compose -f ../docker-compose.dev.yml up --build vision_worker
```

Para uso manual, ainda é possível enviar o resultado à API quando a instituição estiver na Layer 2:

```bash
python plate_worker.py --video ../amostras/meu-veiculo.mp4 \
  --output resultado.json \
  --api-url http://localhost:3000 \
  --token "$TOKEN"
```

O POST `/api/users/visao/evento` encaminha resultados de upload e formatos
legados para revisão. A UI e a CLI encaminham o marcador `versao_evidencia: 1`,
a placa sugerida e `liberacao_automatica: false` para resultados YOLO.
A resposta de upload do worker pode incluir `imagem_placa`, um JPEG
limitado ao recorte da placa. A interface usa a imagem no atendimento atual.
A portaria verifica a passagem e escolhe entrada ou saída na revisão existente.
A API mantém a ingestão automática separada em `/api/users/visao/passagem`.

`--every 5` processa um frame a cada cinco. Reduza o valor para vídeos com
movimento rápido ou aumente para reduzir o custo de processamento.

Se a posição da guarita for fixa, restrinja a busca à região onde os veículos
passam. O formato é `x,y,largura,altura`:

```bash
python plate_worker.py --video ../amostras/guarita.mp4 \
  --roi 250,500,900,400 --every 3
```

As coordenadas começam no canto superior esquerdo do vídeo. A região deve ser
calibrada uma vez por câmera; isso reduz falsos positivos e chamadas ao OCR.

O consolidado legado do worker exige pelo menos três leituras iguais e
proporção de votos de 0,75 para marcar liberação. Empates bloqueiam a marcação.
O perfil YOLO sempre marca revisão, inclusive com leitura de alta confiança.

## Pesos experimentais

| Função | Artefato e classes usadas | SHA-256 |
| --- | --- | --- |
| Veículos, primeira configuração | [Megvii YOLOX-Nano ONNX 0.1.1rc0](https://github.com/Megvii-BaseDetection/YOLOX/releases/download/0.1.1rc0/yolox_nano.onnx), entrada 416×416. COCO, índices 2 `car`, 3 `motorcycle`, 5 `bus` e 7 `truck` | `c789161ed43c8269fcd4e67c67eeeb4e80c622da2eb296a20bc6007bd18a0b7d` |
| Veículos, comparação | [Megvii YOLOX-Tiny ONNX 0.1.1rc0](https://github.com/Megvii-BaseDetection/YOLOX/releases/download/0.1.1rc0/yolox_tiny.onnx), entrada 416×416, mesmas classes | `427cc366d34e27ff7a03e2899b5e3671425c262ea2291f88bb942bc1cc70b0f7` |
| Placas | [YOLOv8n ajustado, ONNX da revisão 8286762](https://huggingface.co/joker5914/yolov8n-license-plate/resolve/8286762929bd4b111a19186f2a05e0a5940b6088/best.onnx), entrada 640×640. Única classe `0: license_plate` confirmada nos metadados do arquivo | `a599289e5c25ab693fd7c6a152093f95fc34aef9b59b2c798127173e6e7ba2d9` |

O YOLOX é publicado pela Megvii sob Apache-2.0 e os ONNX vêm da release oficial
do projeto. O peso refinado de placa é publicado sob AGPL-3.0, confirmada no
cartão e no próprio ONNX (exportado com Ultralytics 8.4.56). O código e os
pesos-base Ultralytics têm opções AGPL-3.0 ou Enterprise. O código do Carcará
é MIT e a execução usa o OpenCV sob Apache-2.0. Os testes usaram pesos locais.
A seleção de placa para distribuição ou integração institucional fica
condicionada a uma revisão dos termos ou à seleção de pesos substitutos.
[Licença YOLOX](https://github.com/Megvii-BaseDetection/YOLOX/blob/main/LICENSE) ·
[Mapa COCO](https://github.com/Megvii-BaseDetection/YOLOX/blob/main/yolox/data/datasets/coco_classes.py) ·
[Cartão do modelo de placa](https://huggingface.co/joker5914/yolov8n-license-plate/tree/8286762929bd4b111a19186f2a05e0a5940b6088) ·
[Licenciamento Ultralytics](https://www.ultralytics.com/license) ·
[Licença OpenCV](https://opencv.org/license/).

Baixe os artefatos pelos links acima, confirme os hashes com `sha256sum` ou
`Get-FileHash -Algorithm SHA256` e forneça caminhos absolutos. O worker
valida o ONNX e o formato de saída na inicialização e reutiliza as redes.
As resoluções precisam corresponder aos exports. CUDA requer OpenCV DNN
compilado com suporte CUDA. Para AMD ou Intel, `VISION_YOLO_DEVICE=opencl`
exige uma GPU OpenCL disponível para o backend DNN. Selecione a GPU com
`OPENCV_OPENCL_DEVICE=:GPU:`. O perfil padrão usa CPU.

```bash
export VISION_DETECTOR=yolo
export VISION_VEHICLE_MODEL=/caminho/yolox_nano.onnx
export VISION_PLATE_MODEL=/caminho/best.onnx
python plate_worker.py --video /caminho/avaliacao.avi --profile
python server.py
```

Configure o HTTP por ambiente com `VISION_EVERY` e `VISION_ROI`. Para a CLI
use `--every` e `--roi`. Em um contêiner experimental, monte os ONNX
somente para leitura e injete as variáveis do mesmo modo. Consulte
[`.env.example`](.env.example) para os limiares, dispositivo e tamanhos. Para
voltar ao caminho padrão, use `VISION_DETECTOR=opencv`.

## Contrato de evidência para a etapa 02

- `versao_evidencia: 1` identifica o resultado YOLO de `POST /process` e da CLI.
  `frames_processados` conta todos os quadros decodificados por compatibilidade.
- `quadros[]` inclui cada quadro amostrado, mesmo quando a lista de candidatos
  está vazia. `frame` começa em zero e `segundo` deriva do FPS do vídeo.
- `quadros[].veiculos[]` contém `id` local ao quadro, `classe`, `caixa`
  e `confianca_detector` entre zero e um.
- `quadros[].placas[]` contém `classe`, `caixa`, `confianca_detector` e
  `veiculo_id`. Este último aponta para o único veículo com pelo menos
  80% da área da placa dentro da sua caixa ou é nulo em caso de ausência
  ou ambiguidade. As caixas usam `x,y,largura,altura` em pixels do vídeo
  original, inclusive com ROI.
- Cada candidato tem `ocr_executado`, `placa` normalizada ou nula e
  `confianca_ocr` nula quando indisponível. Quando presente, é a média
  da confiança TSV dos tokens Tesseract, escalada para 0–1. É distinta da
  confiança do detector e da proporção global de votos.
- `deteccoes[]` mantém o formato de leituras válidas para consumidores legados.
  No perfil YOLO, a `confianca` desse resumo é a do detector de placa.
  O consolidado global é diagnóstico. O rastreador da etapa 02 usa `quadros`
  diretamente para identificar passagens.
  O campo `video` pode conter o nome temporário do upload e não serve como
  identificador de origem ou de passagem. Os recortes podem ser extraídos
  da origem com os índices e caixas.

O orçamento padrão de OCR é um recorte por sequência provisória de veículo
em três quadros amostrados. A janela usa sobreposição de caixas entre quadros
adjacentes e escolhe por tamanho, nitidez e confiança. Recortes abaixo de
60×20 ficam como candidatos sem leitura. Essa associação tem duração limitada
à janela, reinicia a cada vídeo e serve para escolher recortes. A etapa 02
define identidade por passagem, direção, decisão e idempotência.

## Decisões por passagem e RTSP contínuo

O upload YOLO inclui `passagens[]` para diagnóstico. Configure
`VISION_PASSAGE_LINE_X` e `VISION_PASSAGE_ENTRY=right|left` no HTTP ou
`--line-x` e `--entry-decreases-x` na CLI, se a geometria do vídeo for conhecida.
As decisões do upload continuam no fluxo de revisão. O RTSP mantém um
rastreador por câmera e inicia as fontes autorizadas no boot.

1. Configure os ONNX do perfil YOLO. Defina `VISION_RTSP_ENABLED=true` e
   forneça `VISION_CAMERAS_FILE` com o caminho de um JSON privado. Cada
   fonte identifica a câmera, o sentido de entrada e uma linha vertical
   em coordenadas do quadro original.

   ```json
   [
     {
       "id": "portao-principal",
       "url": "rtsp://camera-da-portaria/stream",
       "line_x": 640,
       "entry": "right",
       "roi": "200,250,900,420",
       "every": 5
     }
   ]
   ```

2. Configure `VISION_API_URL` com o endereço da API e
   `VISION_INGEST_TOKEN` com a mesma credencial dedicada de pelo menos
   32 caracteres no worker e na API. Mantenha a instituição em Layer 2.
   Mantenha o JSON da câmera, credenciais e pesos em diretório privado.
   Para Compose local, monte-os em modo somente leitura e injete as
   variáveis por um override local. Dentro do Compose, use
   `VISION_API_URL=http://api:3000`.
3. Inicie `python server.py`. `GET /rtsp/status` mostra conexão, fila,
   quadros amostrados e descartes sem expor URLs. O painel Dev consulta
   `POST /rtsp/connect` com `{"camera_id":"portao-principal"}` e usa a
   mesma opção `VITE_RTSP_ENABLED`.

O worker só envia passagens confirmadas. A entrega usa uma fila em memória
com 64 eventos por padrão, um consumidor, timeout de três segundos e até
cinco tentativas para falhas transitórias. O mesmo ID é preservado nos
reenvios. A fila descarta novas decisões quando lota e descarta itens
após 60 segundos. A captura tenta reconectar com espera crescente
de até 30 segundos e contabiliza trilhas interrompidas em revisão local.
Uma reinicialização perde o conteúdo da fila.

## Benchmark local

Use Python 3.12, OpenCV 4.12.0.88, NumPy 2.2.6 e a mesma versão do
Tesseract em todos os perfis. `TESSERACT_CMD` aceita o caminho do executável.
Mantenha vídeos, rótulos, pesos e resultados fora do Git (por exemplo,
`../.stage01-local/`). A foto do teste de bancada é de Rudolf Stricker,
com licença de atribuição. O gerador redimensiona a foto, sobrepõe placas
fictícias e simula movimento, compressão e baixa luz. [Foto de origem](https://commons.wikimedia.org/wiki/File:Fiat_500_front_20080621.jpg).

```bash
python -m pip install opencv-python-headless==4.12.0.88 numpy==2.2.6 pytest==8.4.2
python benchmark_fixture.py ../.stage01-local/fiat.jpg ../.stage01-local/clips
VISION_DETECTOR=opencv python benchmark.py ../.stage01-local/clips/manifest.json
VISION_DETECTOR=yolo python benchmark.py ../.stage01-local/clips/manifest.json --use-roi --every 5
VISION_SMOKE_VIDEO=../.stage01-local/clips/dia.avi python -m pytest -q
```

Para vídeos reais, separe ajuste e avaliação por gravação ou câmera. O manifesto
de avaliação lista `video` relativo ao manifesto, `cenario`, `roi` opcional
e `passagens`. Cada passagem tem `inicio` e `fim` inclusivos (índice de
quadro), `placa` normalizada e `caixa` fixa ou `caixas` por índice de quadro
(coordenadas `[x,y,largura,altura]`). Exemplos negativos usam `passagens: []`.
A comparação usa a mesma verdade de referência para atribuir leituras a
veículos, com cobertura quando a IoU alcança 0,5 em ao menos um quadro.
O vencedor é o texto mais frequente sem empate. CER inclui ausências como
deleções e conta caracteres no total de passagens. Os tempos excluem a carga
dos modelos, informada separadamente, e medem o processamento de cada vídeo.
O benchmark usa uma thread OpenCV e três repetições por padrão.
Use `--output resultado.json` para gravar o JSON separadamente dos
diagnósticos emitidos por drivers de inferência.

Para comparar OCR nos mesmos recortes YOLO, use `--neural-ocr-model` com
o PP-OCRv4 inglês móvel exportado pelo RapidOCR v3.10.0, pesos Apache-2.0.
O SHA-256 é `e8770c967605983d1570cdf5352041dfb68fa0c21664f49f47b155abd3e0e318`.
O benchmark usa ONNX Runtime em CPU somente se esta opção for solicitada.
`--correct-positions` testa substituições de caracteres com formato
posicional único e mantém o OCR do serviço em modo estrito.
[Download PP-OCRv4](https://www.modelscope.cn/models/RapidAI/RapidOCR/resolve/v3.10.0/onnx/PP-OCRv4/rec/en_PP-OCRv4_rec_mobile.onnx) ·
[Registro de pesos](https://github.com/RapidAI/RapidOCR/blob/main/python/rapidocr/default_models.yaml) ·
[Licença dos pesos](https://github.com/RapidAI/RapidOCR/blob/main/python/MODEL_LICENSES.md).

```bash
python -m pip install onnxruntime==1.23.2
VISION_DETECTOR=yolo python benchmark.py ../.stage01-local/clips/manifest.json \
  --use-roi --neural-ocr-model ../.stage01-local/ppocr-en.onnx
```

## Gravação recomendada

Grave a placa de frente, com boa iluminação, sem zoom digital, mantendo o
veículo parado por alguns segundos e depois fazendo uma passagem lenta. Inclua
ângulos e condições de iluminação diferentes, sem publicar rostos ou outras
placas de terceiros.
