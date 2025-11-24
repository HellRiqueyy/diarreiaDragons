const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = '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'; // Coloque sua chave aqui

app.post('/api/triagem', async (req, res) => {
  const { sintomas } = req.body;
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: `Sintomas: ${sintomas}. Faça uma triagem médica inicial e recomende encaminhamento ou cuidados.` }]
      })
    });
    const data = await response.json();
    const resposta = data.choices?.[0]?.message?.content || 'Erro na resposta da IA';
    res.json({ resposta });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao conectar à OpenAI', detalhes: err.toString() });
  }
});

app.listen(3001, () => console.log('API de triagem rodando na porta 3001'));