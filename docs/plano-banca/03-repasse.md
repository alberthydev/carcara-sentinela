# Etapa 03 — Captura contínua RTSP

Implementação e verificação local em 26/11/2026. O serviço consome decisões
da etapa 02 e mantém captura, rastreamento e reconexão por câmera.
O aceite em câmera IP e com vídeo real de celular segue pendente.

## Configuração e recuperação

- O worker lê somente fontes configuradas em `VISION_CAMERAS_FILE`. Cada
  câmera tem identificador, URL privada, linha, sentido, amostragem e ROI.
  `GET /rtsp/status` expõe estados e contadores. O painel Dev consulta
  pelo identificador, sem transportar credenciais. O upload e a Layer 1
  mantêm seus próprios caminhos.
- A captura usa FFmpeg por OpenCV, TCP por padrão, timeouts de abertura
  e leitura (4 s e 3 s) e reconexão com espera de até 30 s. Cada
  reconexão começa uma sessão de rastreamento. A trilha interrompida
  entra em revisão local. O worker retém no máximo uma janela de OCR
  por câmera.
- Um consumidor atende a fila em memória de até 64 itens por padrão.
  O worker contabiliza fila cheia, respostas, retentativas e descartes.
  Timeout, HTTP 429 e indisponibilidade transitória têm até cinco tentativas
  com o mesmo ID. O evento expira após 60 s na fila. A fila é volátil e
  o worker descarta os novos itens quando enche. A equipe do piloto
  deve definir os limites operacionais e a política de durabilidade.
- `VISION_RTSP_ENABLED` continua desativado na configuração padrão dos
  dois arquivos Compose. Para um ensaio local, forneça configuração
  privada e overrides conforme o [README do worker](../../vision-worker/README.md).

## Matriz local

| Fonte ou falha | Evidência desta execução | Para aceitar no piloto |
| --- | --- | --- |
| Upload de vídeo | AVI de bancada com pesos YOLO reais e upload legado com vídeo sintético | Vídeos autorizados rotulados por gravação |
| RTSP contínuo | Clipe diurno licenciado, com placa fictícia, transmitido por go2rtc/FFmpeg em H.264 TCP a 1280×576 e 15 fps. O OpenCV leu quadros diferentes em sequência | Câmera IP autorizada com ROI, linha e sentido verificados |
| Interrupção RTSP | Fonte local interrompida e reiniciada. O serviço passou por `connected`, `reconnecting` e `connected`. Os quadros amostrados passaram de 5 para 12 e depois 17. Uma trilha interrompida foi para revisão e o worker enviou zero decisões nesse clipe | Queda e reconexão da câmera física |
| Queda da API e saturação | Timeout e fila cheia simulados. Um servidor HTTP em loopback devolveu 503 e então recebeu o mesmo evento. A API verificou deduplicação real em MongoDB em suíte separada | Testar o percurso completo e medir latência em rede representativa |
| Celular | O manifesto da etapa 01 possui tremor e compressão simulados | Vídeo de celular real e RTSP de celular se houver fonte autorizada |

`python -m pytest -q vision-worker` passou 36 testes com
`VISION_SMOKE_VIDEO` e `VISION_TEST_RTSP_URL` configurados. Os 29 testes
da API e os 2 do app passaram. Compose local e de desenvolvimento passaram
em `docker compose config --quiet`. `docker build --tag
carcara-sentinela-vision-worker:stage03 vision-worker` passou e a imagem
importou o serviço com RTSP desativado em um contêiner sem rede.

Para reproduzir a fonte de bancada, use o clipe `dia.avi` do
[repasse da etapa 01](01-repasse.md). Monte-o somente para leitura em
um servidor go2rtc local e publique apenas a porta RTSP em loopback.
A fonte usada empregou FFmpeg por `exec:` com
`-re -stream_loop -1 -i /bench/clips/dia.avi -an -c:v libx264`
e saída `-rtsp_transport tcp -f rtsp {output}`. Configure
`VISION_TEST_RTSP_URL=rtsp://127.0.0.1:<porta>/bancada` para executar
o teste de decodificação. [Configuração exec do go2rtc](https://github.com/AlexxIT/go2rtc/blob/master/internal/exec/README.md).

No ensaio de interrupção, usou-se uma porta fixa em loopback e
`docker stop -t 1` seguido de `docker start` no contêiner da fonte.
A publicação dinâmica de porta mudou ao reiniciar no primeiro ensaio.
Para reproduzir com o mesmo endereço depois da queda, use o mapeamento
`-p 127.0.0.1:<porta-livre>:8554`. Linha da bancada em x=300,
amostragem a cada cinco quadros e ROI de quadro completo.

Arquivos principais alterados nesta etapa incluem `rtsp_worker.py`,
`test_rtsp_worker.py`, `server.py`, Dockerfile, exemplo de ambiente,
README e o campo de consulta RTSP existente em `DashboardMainView.vue`.
O dimensionamento da etapa 04 ainda precisa de uma matriz representativa
e de medidas ponta a ponta por câmera. Os benchmarks de bancada da etapa
01 fornecem os perfis e a linha de base para repetir a comparação.
