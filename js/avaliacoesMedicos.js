

function calcularMediaPorMedicos(medicos){

  
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
