import { db } from './firebaseConfig.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
let currentMedicoId = null;
let saveTimer = null;

function pad(n){return String(n).padStart(2,'0');}
function generateTimes(startHour=8, endHour=17, stepMin=30){
	const times = [];
	const start = startHour*60;
	const end = endHour*60; // inclusive endpoint; we'll stop at end-step
	for(let t = start; t < end; t += stepMin){
		const hh = Math.floor(t/60);
		const mm = t%60;
		times.push(`${pad(hh)}:${pad(mm)}`);
	}
	return times;
}

const TIMES = generateTimes(8,17,30); // 08:00 .. 16:30

function createWeekdayBlock(dayIndex, selectedTimes = []){
	const wrapper = document.createElement('div');
	wrapper.className = 'weekday';
	const label = document.createElement('div');
	label.className = 'weekday-label';
	label.textContent = weekdays[dayIndex];

	const grid = document.createElement('div');
	grid.className = 'times-grid';

	TIMES.forEach(time => {
		const box = document.createElement('label');
		box.className = 'time-checkbox';
		const input = document.createElement('input');
		input.type = 'checkbox';
		input.dataset.time = time;
		input.dataset.day = String(dayIndex);
		if((selectedTimes||[]).includes(time)) input.checked = true;
		input.addEventListener('change', () => {
			markUnsaved();
			scheduleSaveDebounced();
		});
		const span = document.createElement('span');
		span.textContent = time;
		box.append(input, span);
		grid.appendChild(box);
	});

	wrapper.append(label, grid);
	return wrapper;
}

function renderAgenda(container, data = {}){
	container.innerHTML = '';
	const title = document.createElement('h3'); title.textContent = 'Horários (30min)';
	container.appendChild(title);

	const status = document.createElement('div'); status.id = 'agenda-save-status'; status.className = 'save-status'; status.textContent = '';
	container.appendChild(status);

	for(let i=0;i<7;i++){
		const selected = (data && data[i]) || [];
		const block = createWeekdayBlock(i, selected);
		container.appendChild(block);
	}

	const clearBtn = document.createElement('button'); clearBtn.type='button'; clearBtn.textContent='Limpar';
	clearBtn.addEventListener('click', ()=>{
		container.querySelectorAll('input[type=checkbox]').forEach(cb=>cb.checked=false);
		markUnsaved(); scheduleSaveDebounced();
	});
	const saveNow = document.createElement('button'); saveNow.type='button'; saveNow.textContent='Salvar agora';
	saveNow.addEventListener('click', async ()=>{ await saveAgenda(); status.textContent='Salvo.'; setTimeout(()=>status.textContent='',1200); });
	container.appendChild(clearBtn);
	container.appendChild(saveNow);
}

function readAgendaFromUI(container){
	const agenda = {};
	for(let d=0; d<7; d++) agenda[d]=[];
	container.querySelectorAll('input[type=checkbox]').forEach(cb=>{
		if(cb.checked){
			const day = Number(cb.dataset.day);
			const time = cb.dataset.time;
			if(!agenda[day]) agenda[day]=[];
			agenda[day].push(time);
		}
	});
	// sort times
	Object.keys(agenda).forEach(k=> agenda[k].sort());
	return agenda;
}

async function loadAgenda(medicoId){
	currentMedicoId = medicoId;
	const container = document.getElementById('agenda-container');
	if(!container) return;
	try{
		const ref = doc(db, 'medicos', medicoId);
		const snap = await getDoc(ref);
		const semanal = (snap.exists() && snap.data().disponibilidadeSemanal) || {};
		renderAgenda(container, semanal);
	}catch(err){
		console.error('Erro ao carregar agenda', err);
		renderAgenda(container, {});
	}
}

async function saveAgenda(){
	if(!currentMedicoId) return alert('Informe o ID do médico antes de salvar.');
	const container = document.getElementById('agenda-container');
	const status = document.getElementById('agenda-save-status');
	if(!container) return;
	const agenda = readAgendaFromUI(container);
	try{
		if(status) status.textContent = 'Salvando...';
		await setDoc(doc(db, 'medicos', currentMedicoId), { disponibilidadeSemanal: agenda }, { merge: true });
		if(status) status.textContent = 'Salvo.';
		setTimeout(()=>{ if(status) status.textContent=''; },1200);
	}catch(err){
		console.error('Erro ao salvar agenda', err);
		if(status) status.textContent = 'Erro ao salvar.';
	}
}

function scheduleSaveDebounced(){
	const status = document.getElementById('agenda-save-status'); if(status) status.textContent='Alterações não salvas...';
	if(saveTimer) clearTimeout(saveTimer);
	saveTimer = setTimeout(()=>{ saveAgenda(); }, 1000);
}

function markUnsaved(){
	const status = document.getElementById('agenda-save-status'); if(status) status.textContent='Alterações não salvas...';
}

document.addEventListener('DOMContentLoaded', ()=>{
	const carregarBtn = document.getElementById('carregarAgendaBtn');
	const medicoInput = document.getElementById('medicoId');
	const container = document.getElementById('agenda-container');
	if(!container) return;
	renderAgenda(container, {});
	if(carregarBtn) carregarBtn.addEventListener('click', ()=>{
		const id = medicoInput.value.trim(); if(!id) return alert('Informe o ID do médico'); loadAgenda(id);
	});
});

export { loadAgenda, saveAgenda };

