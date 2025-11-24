import { login as apiLogin } from './api.js';

function el(id){ return document.getElementById(id); }

const cpfInput = el('cpf');
const senhaInput = el('senha');
const btn = document.querySelector('button[type="submit"]');

function normalizeCpf(raw){ return raw ? raw.replace(/\D/g,'').trim() : ''; }

async function findUser(collectionName, cpf, senha){
    // agora usa API centralizada (o servidor decide se é médico ou paciente)
    try{
        const res = await apiLogin(cpf, senha);
        if(res && res.user){
            return { id: res.user.id || res.user.cpf || '', ...res.user, role: res.role };
        }
    } catch(e){
        console.error('Erro buscando usuário', e);
        throw e;
    }
    return null;
}

async function doLogin(e){
    if(e) e.preventDefault();
    if(!btn) return;
    const rawCpf = cpfInput && cpfInput.value ? cpfInput.value : '';
    const cpf = normalizeCpf(rawCpf);
    const senha = senhaInput && senhaInput.value ? senhaInput.value.trim() : '';

    if(!cpf || !senha){
        alert('Preencha CPF e senha.');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Entrando...';

    try{
        let user = await findUser('medicos', cpf, senha);
        if(!user){ user = await findUser('paciente', cpf, senha); }

        if(user){
            const sessionUser = { id: user.id, nome: user.nome || '', cpf: user.cpf || '', role: user.role };
            sessionStorage.setItem('user', JSON.stringify(sessionUser));
            if(user.role === 'medico') window.location.href = 'medico.html';
            else window.location.href = '../index.html';
        } else {
            alert('CPF ou senha inválidos.');
        }
    } catch(err){
        alert('Erro ao efetuar login. CPF ou senha inválidos.');
    } finally{
        btn.disabled = false;
        btn.textContent = 'Fazer Login';
    }
}

if(btn) btn.addEventListener('click', doLogin);
if(cpfInput && senhaInput){
    [cpfInput, senhaInput].forEach(elm => elm.addEventListener('keydown', (ev)=>{ if(ev.key === 'Enter') doLogin(ev); }));
}

export { doLogin };
