import { createPaciente, getPacienteByCpf } from './api.js';


function getInput(){
    return{
        nome: document.getElementById("nome"),
        cpf: document.getElementById("cpf"),
        telefone: document.getElementById("telefone"),
        email: document.getElementById("email"),
        senha: document.getElementById("senha")
    }
} 
    

    function getValores({cpf, telefone, nome, email, senha}){
        return {
            nome: nome.value.trim(),
            cpf: cpf.value.trim(),
            telefone: telefone.value.trim(),
            email: email.value.trim(),
            senha: senha.value.trim()
        }
    }

    document.getElementById("btnEnviar").addEventListener("click", async function(){
        const Inputs = getInput()
        const dados = getValores(Inputs)

        console.log("Dados", dados)

        try{
            const cpfDigits = (dados.cpf || '').replace(/\D/g,'');
            if(!cpfDigits) return alert('CPF inválido');
            // checar se já existe
            try{
                const existing = await getPacienteByCpf(cpfDigits);
                if(existing && existing.cpf){
                    return alert('Já existe um paciente cadastrado com este CPF.');
                }
            } catch(e){
                // se 404, prosseguir; se outro erro, logar e tentar criar
                if(!/404/.test(String(e))) console.warn('Erro ao verificar existencia do paciente (prosseguindo):', e);
            }

            await createPaciente({ nome: dados.nome, cpf: cpfDigits, telefone: dados.telefone, email: dados.email, senha: dados.senha });
            alert("Cadastro com sucesso")
        } catch (e){
            console.log("Erro", e)
            alert('Erro ao cadastrar. Veja console.');
        }

    })