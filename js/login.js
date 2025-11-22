import { db } from './firebaseConfig.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

function getEl(id){ return document.getElementById(id); }

const cpfInput = getEl('cpf');
const senhaInput = getEl('senha');
const btn = document.querySelector('button[type="submit"]');

async function findUserByCpfSenha(cpf, senha, collectionName){
	const q = query(collection(db, collectionName), where('cpf','==',cpf), where('senha','==',senha));
	const snap = await getDocs(q);
	if(!snap.empty){
		const doc = snap.docs[0];
		return { id: doc.id, ...doc.data(), role: collectionName === 'medicos' ? 'medico' : 'paciente' };
	}
	return null;
}

async function doLogin(e){
	if(e) e.preventDefault();

	const rawCpf = (cpfInput && cpfInput.value) ? cpfInput.value : '';
	const cpf = rawCpf.replace(/\D/g,'').trim();
	const senha = (senhaInput && senhaInput.value) ? senhaInput.value.trim() : '';

	if(!cpf || !senha){
		alert('Preencha CPF e senha.');
		return;
	}

	try{
		// Primeiro busca em medicos
		let user = await findUserByCpfSenha(cpf, senha, 'medicos');
		if(!user){
			// se não achar, busca em paciente
			user = await findUserByCpfSenha(cpf, senha, 'paciente');
		}

		if(user){
			// Armazena sessão mínima e redireciona conforme função
			sessionStorage.setItem('user', JSON.stringify({ id: user.id, nome: user.nome || '', cpf: user.cpf || '', role: user.role }));
			if(user.role === 'medico'){
				window.location.href = 'medico.html';
			} else {
				window.location.href = 'agenda.html';
			}
		} else {
			alert('CPF ou senha inválidos.');
		}

	} catch (err){
		console.error('Erro no login', err);
		alert('Ocorreu um erro ao tentar efetuar login. Veja o console para detalhes.');
	}
}

if(btn){
	btn.addEventListener('click', doLogin);
}

// permitir enviar com Enter
if(cpfInput && senhaInput){
	[cpfInput, senhaInput].forEach(el => el.addEventListener('keydown', (e)=>{
		if(e.key === 'Enter') doLogin(e);
	}));
}

