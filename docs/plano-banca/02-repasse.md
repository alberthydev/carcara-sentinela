# Etapa 02 — Confirmação por passagem

Execução local em 26/11/2026 sobre o repasse da etapa 01. A regra de
persistência e o contrato da passagem estão prontos para uso pela etapa 03.
Os limiares de visão ainda requerem uma validação com gravações autorizadas.

## Decisão do worker e contrato

`passage_tracker.py` usa associação exclusiva por IoU de pelo menos 0,25
para acompanhar veículos dentro de uma câmera. A linha vertical e seu
sentido são configurados em coordenadas do quadro original com uma margem
de 10 pixels. Para confirmar, a trajetória deve cruzar uma única vez e a
placa deve ter pelo menos três leituras em quadros distintos, com pelo
menos 75% dos votos válidos. A confiança mínima é 0,5 para cada detector
e 0,75 para OCR. Uma associação ambígua, empate ou trajetória interrompida
fica em revisão. Placas sem veículo não abrem trilha.

Cada decisão final do rastreador tem `versao: 2`, `camera_id`, `evento_id`,
`estado`, `motivo`, `placa`, `direcao`, `quadros`, `leituras`,
`confianca` e `liberacao_automatica`. O ID deriva da câmera, da sessão
de captura, do primeiro quadro e da trilha. A fila deve guardar e reenviar
o mesmo conteúdo e ID. O upload conserva `quadros` e inclui `passagens[]`
para diagnóstico. Seu consolidado continua sendo encaminhado à revisão.

A associação por IoU é uma primeira configuração de baixo custo. Os testes
incluem inversão de IDs locais entre quadros, dois sentidos simultâneos,
desaparecimento e oclusão ambígua. Compare com SORT ou ByteTrack depois de
obter trajetórias com cruzamentos, velocidades e oclusões reais. A comparação
do Tesseract com PP-OCRv4 segue reproduzível no benchmark da etapa 01.

## Persistência e revisão

- `POST /api/users/visao/evento` aceita o formato legado e a evidência
  versão 1 e responde `revisao`, sem consultar ou gravar acessos.
- `POST /api/users/visao/passagem` usa a credencial dedicada do worker
  e exige Layer 2. Só confirma decisão versão 2 com os mínimos de
  evidência e direção explícita. Placa sem correspondência única entre
  usuários ativos retorna `desconhecido`. Três resultados encerram a
  entrega. `conhecido` pode indicar reenvio, `desconhecido` ou
  `revisao` não gera gravação e HTTP 409 indica conflito para revisão.
- Entrada exige nenhum acesso em aberto. Saída exige exatamente um acesso
  aberto. O MongoDB guarda o ID no mesmo documento do acesso. O índice de IDs
  garante reenvio e o índice parcial impede duas entradas concorrentes pelos
  novos caminhos. A saída usa atualização condicional. Nenhum esquema
  existente é reescrito. O caminho manual antigo sem identificador mantém o
  comportamento anterior.
- No cartão existente de revisão, o operador verifica a passagem e escolhe
  **Confirmar entrada** ou **Confirmar saída**. A operação usa
  `/admin/acesso-manual` com o mesmo ID em reenvios da mesma confirmação.
  A escolha explícita evita que um duplo clique abra e feche o mesmo acesso.
  O contrato HTTP está no [OpenAPI](../../api/src/docs/openapi.yaml).

## Testes e limites

| Caso | Worker | API e MongoDB |
| --- | --- | --- |
| Placa isolada ou segurada sem veículo | Evidência sintética sem trilha | Resultado inconclusivo em revisão, zero gravações |
| Dois veículos, entrada e saída | Caixas sintéticas com IDs e votos independentes | Placas e acessos independentes, fechamento único |
| Poucos quadros, leitura fraca ou empate | Revisão, sem autorização | Baixa confiança deixa acesso existente intacto |
| Placa desconhecida | Decisão de trajetória independe do cadastro | `desconhecido`, zero gravações |
| Reenvios e corrida manual/automática | ID estável no mesmo processamento | Um acesso no MongoDB real, reenvios reconhecidos e conflito seguro |
| Histórico legado com dois acessos em aberto | — | Saída rejeitada para revisão, ambos preservados |

O worker foi validado com `python -m pytest -q vision-worker`. Na API,
`TEST_VISAO_MONGO_URI=mongodb://127.0.0.1:<porta> npm test` executou os
29 testes, incluindo 4 contra um MongoDB 5.0 independente em loopback
com banco descartável. Os dados de testes eram sintéticos. O teste de
pedestre usa evidência sintética de placa sem veículo. O teste com
uma pessoa e condições reais fica no aceite do campus.

Arquivos principais alterados nesta etapa incluem `passage_tracker.py`,
`test_passage_tracker.py`, `plate_worker.py`, `server.py`, Dockerfile e
exemplos do worker, controladores e rotas de visão e registro manual,
`models/RegistroAcesso.ts`, OpenAPI, testes da API e o painel existente
`DashSeguranca.vue`. Os comandos de tipo e build da API e do app passaram.
