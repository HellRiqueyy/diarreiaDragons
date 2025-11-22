// Gera checkboxes de horários de 30 em 30 minutos (08:00 - 16:30) para cada dia
const DAYS_UI = [
  { name: 'Segunda', idx: 1 },
  { name: 'Terça', idx: 2 },
  { name: 'Quarta', idx: 3 },
  { name: 'Quinta', idx: 4 },
  { name: 'Sexta', idx: 5 },
  { name: 'Sábado', idx: 6 },
  { name: 'Domingo', idx: 0 }
];

function pad(n){return String(n).padStart(2,'0');}
function generateTimes(startHour=8, endHour=17, stepMin=30){
  const times = [];
  const start = startHour*60;
  const end = endHour*60;
  for(let t = start; t < end; t += stepMin){
    const hh = Math.floor(t/60);
    const mm = t%60;
    times.push(`${pad(hh)}:${pad(mm)}`);
  }
  return times;
}

const TIMES = generateTimes(8,17,30);

function renderCadastroAgenda(){
  const container = document.getElementById('cadastro-agenda');
  if(!container) return;
  container.innerHTML = '';

  DAYS_UI.forEach(day => {
    const block = document.createElement('div');
    block.className = 'weekday';
    const label = document.createElement('div');
    label.className = 'weekday-label';
    label.textContent = day.name;
    block.appendChild(label);

    const grid = document.createElement('div');
    grid.className = 'times-grid';
    TIMES.forEach(time => {
      const lbl = document.createElement('label');
      lbl.className = 'time-checkbox';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = 'horarios';
      input.dataset.day = String(day.idx);
      input.value = time;
      const span = document.createElement('span');
      span.textContent = time;
      lbl.append(input, span);
      grid.appendChild(lbl);
    });

    block.appendChild(grid);
    container.appendChild(block);
  });
}

document.addEventListener('DOMContentLoaded', renderCadastroAgenda);
