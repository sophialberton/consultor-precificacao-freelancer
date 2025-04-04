# Calculadora de Hora para Freelas

## Objetivo do Sistema
Criar uma calculadora interativa que permita freelancers identificarem o valor ideal da sua hora de trabalho com base em fatores como carga horária, dias trabalhados, férias e valor total de projetos, levando em consideração também custos fixos e variáveis. O sistema será dividido em duas versões: gratuita e autenticada (com login).

---

## Requisitos Funcionais (RF)

### Versão Gratuita (sem login)

#### Cálculo da hora de trabalho
- **RF01**: O sistema deve permitir ao usuário inserir o salário líquido desejado mensalmente.
- **RF02**: O sistema deve permitir ao usuário informar quantas horas pretende trabalhar por dia.
- **RF03**: O sistema deve permitir ao usuário informar quantos dias pretende trabalhar por semana.
- **RF04**: O sistema deve permitir ao usuário informar quantos dias/semanas deseja tirar de férias por ano.
- **RF05**: O sistema deve calcular automaticamente o valor da hora com base nas informações acima e exibir esse valor ao usuário.

#### Registro de custos
- **RF06**: O sistema deve permitir o usuário cadastrar custos associados ao seu trabalho.
- **RF07**: Cada custo deve conter:
  - Descrição (campo texto)
  - Valor (campo numérico)
  - Tipo (fixo ou variável)
- **RF08**: O sistema deve considerar os custos informados para refinar o valor da hora final.

#### Cálculo do valor de um projeto (JOB)
- **RF09**: O sistema deve permitir o usuário informar:
  - A hora técnica calculada (gerada automaticamente)
  - Quantas horas por dia trabalhará no projeto
  - Quantos dias dedicará ao projeto
- **RF10**: O sistema deve exibir o valor ideal que o projeto deveria pagar com base nessas informações.

#### Formulário do Desafio He4rtLabs
- **RF11**: O sistema deve conter um formulário com os seguintes campos:
  - Valor total do projeto
  - Quantidade de horas trabalhadas por dia
  - Dias efetivos trabalhados na semana
  - Dias de férias pelo projeto
- **RF12**: O sistema deve calcular e exibir o valor da hora do projeto com base na fórmula:
  ```
  valorHora = (valorProjeto / (diasEfetivos * 4 * horasDiarias) ) + ( ( diasFerias * diasEfetivos * horasDiarias ) )
  ```

#### Informação Educacional
- **RF13**: O sistema deve exibir uma página que explique cada uma das variáveis e o propósito do projeto.
- **RF14**: Essa página deve conter a identidade visual da He4rt (logo, cores, link).

---

### Versão com Login (autenticada)

#### Gerenciamento de Projetos
- **RF15**: O sistema deve permitir o usuário criar, editar e excluir múltiplos projetos.
- **RF16**: Para cada projeto, o sistema deve armazenar:
  - Nome
  - Descrição
  - Data de início
  - Data prevista de entrega
  - Valor desejado pelo projeto
  - Hora técnica usada
  - Férias planejadas para o projeto

#### Registro de Horas por Dia
- **RF17**: O sistema deve permitir ao usuário registrar quantas horas trabalhou em cada projeto por dia.
- **RF18**: O usuário poderá dividir o dia entre múltiplos projetos com registro de:
  - Hora de início e fim de cada bloco de trabalho por projeto
- **RF19**: O sistema deve calcular:
  - Horas totais trabalhadas por projeto/dia/semana/mês
  - Valor ganho até o momento em cada projeto
  - Projeção de ganhos para os próximos dias/semanas com base na agenda

#### Agenda Personalizada
- **RF20**: O sistema deve permitir visualizar e editar a agenda semanal/mensal com os registros de trabalho.
- **RF21**: O sistema deve permitir agendar horários futuros por projeto.

#### Relatórios e Dashboard
- **RF22**: O sistema deve exibir em painel:
  - Projetos em andamento
  - Projetos finalizados
  - Horas totais dedicadas por projeto
  - Valor recebido/calculado por projeto
  - Total de dias de férias usados e restantes
- **RF23**: O sistema deve exibir um resumo financeiro global considerando todos os projetos ativos.

#### Histórico de Projetos
- **RF24**: O sistema deve permitir arquivar projetos finalizados com:
  - Descrição
  - Duração total
  - Horas trabalhadas
  - Valor final recebido
  - Relatório de execução

---

## Requisitos Não Funcionais (RNF)

- **RNF01**: O sistema deve validar todos os campos numéricos para aceitar apenas números positivos.
- **RNF02**: O sistema deve funcionar em dispositivos desktop e mobile (design responsivo).
- **RNF03**: O layout da versão gratuita deve seguir a identidade visual da He4rt (logo, cores, link para comunidade).
- **RNF04**: O sistema deve ser leve, carregando todas as funcionalidades principais em até 3 segundos.
- **RNF05**: O código-fonte deve ser documentado e separado por componentes (em caso de framework como React).
- **RNF06**: O sistema com login deve garantir segurança dos dados dos usuários (uso de autenticação segura e armazenamento protegido).
- **RNF07**: A agenda e os registros de trabalho devem utilizar corretamente a data e hora do sistema local.
- **RNF08**: O sistema deve possibilitar exportação de relatórios por projeto em PDF ou CSV (versão com login).
- **RNF09**: O sistema deve ser desenvolvido com foco em acessibilidade (uso de labels, contraste adequado, navegação por teclado).
- **RNF10**: O sistema deve ter testes de funcionalidade para os cálculos principais (unitários).

