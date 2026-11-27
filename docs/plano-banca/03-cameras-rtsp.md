# 03 — Validar câmeras diferentes e implementar RTSP contínuo

## Missão

Implemente captura contínua na Layer 2 e prove que o pipeline funciona com fontes distintas. A banca pediu explicitamente um teste com a câmera de um celular.

## Execução

1. Leia [server.py](../../vision-worker/server.py) e os [Compose de desenvolvimento](../../docker-compose.dev.yml) e [de execução local](../../docker-compose.yml). Na linha de base, a função RTSP tentava ler o primeiro quadro. Preserve o processamento por upload e verifique a captura contínua sob configuração explícita.
2. Configure fonte, identificador, região de interesse, amostragem e sentido por câmera. Mantenha estado de rastreamento isolado por fonte. Use fontes autorizadas e mantenha credenciais fora de exemplos, relatórios e logs.
3. Envie eventos de forma assíncrona para a API. Defina limites de fila e concorrência, timeouts, reconexão e política de reenvio compatível com a idempotência da etapa 02. Registre o que acontece quando a câmera cai, a API fica indisponível ou a fila satura.
4. Execute uma matriz com vídeo gravado, câmera IP por RTSP e gravação de celular. Se houver fonte RTSP de celular disponível, identifique o teste de streaming separadamente. Anote câmera, resolução, FPS, iluminação, região de interesse, passagem esperada, latência e resultado. Simule indisponibilidade e confirme a retomada sem duplicar acessos.

## Evidência de conclusão

- Há pelo menos uma câmera IP validada em fluxo contínuo e uma captura de celular processada. Registre separadamente as fontes reais testadas e as simulações.
- O caminho de upload funciona, a Layer 1 continua funcional e há testes regressivos para reconexão e falhas de entrega.
- Passe a matriz de compatibilidade, os comandos e as configurações reproduzíveis às etapas de custo e demonstração. Vincule as gravações autorizadas ao manifesto de avaliação da etapa 01. Registre as métricas de qualidade e o tempo de processamento separadamente da latência ponta a ponta do RTSP.

Veja o [repasse da etapa 03](03-repasse.md) para a matriz de bancada, os comandos e os insumos que faltam.
