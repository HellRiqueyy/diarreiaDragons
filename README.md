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

## Estrutura de pastas

Resumo das pastas e arquivos principais:

- `index.html` — landing page
- `pages/` — páginas do frontend
	- `login.html` — tela de login
	- `cadastroPaciente.html` — cadastro de pacientes
	- `cadastroMedico.html` — cadastro de médicos
	- `agenda.html` — visualização de agenda / busca de médicos
- `js/` — scripts do cliente (ex.: `login.js`, `cadastroPaciente.js`, `api.js`, `agenda.js`)
- `css/` — arquivos de estilo (`style.css`, `login.css`, `rodape.css`, etc.)
- `assets/` — imagens e recursos (pasta `img/`)
- `contents/` — trechos HTML reutilizáveis (`header.html`, `rodape.html`)
- `server/` — backend em Node.js + Express
	- `server.js` — servidor e rotas API
	- `db.js` — inicialização e schema SQLite
	- `package.json` — dependências e scripts do backend
	- `data.sqlite` — arquivo do banco (gerado em runtime)

## Como executar (desenvolvimento)

1. Pré-requisitos
	 - Node.js (v14+ recomendado)
	 - npm

2. Instalar dependências do backend

```powershell
cd server
npm install
```

3. Iniciar o servidor (API + arquivos estáticos)

```powershell
cd server
node .\server.js
# ou, se preferir adicionar script start no package.json:
# npm start
```

4. Abrir o frontend

- Se o servidor estiver rodando, abra no navegador: `http://localhost:3000/pages/login.html` (ou outra página em `pages/`).
- Alternativamente, abra os arquivos HTML diretamente no navegador (`pages/*.html`) para testes estáticos, mas alguns recursos (como chamadas `fetch` para `/api/*`) requerem o servidor em execução.

## Testes rápidos

- Cadastro de paciente: `pages/cadastroPaciente.html` — preencha `nome`, `cpf`, `telefone`, `email`, `senha` e clique em `Cadastrar`.
- Login: `pages/login.html` — informe `cpf` e `senha`.
- Verifique os registros no banco (opcional):

```powershell
cd server
sqlite3 .\data.sqlite
# no prompt sqlite> execute, por exemplo:
SELECT id,nome,cpf,telefone,email FROM paciente ORDER BY id DESC LIMIT 10;
.exit
```


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
- Wesley Minto
- Pedro Arthur
