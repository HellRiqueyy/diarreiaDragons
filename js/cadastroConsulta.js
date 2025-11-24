import { getMedicoById, getMedicos, getAvaliacoesByMedicosIds, checkConsultaExists, createConsulta } from './api.js';

function el(id){ return document.getElementById(id); }

async function fetchMedicoById(id){
    try{
        const m = await getMedicoById(id);
        return m ? m : null;
    } catch(e){ console.error('Erro fetching medico', e); }
    return null;
}

function loadSelection(){
    const selMed = sessionStorage.getItem('selectedMedico');
    try{ return selMed ? JSON.parse(selMed) : null; } catch(e){ return null; }
}

function renderMedicoCard(m){
    if(!m) return;
    el('medico-nome').textContent = m.nome || '—';
    el('medico-espec').textContent = m.especialidade || '';
    el('medico-telefone').textContent = m.telefone || '';
    const clinicName = m.nomeClinica || m.clinica || '';
    const clinicAddr = m.enderecoClinica || m.endereco || '';
    if(el('medico-clinica')) el('medico-clinica').textContent = clinicName;
    if(el('medico-endereco')) el('medico-endereco').textContent = clinicAddr;
}

function renderHorarios(medico){
    const container = el('horarios-container');
    container.innerHTML = '';
    const horarios = Array.isArray(medico.horarios) ? medico.horarios : [];
    if(horarios.length === 0){ container.textContent = 'Horários não informados pelo médico.'; return; }
    horarios.forEach(h => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-outline-secondary';
        btn.textContent = h;
        btn.style.padding = '6px 8px';
        btn.addEventListener('click', ()=>{
            // marcar visualmente
            Array.from(container.querySelectorAll('button')).forEach(b=>b.classList.remove('selected'));
            btn.classList.add('selected');
            el('consulta-hora').value = h;
        });
        container.appendChild(btn);
    });
}

// ------------ recomendações por especialidade ----------------
async function fetchMedicosByEspecialidade(espec){
    if(!espec) return [];
    try{
        const med = await getMedicos(espec);
        return med || [];
    } catch(e){ console.error('Erro buscando medicos por especialidade', e); return []; }
}

async function attachRatings(medicos){
    if(!medicos || medicos.length === 0) return medicos;
    const ids = medicos.map(m=>m.id);
    let avals = [];
    try{
        avals = await getAvaliacoesByMedicosIds(ids);
    } catch(e){ console.error('Erro ao buscar avaliacoes', e); }
    const map = {};
    avals.forEach(a=>{ if(!map[a.medicoId]) map[a.medicoId] = { sum:0, count:0 }; map[a.medicoId].sum += (a.score||0); map[a.medicoId].count += 1; });
    return medicos.map(m=>{ const e = map[m.id]; if(e){ m.ratingAvg = +(e.sum/e.count).toFixed(2); m.ratingCount = e.count; } else { m.ratingAvg = 0; m.ratingCount = 0; } return m; });
}

function generateStarsHtml(avg){
    const rounded = Math.round(avg);
    let html = '<span style="color:#F87B1B;">';
    for(let i=1;i<=5;i++) html += (i<=rounded) ? '★' : '<span style="color:#ddd;">★</span>';
    html += '</span>';
    return html;
}

function renderRecomendacoes(medicos, currentId){
    const container = el('recomendacoes-cadastro');
    if(!container) return;
    container.innerHTML = '';
    const others = medicos.filter(m => m.id !== currentId).sort((a,b)=> (b.ratingAvg||0)-(a.ratingAvg||0)).slice(0,3);
    if(others.length === 0){ container.innerHTML = '<div style="color:#666">Nenhuma recomendação disponível</div>'; return; }
    others.forEach(m=>{
        const card = document.createElement('div');
        card.className = 'card p-2';
        card.style.minWidth = '180px';
        card.style.cursor = 'pointer';
        card.innerHTML = `<div style="font-weight:600">${m.nome || '—'}</div><div style="font-size:0.9rem;color:#666">${m.especialidade || ''}</div><div style="margin-top:6px">${generateStarsHtml(m.ratingAvg)} <small style="color:#666">(${m.ratingCount||0})</small></div>`;
        card.addEventListener('click', ()=>{
            try{
                sessionStorage.setItem('selectedMedico', JSON.stringify({ id: m.id, nome: m.nome, especialidade: m.especialidade, telefone: m.telefone, horarios: m.horarios||[], dias: m.dias||[] }));
                // reload page to load the selected medico
                window.location.href = 'cadastroConsulta.html?id=' + encodeURIComponent(m.id);
            } catch(e){ console.error('Erro ao selecionar recomendado', e); }
        });
        container.appendChild(card);
    });
}

// -----------------------------------------------------------------

async function init(){
    // tentar carregar seleção vinda da agenda
    let medico = loadSelection();
    // fallback: pegar id da querystring
    if(!medico){
        const id = new URLSearchParams(window.location.search).get('id');
        if(id){ medico = await fetchMedicoById(id); }
    }

    if(medico){
        renderMedicoCard(medico);
        renderHorarios(medico);
        // carregar recomendações (outros médicos da mesma especialidade)
        try{
            const medicos = await fetchMedicosByEspecialidade(medico.especialidade);
            const medicosWithRatings = await attachRatings(medicos);
            renderRecomendacoes(medicosWithRatings, medico.id);
        } catch(e){ console.error('Erro carregando recomendacoes', e); }
    } else {
        el('medico-nome').textContent = 'Médico não selecionado';
    }

    // preencher dados do paciente se houver sessão
    try{
        const userStr = sessionStorage.getItem('user');
        if(userStr){ const user = JSON.parse(userStr); if(user.nome) el('paciente-nome').value = user.nome; if(user.cpf) el('paciente-cpf').value = user.cpf; }
    } catch(e){}

    // quando submeter, salvar consulta
    el('form-agenda').addEventListener('submit', async (ev)=>{
        ev.preventDefault();
        const hora = el('consulta-hora').value.trim();
        const date = el('consulta-data').value;
        const pacienteNome = el('paciente-nome').value.trim();
        const pacienteCpf = el('paciente-cpf').value.trim();
        const medicoSel = medico || loadSelection();
        const medicoId = medicoSel ? medicoSel.id : (new URLSearchParams(window.location.search).get('id') || '');

        if(!medicoId){ alert('Médico não selecionado. Volte à agenda e escolha um médico.'); return; }
        if(!date || !hora){ alert('Escolha data e horário.'); return; }

        const consultaObj = { medicoId, medicoNome: medicoSel ? medicoSel.nome : '', date, time: hora, pacienteNome, pacienteCpf, createdAt: new Date().toISOString() };

        try{
            // verificar se já existe uma consulta para mesmo médico, data e horário
            const existsRes = await checkConsultaExists(medicoId, date, hora);
            if(existsRes && existsRes.exists){
                alert('Esse horário já foi reservado para este médico. Escolha outro horário.');
                return;
            }

            const ref = await createConsulta(consultaObj);
            if(ref && ref.id){
                alert('Agendamento confirmado.');
                // limpar seleção de consulta armazenada
                sessionStorage.removeItem('selectedConsulta');
                // redirecionar de volta à agenda
                window.location.href = 'agenda.html';
            } else {
                throw new Error('Erro no servidor ao criar consulta');
            }
        } catch(e){ console.error('Erro salvando consulta', e); alert('Erro ao salvar agendamento.'); }
    });
}

document.addEventListener('DOMContentLoaded', init);
