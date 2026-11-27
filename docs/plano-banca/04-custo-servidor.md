# 04 — Medir consumo e estimar custo de servidor

## Missão

Quantifique o custo adicional da Layer 2 e identifique a configuração mais simples capaz de atender ao cenário do campus.

## Execução

1. Use os mesmos vídeos rotulados e critérios das etapas anteriores. Compare a linha de base e o pipeline integrado em CPU e, se disponível, em GPU. Separe inferência isolada de execução ponta a ponta. Faça medições com uma câmera e com mais de uma quando houver condições representativas.
2. Registre CPU, RAM, GPU e VRAM quando aplicável, latência p50/p95, taxa de quadros processados, filas, falhas e acerto por passagem. Informe hardware, sistema, duração, resolução, amostragem, modelo e concorrência. Diferencie média medida, pico medido e cenário estimado.
3. Compare opções locais e hospedadas de acordo com a topologia da etapa 05. Quando houver cotação, cite fonte, data, moeda, região e premissas. Inclua despesas recorrentes relevantes, como armazenamento e tráfego. Aponte os dados ainda necessários antes de estimar o cenário do IFC.

## Evidência de conclusão

- Comando de benchmark, tabela de resultados reproduzíveis e recomendação de perfil para piloto com uma câmera.
- Limite observado de carga, condições em que a configuração perde leituras e justificativa para usar CPU ou GPU. Registre os limites de latência e qualidade acordados para o piloto e indique quais perfis os satisfazem. Entregue à etapa 07 os valores medidos para dimensionamento e monitoramento.
