import { db } from './firebaseConfig.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";


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
            const ref = await addDoc(collection(db, "paciente"), dados)
            console.log("ID do documento", ref.id)
            alert("Cadastro com sucesso")
        } catch (e){
            console.log("Erro", e)
        }

    })