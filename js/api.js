// Módulo cliente para comunicar com a API Node/SQLite
// Use BASE_URL para apontar para o backend (útil quando frontend é servido separadamente)
const BASE_URL = 'http://localhost:3000';

async function handleRes(res){
  if(!res.ok){
    const text = await res.text().catch(()=>null);
    throw new Error(text || res.statusText);
  }
  return res.json().catch(()=>null);
}

export async function login(cpf, senha){
  const res = await fetch(BASE_URL + '/api/login', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ cpf, senha }) });
  return handleRes(res);
}


export async function getMedicos(especialidade){
  const url = especialidade ? BASE_URL + `/api/medicos?especialidade=${encodeURIComponent(especialidade)}` : BASE_URL + '/api/medicos';
  const res = await fetch(url);
  return handleRes(res);
}

export async function getMedicoById(id){
  const res = await fetch(BASE_URL + `/api/medicos/${encodeURIComponent(id)}`);
  return handleRes(res);
}

export async function getAvaliacoesByMedicosIds(ids){
  if(!ids || ids.length === 0) return [];
  const url = BASE_URL + `/api/avaliacoes?medicoIds=${ids.join(',')}`;
  const res = await fetch(url);
  return handleRes(res);
}

export async function postAvaliacao(medicoId, score){
  const res = await fetch(BASE_URL + '/api/avaliacoes', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ medicoId, score }) });
  return handleRes(res);
}

export async function checkConsultaExists(medicoId, date, time){
  const url = BASE_URL + `/api/consultas/check?medicoId=${encodeURIComponent(medicoId)}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`;
  const res = await fetch(url);
  return handleRes(res);
}

export async function createConsulta(obj){
  const res = await fetch(BASE_URL + '/api/consultas', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(obj) });
  return handleRes(res);
}

export async function createMedico(payload){
  const res = await fetch(BASE_URL + '/api/medicos', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
  return handleRes(res);
}

export async function createPaciente(payload){
  const res = await fetch(BASE_URL + '/api/paciente', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
  return handleRes(res);
}

export async function getPacienteByCpf(cpf){
  if(!cpf) return null;
  const res = await fetch(BASE_URL + `/api/paciente/${encodeURIComponent(cpf)}`);
  return handleRes(res);
}

export default { login, getMedicos, getMedicoById, getAvaliacoesByMedicosIds, postAvaliacao, checkConsultaExists, createConsulta, createMedico, createPaciente, getPacienteByCpf };
