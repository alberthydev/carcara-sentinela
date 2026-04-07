#  Carcará Sentinela
## Sistema de Autenticação e Controle de Acesso de Veículos em Instituições Federais de Ensino

### Problema
É fato que a segurança universitária é negligenciada. Com a constante circulação de pessoas, as intituições se tornam ambientes vulneráveis e apoiar políticas de incentivo é imprescindível para reverter esse quadro.
> Como garantir a segurança do campus sem ferir o direito público de acesso?

### Solução
Uma das soluções possíveis é o monitoramento da entrada e saída de veículos automatizada, com identificação dos motoristas para manter um histórico de acesso que informa detalhes das presenças no campus.

### Implementação
Considerando que as câmeras possuem a tecnologia LPR (License Plate Recognition), o nosso objetivo principal é recolher essas informações para análise, conectando com uma base de cadastro. Assim, todos os veículos que acessarem a intituição, serão "conectados" a um responsável. A identificação seria dividida entre alunos/servidores (usando matrícula como identificador) e visitantes que podem se cadastrar a partir de um evento (criando uma ligação entre eles) ou como visita comum.
*****datapaths 


Será implementado um ecossistema composto por um sistema web e um aplicativo mobile, baseando-se em JavaScript. 
Principais etapas do processo:
- Ingestão de Dados: Integração com a API das câmeras para o recebimento de metadados em formato JSON;
- Persistência: Desenvolvimento do esquema de banco de dados para registro histórico de fluxos;
- Módulo de Cadastro: Interface para o registro e gerenciamento de veículos de servidores, alunos e visitantes;
- Inteligência de Cruzamento: Implementação da lógica de Whitelist para identificação automática de usuários cadastrados;
- Interface de Validação: Painel de controle em tempo real para suporte à decisão da equipe de segurança;
- Homologação: Testes de campo para validar a latência e a acurácia do sistema.

A stack tecnológica:
-  NodeJS;
-  VueJS;
-  MongoDB.
