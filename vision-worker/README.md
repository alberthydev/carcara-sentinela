# Worker de visão computacional - Layer 2

Este protótipo processa um vídeo local, encontra regiões com proporção semelhante
a uma placa e usa o Tesseract para OCR. O resultado é um JSON, sem conexão com
MongoDB ou com a API.

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

O endpoint recebe apenas o resultado consolidado (`placa_recomendada`,
`confianca_recomendada` e `liberacao_automatica`). Ele cruza a placa com a
whitelist e registra o acesso somente quando a decisão automática está
habilitada. Resultados com confiança insuficiente retornam `revisao`.

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

O detector inicial é deliberadamente experimental. O worker rejeita recortes
muito pequenos e isola falhas do processo Tesseract para que uma leitura ruim
não encerre todo o processamento. As leituras devem ser comparadas em vários
frames. O resultado inclui `placa_recomendada`, `confianca_recomendada` e
`liberacao_automatica`; por padrão, o worker exige pelo menos três leituras
iguais e confiança mínima de 0,75 antes de liberar automaticamente. Leituras
divergentes continuam no JSON para revisão, e empates entre placas não permitem
liberação automática. Esta é a primeira etapa de melhoria; a próxima será
substituir a detecção por contornos por um detector treinado ou calibrado com
vídeos reais do campus, além de enviar eventos normalizados para a API.

## Gravação recomendada

Grave a placa de frente, com boa iluminação, sem zoom digital, mantendo o
veículo parado por alguns segundos e depois fazendo uma passagem lenta. Inclua
ângulos e condições de iluminação diferentes, sem publicar rostos ou outras
placas de terceiros.
