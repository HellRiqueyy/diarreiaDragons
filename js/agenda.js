
import { getMedicos, getAvaliacoesByMedicosIds, postAvaliacao } from './api.js';

function el(id){ return document.getElementById(id); }

async function fetchMedicosByEspecialidade(espec){
	if(!espec) return [];
	try{
		let medicos = await getMedicos(espec);
		medicos = medicos || [];
		// attach ratings (avg and count)
		medicos = await attachRatings(medicos);
		// sort by average rating desc
		medicos.sort((a,b)=> (b.ratingAvg || 0) - (a.ratingAvg || 0));
		return medicos;
	} catch(err){
		console.error('Erro buscando médicos:', err);
		return [];
	}
}

async function attachRatings(medicos){
	if(!medicos || medicos.length === 0) return medicos;
	const ids = medicos.map(m=>m.id);
	let avals = [];
	try{
		avals = await getAvaliacoesByMedicosIds(ids);
	} catch(e){ console.error('Erro buscando avaliacoes', e); }

	const map = {};
	avals.forEach(a=>{
		if(!map[a.medicoId]) map[a.medicoId] = { sum:0, count:0 };
		map[a.medicoId].sum += (a.score || 0);
		map[a.medicoId].count += 1;
	});

	return medicos.map(m => {
		const entry = map[m.id];
		if(entry){ m.ratingAvg = +(entry.sum / entry.count).toFixed(2); m.ratingCount = entry.count; }
		else { m.ratingAvg = 0; m.ratingCount = 0; }
		return m;
	});
}

async function submitRating(medicoId, score){
	try{
		await postAvaliacao(medicoId, Number(score));
		// refresh current list
		await onEspecialidadeChange();
		alert('Obrigado pela avaliação!');
	} catch(e){ console.error('Erro ao enviar avaliacao', e); alert('Erro ao enviar avaliação.'); }
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

function generateStarsHtml(avg){
	// avg between 0 and 5, show 5 stars, filled for each integer part, half not used for simplicity
	const rounded = Math.round(avg);
	let html = '<span class="stars" style="color:#F87B1B;">';
	for(let i=1;i<=5;i++){
		if(i<=rounded) html += `<span data-star="${i}" style="cursor:pointer; margin-right:2px;">★</span>`;
		else html += `<span data-star="${i}" style="cursor:pointer; color:#ccc; margin-right:2px;">★</span>`;
	}
	html += '</span>';
	return html;
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
		// mostrar nome em destaque, especialidade abaixo, e média de avaliação
		const clinic = m.nomeClinica ? `<div style="font-size:0.95rem;color:#444;margin-top:6px;">${m.nomeClinica}</div>` : '';
		const avg = m.ratingAvg ? Number(m.ratingAvg) : 0;
		const count = m.ratingCount || 0;
		// cria estrelas visual
		const starsHtml = generateStarsHtml(avg);
		card.innerHTML = `
			<div class="fw-bold" style="font-size:1.06rem;">${m.nome || '—'}</div>
			<div style="font-size:0.95rem;color:#666">${m.especialidade || ''}</div>
			${clinic}
			<div style="margin-top:8px;">${starsHtml} <small style="color:#666;margin-left:6px;">(${count})</small></div>
		`;

		// adicionar evento para avaliar (delegação por data-* em cada estrela)
		card.addEventListener('click', (ev)=>{
			// se clicou em estrela, tratar avaliação
			const star = ev.target.closest('[data-star]');
			if(star){
				ev.stopPropagation();
				const score = star.getAttribute('data-star');
				submitRating(m.id, score);
				return;
			}
			// caso contrário, comportamento antigo: selecionar médico e abrir pagina de agendamento
			try{
				const minimal = { id: m.id, nome: m.nome || '', especialidade: m.especialidade || '', telefone: m.telefone || '', horarios: m.horarios || [], dias: m.dias || [] };
				sessionStorage.setItem('selectedMedico', JSON.stringify(minimal));
				window.location.href = 'cadastroConsulta.html?id=' + encodeURIComponent(m.id);
			} catch(e){ console.error('Erro ao selecionar médico', e); }
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
    // medicos já vêm ordenados por ratingAvg (feito em fetchMedicosByEspecialidade)
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





