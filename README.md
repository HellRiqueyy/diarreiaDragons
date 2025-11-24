# Projeto Autoagendamento de Consultas

## Descrição
Aplicação web para permitir que pacientes encontrem médicos por especialidade, visualizem horários disponíveis e agendem consultas. Médicos podem cadastrar sua disponibilidade (dias e horários) e receber avaliações dos pacientes.

## Recursos principais
- Cadastro de pacientes e médicos (cliente-side, Firestore).
- Login por CPF + senha (busca nas coleções `medicos` e `paciente`).
- Médico: define dias da semana e horários (intervalos de 30 minutos).
- Agenda: filtrar médicos por especialidade e dia, classificar por avaliação.
- Agendamento: escolher médico, data e horário; verificação para evitar duplicatas.
- Avaliações: pacientes podem avaliar médicos (1–5 estrelas); recomendações por especialidade.

## Tecnologias utilizadas

- HTML5
- CSS
- JavaScript
- Node.js + Express (backend)
- SQLite3 (banco local) — substituiu o uso anterior do Firebase/Firestore

## Estrutura do projeto
- `index.html` – landing page
- `pages/` – páginas principais (`login.html`, `agenda.html`, `cadastroMedico.html`, `cadastroPaciente.html`, `cadastroConsulta.html`, `medico.html`)
- `js/` – scripts do cliente (ex.: `login.js`, `cadastroMedico.js`, `cadastroConsulta.js`, `agenda.js`, `firebaseConfig.js`)
- `css/` – estilos (ex.: `style.css`)
- `assets/` – imagens e recursos estáticos

## Firestore — coleções e esquema esperado
- `medicos`:
  - `nome` (string)
  - `cpf` (string)
  - `telefone` (string)
  - `especialidade` (string)
  - `dias` (array de strings, ex.: `['segunda','terça']`)
  - `horarios` (array de strings, ex.: `['08:00','08:30', ...]`)
  - `senha` (string) — atualmente armazenada em texto; ver nota de segurança abaixo

- `paciente`:
  - `nome`, `cpf`, `telefone`, ...

- `consultas`:
  - `medicoId`, `medicoNome`, `date` (YYYY-MM-DD), `time` (HH:MM), `pacienteNome`, `pacienteCpf`, `createdAt`

- `avaliacoes`:
  - `medicoId`, `score` (number 1–5), `createdAt`


## Diagrama ER
https://app.brmodeloweb.com/#!/publicview/69211eec39eddf537c9b01f8

## Mockup
https://www.figma.com/design/CljNnSNn0auVmU1M84eZiC/diarreia?node-id=0-1&t=HGl6ikLVtUlTzVHk-1
https://www.figma.com/design/jdOAZLnltdZNlGgprz4RUU/Sem-t%C3%ADtulo?node-id=0-1&t=pwBORg5W1nJUY3Q4-1




## Solução:

  Esta é uma aplicação web feita em JS que permite os usuários marcarem suas próprias consultas, onde os médicos
poderão cadastrar a disponibilidade de sua agenda para o próximo mês e os pacientes utilizarão esta agenda para
verificar os horários disponiveis e marcar qual se encaixa melhor em sua rotina. 

# MENTOR ESCOLHIDO: 
## Ester Toja
 
## Contribuidores
- Gabriel Ferraz
- Henrique de Lima
- Henrique da Silva
- Nicolas Fernandes
- Pedro Arthur
- Wesley Minto