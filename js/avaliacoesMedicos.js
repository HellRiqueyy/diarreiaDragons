// Este módulo fornece utilitários para calcular média de avaliações de um conjunto de médicos.
// Não faz render automático — será chamado por `agenda.js` após filtro de especialidade.

function calcularMediaPorMedicos(medicos){
  // Recebe um array de objetos de médico (já lidos do Firestore) e retorna
  // o mesmo array com campos adicionais `media` e `quantidadeAvaliacoes`.
  return medicos.map(m => {
    const dados = Object.assign({}, m);
    let media = null;
    let quantidade = 0;
    if(Array.isArray(dados.avaliacoes) && dados.avaliacoes.length){
      const nums = dados.avaliacoes.map(n => Number(n)).filter(n => !isNaN(n));
      quantidade = nums.length;
      if(quantidade) media = nums.reduce((s,v)=>s+v,0)/quantidade;
    }
    dados.media = media; // null se sem avaliações
    dados.quantidadeAvaliacoes = quantidade;
    return dados;
  });
}

export { calcularMediaPorMedicos };
