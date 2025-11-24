const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'data.sqlite');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error('Erro abrindo DB:', err);
  else console.log('SQLite DB aberto em', DB_PATH);
});

// Inicializar tabelas
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS medicos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    cpf TEXT UNIQUE,
    telefone TEXT,
    nomeClinica TEXT,
    enderecoClinica TEXT,
    especialidade TEXT,
    dias TEXT,
    horarios TEXT,
    senha TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS paciente (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    cpf TEXT UNIQUE,
    telefone TEXT
    ,email TEXT
    ,senha TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS consultas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    medicoId INTEGER,
    medicoNome TEXT,
    date TEXT,
    time TEXT,
    pacienteNome TEXT,
    pacienteCpf TEXT,
    createdAt TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS avaliacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    medicoId INTEGER,
    score INTEGER,
    createdAt TEXT
  )`);
  // ensure extra columns exist: disponibilidadeSemanal and disponibilidades
  db.get("PRAGMA table_info(medicos)", (err, info)=>{});
  db.all("PRAGMA table_info(medicos)", (err, cols)=>{
    if(err) return console.error('Erro verificando colunas medicos', err);
    const names = cols.map(c=>c.name);
    if(!names.includes('disponibilidadeSemanal')){
      db.run('ALTER TABLE medicos ADD COLUMN disponibilidadeSemanal TEXT');
    }
    if(!names.includes('disponibilidades')){
      db.run('ALTER TABLE medicos ADD COLUMN disponibilidades TEXT');
    }
    if(!names.includes('nomeClinica')){
      db.run('ALTER TABLE medicos ADD COLUMN nomeClinica TEXT');
    }
    if(!names.includes('enderecoClinica')){
      db.run('ALTER TABLE medicos ADD COLUMN enderecoClinica TEXT');
    }
  });
  // ensure paciente has email and senha columns (for existing DBs)
  db.all("PRAGMA table_info(paciente)", (err, cols)=>{
    if(err) return console.error('Erro verificando colunas paciente', err);
    const names = cols.map(c=>c.name);
    if(!names.includes('email')){
      db.run('ALTER TABLE paciente ADD COLUMN email TEXT');
    }
    if(!names.includes('senha')){
      db.run('ALTER TABLE paciente ADD COLUMN senha TEXT');
    }
  });
});

module.exports = db;
