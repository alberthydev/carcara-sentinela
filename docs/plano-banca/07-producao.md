# 07 — Preparar a versão candidata para produção

## Missão

Execute esta tarefa por último, após a integração e verificação das etapas 01 a 06. Prepare uma implantação reproduzível para a topologia definida, valide-a em ambiente de testes ou homologação e documente como ativar, acompanhar e reverter a versão.

## Execução

1. Revise [Compose](../../docker-compose.yml), Dockerfiles, [CI](../../.github/workflows/ci.yml), [CD](../../.github/workflows/cd.yml) e arquivos de exemplo de ambiente. Defina configuração de produção, imagens identificadas por versão imutável e forma de distribuir os pesos verificados do modelo. Mantenha o desenvolvimento local utilizável.
2. Configure armazenamento persistente e recuperação, segredos fornecidos pelo ambiente, TLS no ponto de entrada, acesso do worker à API e rede restrita para MongoDB, worker e câmeras conforme a topologia. Valide variáveis na inicialização e documente autenticação, origens permitidas e retenção das evidências.
3. Garanta prontidão e diagnóstico do banco, carregamento do modelo, câmera e entrega de eventos. Use os limites medidos na etapa 04 para acompanhar latência, filas e falhas. Inclua verificações operacionais de perda de câmera, queda da API, saturação e retorno do serviço.
4. Documente comandos de implantação e verificação, configuração de rede e requisitos para o operador. Defina backup, restauração e rollback de imagens, configuração e modelo. Caso haja mudança persistente de esquema, ensaie a atualização com dados representativos e verifique compatibilidade com o rollback.
5. Execute testes, type-check, builds, validação da configuração de deploy, smoke test das duas Layers e ensaio de rollback. Em homologação, confira o fluxo por upload e ao vivo, revisão de baixa confiança, deduplicação e os cenários negativos da banca. Registre o ambiente de cada validação.

## Evidência de conclusão

- Configuração de deploy versionada, artefatos rastreáveis e procedimento reproduzível por outro operador. Os pesos usados na versão candidata têm revisão, SHA-256 e termos de uso e distribuição aprovados para a topologia institucional.
- Relatório de homologação com versão, comandos, resultados reais, restauração e rollback ensaiados, além de pendências com responsável e evidência necessária.
- Parecer explícito sobre prontidão para produção. A publicação ou ativação em ambiente institucional requer autorização. Se faltar evidência essencial, identifique o que ficou preparado e o que impede a liberação.
