# 01 — Acelerar a leitura com YOLO e OCR

## Missão

Implemente YOLO no vision-worker da Layer 2 para localizar veículos e placas, reduza o custo do OCR e meça o ganho. A banca classificou a velocidade como primordial e apontou o Tesseract como gargalo percebido.

## Execução

1. Leia [plate_worker.py](../../vision-worker/plate_worker.py), [server.py](../../vision-worker/server.py), os [testes do worker](../../vision-worker/test_plate_worker.py) e o [README do worker](../../vision-worker/README.md). Monte uma linha de base do processamento atual com comandos reproduzíveis e um conjunto rotulado. Separe amostras de ajuste e avaliação por gravação ou câmera. Use material autorizado e mantenha dados reais fora do Git.
2. Integre pesos YOLO que reconheçam as classes necessárias. Registre origem, versão, classes, licença do código e dos pesos e método de obtenção verificável. Confira a compatibilidade com a licença do projeto antes de distribuir dependências ou pesos. Parametrize modelo, dispositivo e resolução. Valide a configuração no carregamento e reutilize o modelo entre frames.
3. Mantenha amostragem e região de interesse. Antes do OCR, avalie tamanho e nitidez e corrija a perspectiva quando o recorte justificar. Compare Tesseract e um OCR neural no mesmo conjunto, incluindo placas antigas e Mercosul. Avalie correção por posição e meça o efeito sobre correspondências incorretas. Mantenha a linha de base acessível para benchmark e rollback.
4. Exponha resultados com caixas de veículo e placa, frame, confiança do detector e, quando disponível, confiança do OCR. Combine com a etapa 02 como os candidatos explícitos e a evidência passam para o rastreamento. Preserve o caminho de upload e valide o contrato com a API e o consumidor existente.

## Evidência de conclusão

- Compare primeiro CPU, os menores pesos disponíveis, amostragem, ROI e orçamento de OCR por veículo. Teste cada configuração no mesmo conjunto, incluindo celular, baixa iluminação, dois veículos e placa sem veículo. Teste GPU quando disponível. Registre perdas e mantenha provisória a escolha até validar acerto por passagem, cobertura de veículos, falsos registros e latência.
- Evidências YOLO experimentais passam pelo upload existente em modo de revisão. O contrato para rastreamento pode ser entregue antes do aceite experimental. A etapa 02 é responsável por confirmar passagens e habilitar persistência segura.

- Inferência YOLO real demonstrada em amostra com veículo e placa. Use fixtures pequenas para testes determinísticos de normalização, filtragem e contrato, e um teste separado com os pesos reais configurados.
- Comparação reproduzível por configuração com acerto exato por passagem, erro de caracteres, taxa de ausência de leitura, latência e tempo por etapa. Registre hardware, versões, parâmetros, tamanho da amostra e limitações. Identifique o OCR escolhido com base nos resultados ou deixe a decisão pendente com a evidência que falta.
- Passe ao orquestrador o comando de benchmark, a configuração de inferência, as amostras permitidas e o formato da evidência para a etapa 02.

Referências técnicas do fornecedor. [Modos de uso do YOLO](https://docs.ultralytics.com/modes/) · [Licenciamento da Ultralytics](https://www.ultralytics.com/license)

Comandos, medições e pendências desta execução estão no [repasse técnico](01-repasse.md).
