# 05 — Esclarecer onde a aplicação roda

## Missão

Responda à pergunta da banca sobre nuvem com evidências verificáveis e defina a topologia que a última etapa deverá preparar.

## Execução

1. Examine [README](../../README.md), [Docker Compose](../../docker-compose.yml) e os [workflows de entrega](../../.github/workflows/cd.yml). Identifique evidências de execução local, publicação de imagens e implantação em um ambiente que serve o sistema. Confirme o que existe usando apenas ambientes ou informações aos quais já há acesso autorizado.
2. Registre no README ou na documentação de operação o estado verificado, a data e a evidência. Para cada ambiente identificado, indique onde rodam interface, API, MongoDB e worker, onde estão as câmeras e como o tráfego chega à API. Caso a hospedagem atual não possa ser verificada, informe o que falta confirmar.
3. Proponha uma topologia para o piloto, considerando conectividade da rede das câmeras, latência, custo e operação. Defina onde ficam as evidências de acesso, como o operador acessa o sistema e quais decisões dependem da instituição.

## Evidência de conclusão

- Resposta curta e verificável para a banca sobre hospedagem atual e topologia proposta.
- Referências para os artefatos publicados ou para o ambiente confirmado. Entregue a topologia e suas dependências ao agente de produção. Esta tarefa é de investigação e documentação.
