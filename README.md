<div align="center">

<img src="https://img.shields.io/badge/status-em%20desenvolvimento-green?style=for-the-badge" />
<img src="https://img.shields.io/badge/licença-MIT-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/IFC-Videira%2FSC-darkgreen?style=for-the-badge" />

# CARCARÁ SENTINELA

### Sistema de Autenticação e Controle de Acesso de Veículos em Instituições Federais de Ensino

---

</div>

## Sobre o Projeto

O **Carcará Sentinela** é um sistema de monitoramento de acesso veicular desenvolvido para atender às demandas de segurança do campus do Instituto Federal Catarinense (IFC) — Videira/SC. A solução integra câmeras com tecnologia **LPR (License Plate Recognition)** já existentes na infraestrutura da instituição a um ecossistema de software moderno, permitindo o controle de acesso de servidores, alunos e visitantes de forma ágil, transparente e preventiva.

O projeto surge da necessidade de superar os modelos tradicionais de segurança passiva, atuando diretamente na **prevenção de incidentes** e no **controle de acessos indevidos**, sem restringir o caráter público da instituição.

---

## Objetivos

- Monitorar o fluxo de acesso veicular no campus em tempo real
- Automatizar a identificação de veículos cadastrados via lógica de **Whitelist**
- Fornecer um painel de controle para a equipe de segurança
- Reduzir a dependência de intervenções manuais na guarita
- Garantir transparência e rastreabilidade dos registros de acesso

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Linguagem base | JavaScript / TypeScript |
| Servidor / API | Node.js + Express.js |
| Frontend Web | Vue.js |
| Aplicativo Mobile | Ionic + Vue |
| Banco de Dados | MongoDB |
| Aquisição de dados | Câmeras LPR (infraestrutura existente) |

---

## Arquitetura do Sistema
usar mermaid

---

## Etapas de Desenvolvimento

**a) Ingestão de Dados** — Integração com a API das câmeras LPR para recebimento de metadados em formato JSON

**b) Persistência** — Modelagem do banco de dados para registro histórico dos fluxos de acesso

**c) Módulo de Cadastro** — Interface para registro e gerenciamento de veículos de servidores, alunos e visitantes

**d) Inteligência de Cruzamento** — Implementação da lógica de Whitelist para identificação automática de usuários cadastrados

**e) Interface de Validação** — Painel de controle em tempo real para suporte à decisão da equipe de segurança

**f) Homologação** — Testes de campo na guarita do campus para validar latência e acurácia do sistema

---

## Métricas de Avaliação

A eficácia do sistema será medida pela comparação entre:

- Placas com **correspondência imediata** no banco de dados (identificação automática)
- Placas que **exigiram intervenção manual** do segurança por ausência de cadastro

---

## Equipe

| Nome | Papel |
|---|---|
| Hygor Marques | Aluno pesquisador |
| Iarla Brito | Aluna pesquisadora |
| Isadora Cozendey | Aluna pesquisadora |
| Tiago Heineck | Professor orientador |
| Tiago Gonçalves | Professor orientador |
| Fabricio Bizzoto | Professor orientador |

> Instituto Federal Catarinense — Campus Videira/SC
> Curso Bacharelado em Ciência da Computação

---

## Cronograma

| Atividade | Fev | Mar | Abr | Mai | Jun |
|---|:---:|:---:|:---:|:---:|:---:|
| Definição do tema do projeto | ✅ | | | | |
| Definição de requisitos e estudo do padrão JSON das câmeras LPR | | ✅ | | | |
| Levantamento de referências | | ✅ | | | |
| Escolha das tecnologias | | ✅ | | | |
| Planejamento dos procedimentos e testes | | ✅ | | | |
| Modelagem do Banco de Dados e Setup do Ambiente | | | ✅ | | |
| Desenvolvimento da API de Ingestão | | | ✅ | ✅ | |
| Desenvolvimento do App de Cadastro | | | ✅ | ✅ | |
| Desenvolvimento do Dashboard do Segurança | | | | ✅ | ✅ |
| Testes de Integração e Homologação na Guarita | | | | | ✅ |
| Finalização do Relatório Técnico e Apresentação | | | | | ✅ |

---

## Referências

- CASTRO, J. P. *Segurança universitária: um desafio em tempos de insegurança.* Integração Multidisciplinar, Cap. 5. DOI: 10.63330/aurumpub.006-005
- STELZER, J. et al. *Segurança nas instituições federais de ensino: estudo de caso do IFSC Araranguá.* XVI CIGU, Arequipa, 2016.
- FERREIRA JUNIOR, A. et al. *Avanços e desafios na segurança universitária: um estudo na UFV.* Contribuciones a Las Ciencias Sociales, v. 18, n. 4, 2025.
- ANDRADE FILHO, O. E. *Violência urbana: uma análise do fenômeno na UFPB (Campus I).* Dissertação de Mestrado, UFPB, 2021.

---

<div align="center">

Desenvolvido com 💚 no **IFC Videira/SC** — 2026

</div>
