<div align="center">

<img src="https://img.shields.io/badge/status-em%20desenvolvimento-green?style=for-the-badge" />
<img src="https://img.shields.io/badge/licença-MIT-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/IFC-Videira%2FSC-darkgreen?style=for-the-badge" />
<br>
<br>
<img src="carcara.png" style="width: 150px">

# CARCARÁ SENTINELA

### Sistema de Autenticação e Controle de Acesso de Veículos em Instituições Federais de Ensino

---

</div>

## Problema

Institutos Federais de Ensino são ambientes com grande e constante circulação de pessoas, estudantes, servidores e visitantes, o que os torna vulneráveis quando não há monitoramento adequado. Em instituições que atendem alunos menores de idade, essa vulnerabilidade é ainda mais crítica.

O cenário brasileiro de insegurança agrava esse quadro: ambientes educacionais não estão imunes à violência urbana, e muitas instituições não dispõem de recursos suficientes para garantir a proteção necessária. O modelo tradicional de segurança, baseado em intervenções manuais na guarita, é suscetível a falhas humanas, não gera registros confiáveis e não oferece suporte à tomada de decisão em tempo real.

Sabe-se que conhecer o fluxo de acesso ao ambiente estudantil é primordial para uma cultura de segurança preventiva, e é exatamente essa lacuna que o projeto busca endereçar.

---

## Proposta

O **Carcará Sentinela** propõe um ecossistema de software integrado às câmeras LPR já existentes no campus, capaz de identificar automaticamente veículos cadastrados, alertar sobre acessos não reconhecidos e fornecer um painel de controle em tempo real para a equipe de segurança.

A solução é desenvolvida em **código aberto**, focada no cadastramento de servidores, alunos e visitantes, e gerenciada pelo próprio setor responsável da instituição. Indo além de uma barreira física, o sistema atua na **prevenção de incidentes** e no **controle de acessos indevidos**, gerando registros ágeis que promovem transparência para gestores, alunos e visitantes, sem restringir o caráter público da instituição.


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
```mermaid
flowchart TD
    A["Câmeras LPR (2x)"] e1@-->|JSON| B{"API de Ingestão \n(Express.js)"}
    e1@{ animate: true, curve: linear }
    B e2@--> C[(MongoDB)]
    B e3@--> D("Lógica de Whitelist \n(Cruzamento de Dados)")
    D e4@--> E("Dashboard Web \n(Vue.js)\nPainel Segurança")
    D e5@--> F("App Mobile (Ionic)\n Cadastro de Veículos\n Servidores/Alunos/Visitantes")
    e2@{ curve: linear }
    e3@{ curve: linear }
    e4@{ curve: linear }
    e5@{ curve: linear }
    
    style A fill:#dce8f5,stroke:#aac4e0
    style B fill:#D6FFDD,stroke:#00FF59
    style C fill:#EDEDED,stroke:#5E5E5E
    style D fill:#E9E8FF,stroke:#716BFF
    style E fill:#FFFDA1,stroke:#FFFD00
    style F fill:#FFFDA1,stroke:#FFFD00
```


## Fluxo de Acesso Veicular
 
```mermaid
flowchart LR
    A([Chegada do\nVeículo]) --> B[Leitura da Placa\ndo Veículo com LPR]
    B --> C[Extração dos Dados\npara JSON: Horário,\nPlaca e Cor]
    C --> D[(Análise do JSON\njunto ao Banco\nde Dados)]
 
    D --> E[Veículo Não\nEncontrado]
    D --> F[Veículo\nEncontrado]
 
    E --> G[Cadastro Simples\nVisitante]
    G --> H([Acesso\nLiberado])
 
    F --> I[Validação Humana\ndo Motorista com\no Veículo]
    I --> H
    I --> J([Intervenção\nHumana])
 
    style A fill:#dce8f5,stroke:#aac4e0
    style B fill:#dce8f5,stroke:#aac4e0
    style C fill:#dce8f5,stroke:#aac4e0
    style D fill:#EDEDED,stroke:#5E5E5E
    style E fill:#f5dcdc,stroke:#e0aaaa
    style G fill:#f5dcdc,stroke:#e0aaaa
    style J fill:#f5dcdc,stroke:#e0aaaa
    style F fill:#dcf5dc,stroke:#aae0aa
    style I fill:#dcf5dc,stroke:#aae0aa
    style H fill:#dce8f5,stroke:#aac4e0
```
 
## Fluxo do Aplicativo Mobile
 
```mermaid
flowchart LR
    L([Login]) --> R1[Possui Registro\nServidor/Aluno]
    L --> R2{Possui Registro\nde Visitante}
    L --> R3[Não possui\nRegistro]
 
    R1 --> A1[Editar/Cadastrar\nInformações]
    A1 --> BD[(Armazena\n no BD)]
 
    R2 --> A2[Quero fazer\numa visita]
    R2 --> A3[Cadastrar/Editar\nVeículos]
    A2 --> SC[Selecionar carro\ncadastrado]
    SC --> SD[Selecionar\ndata]
    SD --> BD
    A3 --> BD
 
    R3 --> TU{Tipo de Usuário\nServidor/Aluno\nou Visitante}
    TU --> V[Visitante:\nNome, Documento\ncom Foto, Placa,\nModelo e Cor]
    TU --> S[Servidor/Aluno:\nNome, Matrícula,\nDocumento com Foto,\nPlaca, Modelo e Cor]
    V --> BD
    S --> BD
 
    style L fill:#dce8f5,stroke:#aac4e0
    style SC fill:#E9E8FF,stroke:#716BFF
    style SD fill:#E9E8FF,stroke:#716BFF
    style BD fill:#EDEDED,stroke:#5E5E5E
    style S fill:#FFFDA1,stroke:#FFFD00
    style R1 fill:#FFB5D8,stroke:#FF007D
    style R2 fill:#D6FFDD,stroke:#00FF59
    style R3 fill:#FFCCCC,stroke:#FC0000
    style A1 fill:#E9E8FF,stroke:#716BFF
    style A2 fill:#dce8f5,stroke:#aac4e0
    style A3 fill:#E9E8FF,stroke:#716BFF
    style TU fill:#D6FFDD,stroke:#00FF59
    style V fill:#FFFDA1,stroke:#FFFD00
```

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
