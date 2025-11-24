# Autoagendamento de Consultas

Breve README com instruções para executar e testar o projeto localmente.

**Descrição:**
- Aplicação web para pacientes encontrarem médicos por especialidade, visualizarem horários disponíveis e agendarem consultas. Médicos podem informar disponibilidade e pacientes podem avaliar atendimentos.

**Status atual:**
- Frontend: páginas estáticas em `pages/` e scripts em `js/`.
- Backend: `server/` com Node.js + Express e banco local `SQLite` (`server/data.sqlite`).

**Requisitos**
- Node.js (v14+ recomendado)
- npm

**Instalação e execução (desenvolvimento)**
- Instalar dependências do backend:

```
cd server
npm install
```

- Iniciar o servidor (API + arquivos estáticos):

```
cd server
node .\server.js
```

- Abra as páginas do frontend no navegador apontando para os arquivos em `pages/` (ex.: `pages/login.html`) ou acesse `http://localhost:3000/pages/login.html` caso o servidor esteja rodando e servindo o diretório raiz.

**Como testar cadastro de paciente / login**
- Página de cadastro: `pages/cadastroPaciente.html` — preencha `nome`, `cpf`, `telefone`, `email`, `senha` e clique em `Cadastrar`.
- Página de login: `pages/login.html` — informe `cpf` e `senha`.
- O servidor expõe os endpoints REST em `/api/*` (veja a seção abaixo).

**Endpoints importantes (resumo)**
- `POST /api/paciente` — cria ou atualiza paciente. Body JSON: `{ nome, cpf, telefone, email, senha }`.
- `GET /api/paciente/:cpf` — recuperar paciente por CPF.
- `POST /api/login` — login com `{ cpf, senha }`. Verifica médicos e pacientes.
- `POST /api/consultas` — criar consulta.
- `GET /api/medicos` — listar médicos.

**Banco de dados**
- O arquivo SQLite é `server/data.sqlite` (gera automaticamente na primeira execução se não existir).
- O schema é inicializado em `server/db.js`. Se você atualizar o schema, reinicie o servidor para aplicar alterações.

**Segurança (observações importantes)**
- Atualmente as senhas são armazenadas em texto puro no banco. Para produção, implemente hashing (ex.: `bcrypt`) antes de salvar e compare hashes no login. Posso ajudar a implementar isso.

**Estrutura do projeto (resumida)**
- `index.html` — página principal
- `pages/` — páginas do app (`login.html`, `cadastroPaciente.html`, `agenda.html`, etc.)
- `js/` — scripts do cliente (`login.js`, `cadastroPaciente.js`, `api.js`, ...)
- `css/` — estilos
- `server/` — backend Express + SQLite

**Contribuidores**
- Gabriel Ferraz
- Henrique de Lima
- Henrique da Silva
- Nicolas Fernandes
- Pedro Arthur
- Wesley Minto

---

Se quiser, atualizo este README com instruções mais detalhadas (ex.: como rodar em Docker, como exportar/inspecionar o SQLite, ou adicionar scripts `npm start`). Deseja que eu adicione instruções para rodar com `npm start` e um script de inicialização no `package.json` do `server/`?