const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Servir arquivos estáticos do frontend (diretório pai do server)
const STATIC_ROOT = path.join(__dirname, '..');
app.use(express.static(STATIC_ROOT));

// Forçar envio de index para rotas não-API (opcional)
app.get('/', (req, res) => res.sendFile(path.join(STATIC_ROOT, 'index.html')));

// Helpers to parse JSON fields stored as TEXT
function parseJsonField(val){
  try{ return val ? JSON.parse(val) : []; } catch(e){ return []; }
}

// Login: checar medicos e pacientes
app.post('/api/login', (req, res) => {
  const { cpf, senha } = req.body;
  if(!cpf || !senha) return res.status(400).json({ error: 'cpf/senha required' });

  db.get('SELECT * FROM medicos WHERE cpf = ? AND senha = ?', [cpf, senha], (err, row) => {
    if(err) return res.status(500).json({ error: 'db error' });
    if(row){
      row.horarios = parseJsonField(row.horarios);
      row.dias = parseJsonField(row.dias);
      return res.json({ role: 'medico', user: row });
    }

    // checar paciente também pela senha
    db.get('SELECT * FROM paciente WHERE cpf = ? AND senha = ?', [cpf, senha], (err2, p) => {
      if(err2) return res.status(500).json({ error: 'db error' });
      if(p){
        return res.json({ role: 'paciente', user: p });
      }
      return res.status(401).json({ error: 'Usuário não encontrado' });
    });
  });
});

// List medicos (opcional filtro por especialidade)
app.get('/api/medicos', (req, res) => {
  const { especialidade } = req.query;
  const params = [];
  let sql = 'SELECT * FROM medicos';
  if(especialidade){ sql += ' WHERE especialidade = ?'; params.push(especialidade); }
  db.all(sql, params, (err, rows) => {
    if(err) return res.status(500).json({ error: 'db error' });
    rows.forEach(r=>{ r.horarios = parseJsonField(r.horarios); r.dias = parseJsonField(r.dias); });
    res.json(rows);
  });
});

// Get medico by id
app.get('/api/medicos/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM medicos WHERE id = ?', [id], (err, row) => {
    if(err) return res.status(500).json({ error: 'db error' });
    if(!row) return res.status(404).json({ error: 'Not found' });
    row.horarios = parseJsonField(row.horarios);
    row.dias = parseJsonField(row.dias);
    row.disponibilidadeSemanal = parseJsonField(row.disponibilidadeSemanal);
    row.disponibilidades = parseJsonField(row.disponibilidades);
    res.json(row);
  });
});

// Avaliacoes por lista de medicoIds (query param medicoIds=1,2,3)
app.get('/api/avaliacoes', (req, res) => {
  const medicoIds = req.query.medicoIds;
  if(!medicoIds) return res.json([]);
  const ids = medicoIds.split(',').map(x=>parseInt(x)).filter(Boolean);
  if(ids.length === 0) return res.json([]);
  const placeholders = ids.map(()=>'?').join(',');
  db.all(`SELECT * FROM avaliacoes WHERE medicoId IN (${placeholders})`, ids, (err, rows) => {
    if(err) return res.status(500).json({ error: 'db error' });
    res.json(rows);
  });
});

// Add avaliacao
app.post('/api/avaliacoes', (req, res) => {
  const { medicoId, score } = req.body;
  if(!medicoId || !score) return res.status(400).json({ error: 'medicoId/score required' });
  const createdAt = new Date().toISOString();
  db.run('INSERT INTO avaliacoes (medicoId, score, createdAt) VALUES (?,?,?)', [medicoId, score, createdAt], function(err){
    if(err) return res.status(500).json({ error: 'db error' });
    res.json({ id: this.lastID });
  });
});

// Create or update medico by CPF
app.post('/api/medicos', (req, res) => {
  const { nome, cpf, telefone, especialidade, dias, horarios, email, crm, senha } = req.body;
  if(!cpf) return res.status(400).json({ error: 'cpf required' });
  // check if exists
  db.get('SELECT * FROM medicos WHERE cpf = ?', [cpf], (err, row) => {
    if(err) return res.status(500).json({ error: 'db error' });
    const diasStr = JSON.stringify(dias || []);
    const horariosStr = JSON.stringify(horarios || []);
    const disponibilidadeSemanalStr = JSON.stringify(req.body.disponibilidadeSemanal || {});
    const disponibilidadesStr = JSON.stringify(req.body.disponibilidades || []);
    if(row){
      // update
      db.run('UPDATE medicos SET nome = ?, telefone = ?, especialidade = ?, dias = ?, horarios = ?, disponibilidadeSemanal = ?, disponibilidades = ?, email = ?, crm = ?, senha = ? WHERE cpf = ?', [nome, telefone, especialidade, diasStr, horariosStr, disponibilidadeSemanalStr, disponibilidadesStr, email || '', crm || '', senha || '', cpf], function(uerr){
        if(uerr) return res.status(500).json({ error: 'db error' });
        return res.json({ updated: true });
      });
    } else {
      // insert
      db.run('INSERT INTO medicos (nome, cpf, telefone, especialidade, dias, horarios, disponibilidadeSemanal, disponibilidades, senha) VALUES (?,?,?,?,?,?,?,?,?)', [nome, cpf, telefone, especialidade, diasStr, horariosStr, disponibilidadeSemanalStr, disponibilidadesStr, senha || ''], function(ierr){
        if(ierr) return res.status(500).json({ error: 'db error' });
        return res.json({ id: this.lastID });
      });
    }
  });
});

// Create paciente
app.post('/api/paciente', (req, res) => {
  const { nome, cpf, telefone, email, senha } = req.body;
  if(!cpf) return res.status(400).json({ error: 'cpf required' });
  db.get('SELECT * FROM paciente WHERE cpf = ?', [cpf], (err, row) => {
    if(err) return res.status(500).json({ error: 'db error' });
    if(row){
      db.run('UPDATE paciente SET nome = ?, telefone = ?, email = ?, senha = ? WHERE cpf = ?', [nome, telefone, email || '', senha || '', cpf], function(uerr){
        if(uerr) return res.status(500).json({ error: 'db error' });
        return res.json({ updated: true });
      });
    } else {
      db.run('INSERT INTO paciente (nome, cpf, telefone, email, senha) VALUES (?,?,?,?,?)', [nome, cpf, telefone, email || '', senha || ''], function(ierr){
        if(ierr) return res.status(500).json({ error: 'db error' });
        return res.json({ id: this.lastID });
      });
    }
  });
});

// Get paciente by CPF
app.get('/api/paciente/:cpf', (req, res) => {
  const cpf = req.params.cpf;
  if(!cpf) return res.status(400).json({ error: 'cpf required' });
  db.get('SELECT * FROM paciente WHERE cpf = ?', [cpf], (err, row) => {
    if(err) return res.status(500).json({ error: 'db error' });
    if(!row) return res.status(404).json({ error: 'Paciente não encontrado' });
    res.json(row);
  });
});

// Check consulta exists
app.get('/api/consultas/check', (req, res) => {
  const { medicoId, date, time } = req.query;
  if(!medicoId || !date || !time) return res.status(400).json({ error: 'medicoId/date/time required' });
  db.get('SELECT COUNT(*) as cnt FROM consultas WHERE medicoId = ? AND date = ? AND time = ?', [medicoId, date, time], (err, row) => {
    if(err) return res.status(500).json({ error: 'db error' });
    res.json({ exists: row.cnt > 0 });
  });
});

// Create consulta
app.post('/api/consultas', (req, res) => {
  const { medicoId, medicoNome, date, time, pacienteNome, pacienteCpf } = req.body;
  if(!medicoId || !date || !time) return res.status(400).json({ error: 'medicoId/date/time required' });
  const createdAt = new Date().toISOString();
  db.run('INSERT INTO consultas (medicoId, medicoNome, date, time, pacienteNome, pacienteCpf, createdAt) VALUES (?,?,?,?,?,?,?)', [medicoId, medicoNome, date, time, pacienteNome, pacienteCpf, createdAt], function(err){
    if(err) return res.status(500).json({ error: 'db error' });
    res.json({ id: this.lastID });
  });
});

// Static serve (optional) - não sobrescreve configuração do frontend estático
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('API server running on port', PORT));
