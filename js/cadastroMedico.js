import { createMedico } from './api.js';


function getInput(){
    return{
        nome: document.getElementById("nome"),
        cpf: document.getElementById("cpf"),
        telefone: document.getElementById("telefone"),
        nomeClinica: document.getElementById("nomeClinica"),
        enderecoClinica: document.getElementById("enderecoClinica"),
        crm: document.getElementById("upload-crm"),
        email: document.getElementById("email"),
        senha: document.getElementById("senha"),
        especialidade: document.getElementById("especialidade"),
        dias: document.querySelectorAll('input[name="dias"]:checked'),
        horarios: document.querySelectorAll('input[name="horarios"]:checked')
    }
} 
    

    function getValores({cpf, telefone, nome, nomeClinica, enderecoClinica, crm, email, senha, especialidade, dias, horarios}){
        return {
            nome: nome.value.trim(),
            cpf: cpf.value.trim(),
            telefone: telefone.value.trim(),
            nomeClinica: nomeClinica && nomeClinica.value ? nomeClinica.value.trim() : '',
            enderecoClinica: enderecoClinica && enderecoClinica.value ? enderecoClinica.value.trim() : '',
            email: email.value.trim(),
            crm: (crm && crm.files && crm.files.length) ? crm.files[0].name : (crm && crm.value ? crm.value.trim() : ''),
            senha: senha.value.trim(),
            especialidade: especialidade ? especialidade.value.trim() : '',
            dias: dias ? Array.from(dias).map(d => d.value) : [],
            horarios: horarios ? Array.from(horarios).map(h => h.value) : []
        }
    }

// gera checkboxes de horários de 08:00 até 17:00 a cada 30 minutos
function generateHorarios(){
    const container = document.getElementById('horarios-container');
    if(!container) return;
    const pad = n => String(n).padStart(2,'0');
    const start = 8 * 60; // minutos
    const end = 17 * 60; // minutos
    for(let t = start; t <= end; t += 30){
        const hh = Math.floor(t/60);
        const mm = t % 60;
        const value = `${pad(hh)}:${pad(mm)}`;
        const id = `horario-${pad(hh)}-${pad(mm)}`;
        const label = document.createElement('label');
        label.setAttribute('for', id);
        label.innerHTML = `<input type="checkbox" name="horarios" value="${value}" id="${id}"> ${value}`;
        container.appendChild(label);
    }
}

// inicializa comportamento de selecionar todos para horários
function initHorarioSelectAll(){
    const selectAllEl = document.getElementById('horario-todos');
    if(!selectAllEl) return;
    selectAllEl.addEventListener('change', function(e){
        const checked = e.target.checked;
        document.querySelectorAll('input[name="horarios"]').forEach(ch => ch.checked = checked);
    });
    document.addEventListener('change', function(e){
        if(e.target && e.target.name === 'horarios'){
            const all = Array.from(document.querySelectorAll('input[name="horarios"]'));
            selectAllEl.checked = all.length > 0 && all.every(i => i.checked);
        }
    });
}

// inicializa comportamento de selecionar todos para dias (mantém compatibilidade)
function initDiasSelectAll(){
    const selectAllEl = document.getElementById('dia-todos');
    if(!selectAllEl) return;
    selectAllEl.addEventListener('change', function(e){
        const checked = e.target.checked;
        document.querySelectorAll('input[name="dias"]').forEach(ch => ch.checked = checked);
    });
    document.addEventListener('change', function(e){
        if(e.target && e.target.name === 'dias'){
            const all = Array.from(document.querySelectorAll('input[name="dias"]'));
            selectAllEl.checked = all.length > 0 && all.every(i => i.checked);
        }
    });
}

// gerar horários e inicializar selects assim que o DOM estiver pronto
document.addEventListener('DOMContentLoaded', ()=>{
    generateHorarios();
    initHorarioSelectAll();
    initDiasSelectAll();
});

    document.getElementById("btnEnviar").addEventListener("click", async function(){
        const Inputs = getInput()
        const dados = getValores(Inputs)

        console.log("Dados", dados)

        try{
            // preparar payload e enviar para API
            const cpfDigits = (dados.cpf || '').replace(/\D/g, '');
            if(!cpfDigits) return alert('CPF inválido');
            const payload = {
                nome: dados.nome,
                cpf: cpfDigits,
                telefone: dados.telefone,
                email: dados.email,
                crm: dados.crm,
                senha: dados.senha,
                especialidade: dados.especialidade,
                nomeClinica: dados.nomeClinica || '',
                enderecoClinica: dados.enderecoClinica || '',
                dias: dados.dias || [],
                horarios: dados.horarios || []
            };
            await createMedico(payload);
            alert('Cadastro com sucesso');
        } catch (e){
            console.log("Erro", e)
            alert('Erro ao cadastrar. Veja console.');
        }

    })