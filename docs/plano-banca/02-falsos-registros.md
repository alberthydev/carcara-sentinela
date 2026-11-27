# 02 — Prevenir falsos registros de acesso

## Missão

Implemente confirmação por passagem de veículo e trate leituras inconclusivas antes de gravar entrada ou saída. A banca citou uma pessoa a pé segurando uma placa como caso que precisa ser testado.

## Execução

A etapa 01 entrega evidência versionada por quadro e por candidato. Use-a para testes sintéticos enquanto faltarem amostras reais. A entrada experimental na API serve à revisão. A confirmação por passagem define o contrato que pode gravar entradas e saídas.

1. Use as detecções da etapa 01 para associar placa a um veículo e acompanhar o veículo entre quadros. Avalie SORT ou ByteTrack com as amostras disponíveis. Faça a decisão por passagem, usando a geometria da câmera e a trajetória quando aplicáveis. Mantenha estados e votos separados por câmera e veículo.
2. Selecione recortes de quadros distintos, vote por veículo, registre o motivo de uma decisão inconclusiva e produza no máximo um evento final por passagem. Distinga evidência insuficiente, placa desconhecida e passagem confirmada. Uma placa exibida sem veículo associado não pode gerar registro automático.
3. Revise [visaoController.ts](../../api/src/controllers/visaoController.ts) e os [testes da API](../../api/tests/api-layer1.test.ts). Na linha de base, a API podia alterar registros mesmo com `liberacao_automatica: false`. Verifique a regra antes de criar entrada ou encerrar acesso. Defina como a portaria confirma manualmente pelo fluxo atual e documente o contrato em [OpenAPI](../../api/src/docs/openapi.yaml). Caso um ajuste de integração seja indispensável, limite-o à confirmação nas telas existentes.
4. Identifique o evento de forma estável e trate reenvios e concorrência na persistência. Escolha de forma explícita como usar a direção observada, o estado anterior e o fluxo manual. Preserve registros históricos e o comportamento da Layer 1.

## Evidência de conclusão

- Casos verificados. Pessoa segurando placa, veículo válido, dois veículos na mesma cena, placa desconhecida, poucos quadros, empate, baixa confiança com placa cadastrada e com acesso em aberto, reenvio e corrida entre requisições.
- Cada caso informa o resultado no worker, na API e no MongoDB. Uma passagem rejeitada ou pendente deixa o estado de acesso intacto. A revisão manual existente tem um caminho verificável para registrar o acesso.
- Entregue à etapa RTSP o contrato, os estados que geram envio e as regras de reprocessamento seguro.

Veja o [repasse da etapa 02](02-repasse.md) para as verificações executadas e o contrato entregue.
