import { getMedicoById, createMedico } from './api.js';

// Pequeno helper para formatar YYYY-MM-DD
function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Estado simples
let current = new Date();
let selectedDates = new Set();
let currentMedicoId = null;
let saveTimeout = null;

function renderCalendar(container) {
  container.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'cal-header';
  const title = document.createElement('div');
  title.textContent = current.toLocaleString(undefined, { month: 'long', year: 'numeric' });
  const controls = document.createElement('div');
  controls.className = 'cal-controls';
  const prev = document.createElement('button'); prev.textContent = '<';
  const next = document.createElement('button'); next.textContent = '>';
  const saveBtn = document.createElement('button'); saveBtn.textContent = 'Salvar disponibilidade';
  controls.append(prev, saveBtn, next);
  header.append(title, controls);

  prev.addEventListener('click', () => { current.setMonth(current.getMonth() - 1); renderCalendar(container); });
  next.addEventListener('click', () => { current.setMonth(current.getMonth() + 1); renderCalendar(container); });
  saveBtn.addEventListener('click', async () => { if (!currentMedicoId) return alert('Informe o ID do médico'); await saveAvailability(currentMedicoId); alert('Salvo'); });

  container.appendChild(header);

  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const grid = document.createElement('div');
  grid.className = 'cal-grid';

  weekdays.forEach(w => { const el = document.createElement('div'); el.className = 'cal-weekday'; el.textContent = w; grid.appendChild(el); });

  // primeiro dia do mês
  const year = current.getFullYear();
  const month = current.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // cells before
  for (let i = 0; i < startOffset; i++) {
    const cell = document.createElement('div'); cell.className = 'cal-day disabled'; grid.appendChild(cell);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const iso = formatDateISO(date);
    const cell = document.createElement('div');
    cell.className = 'cal-day';
    cell.dataset.date = iso;
    cell.innerHTML = `<div style="font-weight:600">${d}</div>`;
    if (selectedDates.has(iso)) cell.classList.add('available');
    cell.addEventListener('click', () => toggleDate(iso, cell));
    grid.appendChild(cell);
  }

  container.appendChild(grid);
}

function toggleDate(iso, element) {
  if (selectedDates.has(iso)) { selectedDates.delete(iso); element.classList.remove('available'); }
  else { selectedDates.add(iso); element.classList.add('available'); }
  // debounce save automático
  if (!currentMedicoId) return; // não salva sem médico
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => { saveAvailability(currentMedicoId); }, 1000);
}

async function loadAvailability(medicoId) {
  currentMedicoId = medicoId;
  selectedDates = new Set();
  try {
    const m = await getMedicoById(medicoId);
    if(m){ const arr = m.disponibilidades || []; arr.forEach(d => selectedDates.add(d)); }
  } catch (err) {
    console.error('Erro ao carregar disponibilidade', err);
    alert('Erro ao carregar disponibilidade');
  }
  const container = document.getElementById('calendar');
  renderCalendar(container);
}

async function saveAvailability(medicoId) {
  if (!medicoId) return;
  try {
    const med = await getMedicoById(medicoId);
    const arr = Array.from(selectedDates).sort();
    const payload = Object.assign({}, med, { disponibilidades: arr });
    await createMedico(payload);
  } catch (err) {
    console.error('Erro ao salvar disponibilidade', err);
  }
}

// Inicialização: ligar botão carregar
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('calendar');
  if (!container) return;
  renderCalendar(container);
  const carregarBtn = document.getElementById('carregarBtn');
  const medicoInput = document.getElementById('medicoId');
  carregarBtn.addEventListener('click', () => {
    const id = medicoInput.value.trim();
    if (!id) return alert('Informe o ID do médico');
    loadAvailability(id);
  });
});

export { loadAvailability, saveAvailability };
