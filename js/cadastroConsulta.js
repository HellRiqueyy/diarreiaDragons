import { db } from './firebaseConfig.js';
import { collection, addDoc, doc, getDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

function el(id){ return document.getElementById(id); }

async function fetchMedicoById(id){
    try{
        const d = await getDoc(doc(db, 'medicos', id));
        if(d && d.exists()) return { id: d.id, ...d.data() };
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
            const ref = await addDoc(collection(db, 'consultas'), consultaObj);
            el('msg').textContent = 'Agendamento confirmado.';
            // limpar seleção de consulta armazenada
            sessionStorage.removeItem('selectedConsulta');
            // redirecionar de volta à agenda após 1s
            setTimeout(()=> window.location.href = 'agenda.html', 1000);
        } catch(e){ console.error('Erro salvando consulta', e); alert('Erro ao salvar agendamento.'); }
    });
}

document.addEventListener('DOMContentLoaded', init);
