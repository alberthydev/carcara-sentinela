# Orquestração das melhorias do Carcará Sentinela

Use este arquivo como ponto de entrada. Cada roteiro é uma tarefa de implementação para um agente de IA. O objetivo é responder à devolutiva da banca de 06/11/2026, evoluir a Layer 2 e, por último, preparar uma versão candidata para produção. A melhoria visual e de usabilidade da interface da portaria fica fora deste pacote.

## Ordem de execução

| Etapa | Roteiro | Dependências |
| --- | --- | --- |
| 01 | [Velocidade, YOLO e OCR](01-velocidade-yolo-ocr.md) | Primeira entrega técnica |
| 02 | [Prevenção de falsos registros](02-falsos-registros.md) | Contrato e detecções da etapa 01 |
| 03 | [Compatibilidade de câmeras e RTSP](03-cameras-rtsp.md) | Pipeline e ingestão das etapas 01 e 02 |
| 04 | [Consumo de recursos e custo de servidor](04-custo-servidor.md) | Meça após 01 a 03. Feche a estimativa após receber a topologia da 05 |
| 05 | [Esclarecimento sobre hospedagem](05-hospedagem.md) | Investigação independente. Entregue a topologia antes de fechar 04 |
| 06 | [Demonstração e apresentação](06-demonstracao.md) | Integração de 01 a 03, medições de 04 e evidências de 05. Identifique cenários pendentes |
| 07 | [Preparação para produção](07-producao.md) | Todas as etapas anteriores integradas e verificadas |

## Como conduzir o trabalho

1. Leia o estado do checkout e os arquivos indicados no roteiro antes de delegar. Passe ao agente o roteiro correspondente e as decisões efetivamente tomadas nas dependências. Use mudanças isoladas quando necessário e preserve alterações do usuário.
2. Integre em ordem de dependência. Os agentes das etapas 01 a 03 compartilham o worker e o contrato da API. Execute essas etapas em sequência e inclua, no repasse, campos do contrato, configuração, versões de modelos e comandos de validação.
3. Para aceitar uma etapa, confira a evidência pedida e reproduza os testes relevantes. Preserve o fluxo Layer 1 de câmeras LPR e SSE, o processamento por upload e a compatibilidade dos exemplos existentes, salvo mudança explicitamente tratada no roteiro.
4. Registre em cada repasse os arquivos modificados, decisões e justificativas, comandos e resultados reais, artefatos, limitações, pendências e impacto sobre a próxima etapa. Diferencie evidência sintética, teste com hardware real e estimativa. Se faltar câmera, vídeo autorizado, pesos, hardware ou acesso ao ambiente, continue o trabalho independente e registre a checagem bloqueada.
5. Acione a etapa 07 por último. Se houver bloqueadores de validação, conclua a preparação reproduzível e mantenha a liberação condicionada à evidência faltante. Qualquer publicação em ambiente externo, aplicação de mudanças de infraestrutura ou ativação em uma portaria real depende de autorização e acesso ao ambiente.

O encerramento entrega os pontos da banca implementados ou verificados, a evidência da integração e um parecer sobre a prontidão da versão candidata. Uma etapa fica concluída quando atende aos seus critérios, mesmo que o agente tenha escolhido uma implementação diferente da sugerida e documentado a justificativa.

## Cobertura e arquivos compartilhados

| Ponto da banca | Etapa | Arquivos e limites de edição |
| --- | --- | --- |
| Velocidade e gargalo do Tesseract | 01 | Worker, testes e benchmark. Na API, isole a evidência experimental de gravações de acesso |
| Placa segurada por pedestre e falsos registros | 02 | Worker, controlador, OpenAPI, persistência e testes da API. Ajustes nas telas existentes só para transportar estado |
| Câmeras distintas e celular | 03 | Worker, servidor HTTP e configuração local do Compose. Reutilize a decisão e a idempotência de 02 |
| Consumo e custo de servidor | 04 | Benchmark e relatório. Combine os resultados medidos com a topologia de 05 |
| Onde o sistema roda | 05 | Documentação operacional. O CD publica imagens no GHCR e o Compose descreve execução local. Confirme um ambiente servido separadamente |
| Telas e imagens legíveis na banca | 06 | Apresentação e imagens autorizadas. A melhoria visual e de usabilidade da portaria permanece fora do escopo |
| Preparação para produção | 07 | Última etapa. Compose, Dockerfiles, CI/CD e operação após integrar os repasses anteriores |

Use a mesma avaliação rotulada em cada perfil. Reaproveite a matriz entre 01, 03 e 04 e registre os limites de latência do piloto antes de eleger uma configuração. O contrato versionado da etapa 01 permite começar a etapa 02 com testes sintéticos. O aceite experimental da etapa 01 continua condicionado a inferência real, amostras representativas e comparação de custo e qualidade.

Consulte o [repasse técnico da etapa 01](01-repasse.md) para o estado da implementação, as medições locais e os critérios ainda pendentes.

Os repasses da [etapa 02](02-repasse.md) e da [etapa 03](03-repasse.md) registram confirmação por passagem, persistência e captura RTSP verificadas localmente. A matriz do campus segue pendente antes do dimensionamento do piloto.

O [roteiro de demonstração](06-repasse.md) registra o ensaio com dados fictícios e a contingência para a banca.
