import { db } from './firebaseConfig.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";


function getInput(){
    return{
        nome: document.getElementById("nome"),
        cpf: document.getElementById("cpf"),
        telefone: document.getElementById("telefone"),
        crm: document.getElementById("upload-crm"),
        email: document.getElementById("email"),
        senha: document.getElementById("senha"),
        especialidade: document.getElementById("especialidade"),
        dias: document.querySelectorAll('input[name="dias"]:checked')
    }
} 
    

    function getValores({cpf, telefone, nome, crm, email, senha, especialidade, dias}){
        return {
            nome: nome.value.trim(),
            cpf: cpf.value.trim(),
            telefone: telefone.value.trim(),
            email: email.value.trim(),
            crm: crm.value.trim(),
            senha: senha.value.trim(),
            especialidade: especialidade.value.trim(),
            dias: dias ? Array.from(dias).map(d => d.value) : []
        }
    }

    document.getElementById("btnEnviar").addEventListener("click", async function(){
        const Inputs = getInput()
        const dados = getValores(Inputs)

        console.log("Dados", dados)

        try{
            const ref = await addDoc(collection(db, "medicos"), dados)
            console.log("ID do documento", ref.id)
            alert("Cadastro com sucesso")
        } catch (e){
            console.log("Erro", e)
        }

    })