
import { db } from './firebaseConfig.js';
import { collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

function el(id){ return document.getElementById(id); }

async function fetchMedicosByEspecialidade(espec){
	if(!espec) return [];
	try{
		const q = query(collection(db, 'medicos'), where('especialidade','==',espec));
		const snap = await getDocs(q);
		return snap.docs.map(d => ({ id: d.id, ...d.data() }));
	} catch(err){
		console.error('Erro buscando médicos:', err);
		return [];
	}
}

function populateMedicosSelect(medicos){
	const sel = el('medicos');
	if(!sel) return;
	sel.innerHTML = '';
	const defaultOpt = document.createElement('option');
	defaultOpt.value='';
	defaultOpt.textContent = medicos.length ? 'Escolha um médico' : 'Nenhum médico disponível';
	sel.appendChild(defaultOpt);
	medicos.forEach(m => {
		const opt = document.createElement('option');
		opt.value = m.id;
		opt.textContent = m.nome ? `${m.nome} (${m.cpf ? m.cpf : ''})` : m.id;
		sel.appendChild(opt);
	});
}

function renderMedicosList(medicos){
	const container = el('medicos-list');
	if(!container) return;
	if(medicos.length === 0){
		container.innerHTML = '<p class="text-center">Nenhum médico encontrado para esta especialidade.</p>';
		return;
	}
	container.innerHTML = '';
	const row = document.createElement('div');
	row.className = 'd-flex flex-wrap gap-3 justify-content-center';
	medicos.forEach(m => {
		const card = document.createElement('div');
		card.className = 'card p-3';
		card.style.width = '220px';
		card.style.cursor = 'pointer';
		card.innerHTML = `
			<div class="fw-bold">${m.nome || '—'}</div>
			<div style="font-size:0.9rem;color:#666">${m.especialidade || ''}</div>
			<div style="margin-top:8px;font-size:0.85rem;color:#444">${m.telefone ? m.telefone : ''}</div>
			<div style="margin-top:8px;font-size:0.85rem;color:#444">Horários: ${m.horarios && m.horarios.length ? m.horarios.slice(0,4).join(', ') + (m.horarios.length>4? '...' : '') : 'não informado'}</div>
		`;
		// clique no card: salvar médico selecionado e redirecionar para cadastroConsulta
		card.addEventListener('click', ()=>{
			try{
				const minimal = { id: m.id, nome: m.nome || '', especialidade: m.especialidade || '', telefone: m.telefone || '', horarios: m.horarios || [], dias: m.dias || [] };
				sessionStorage.setItem('selectedMedico', JSON.stringify(minimal));
				// também enviar via query param o id como fallback
				window.location.href = 'cadastroConsulta.html?id=' + encodeURIComponent(m.id);
			} catch(e){
				console.error('Erro ao selecionar médico', e);
			}
		});
		row.appendChild(card);
	});
	container.appendChild(row);
}

async function onEspecialidadeChange(){
	const sel = el('especialidade');
	if(!sel) return;
	const espec = sel.value && sel.value.trim() ? sel.value.trim() : '';
	let medicos = await fetchMedicosByEspecialidade(espec);
	// aplicar filtro por dias selecionados (se houver)
	const selectedDays = getSelectedWeekdays();
	if(selectedDays && selectedDays.length){
		medicos = medicos.filter(m => Array.isArray(m.dias) && m.dias.some(d => selectedDays.includes(d)));
	}
	populateMedicosSelect(medicos);
	renderMedicosList(medicos);
}

document.addEventListener('DOMContentLoaded', ()=>{
	const esp = el('especialidade');
	if(esp){
		esp.addEventListener('change', onEspecialidadeChange);
		// se já houver um valor selecionado, carregar médicos iniciais
		if(esp.value && esp.value.trim()) onEspecialidadeChange();
	}
	// ligar filtros de dias e data
	const dayCheckboxes = Array.from(document.querySelectorAll('input[name="agenda-dias"]'));
	dayCheckboxes.forEach(cb => cb.addEventListener('change', onEspecialidadeChange));

	const dataInput = el('data-agenda');
	if(dataInput){
		dataInput.addEventListener('change', ()=>{
			// ao escolher data, selecionar apenas o dia correspondente
			const val = dataInput.value; // YYYY-MM-DD
			if(!val){
				// nada selecionado -> não forçar dias
				return onEspecialidadeChange();
			}
			const d = new Date(val + 'T00:00:00');
			const dayIdx = d.getDay(); // 0 dom ... 6 sab
			const map = ['domingo','segunda','terca','quarta','quinta','sexta','sabado'];
			const target = map[dayIdx];
			// atualizar checkboxes: desmarcar todos e marcar o correspondente
			dayCheckboxes.forEach(cb => cb.checked = (cb.value === target));
			onEspecialidadeChange();
		});
	}
});

function getSelectedWeekdays(){
	return Array.from(document.querySelectorAll('input[name="agenda-dias"]:checked')).map(i=>i.value);
}





