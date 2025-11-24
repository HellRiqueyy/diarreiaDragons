const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Mapa de palavras-chave para especialidades médicas
const especialidades = {
  Alergia e Imunologia: ['alergia', 'alérgico', 'asma', 'anafilaxia', 'urticária'],
  Anestesiologia: ['dor pós-operatória', 'anestesia', 'bloqueio nervoso', 'anestesiologista'],
  Angiologia: ['varizes', 'trombose', 'vasos sanguíneos', 'edema nas pernas'],
  Cardiologia: ['dor no peito', 'palpitação', 'batimento irregular', 'falta de ar', 'hipertensão'],
  Cirurgia Cardiovascular: ['cirurgia cardíaca', 'bypass', 'valvuloplastia', 'angioplastia'],
  Cirurgia da Mão: ['lesão na mão', 'fratura dedo', 'síndrome do túnel do carpo'],
  Cirurgia de Cabeça e Pescoço: ['tumor cabeça', 'nódulo no pescoço', 'câncer cabeça'],
  Cirurgia Geral: ['apendicite', 'hernia', 'cirurgia abdominal', 'colecistectomia'],
  Cirurgia Pediátrica: ['malformação congênita', 'cirurgia infantil', 'hernia inguinal'],
  Cirurgia Plástica: ['reconstrução', 'cirurgia estética', 'lipoaspiração', 'implante mamário'],
  Cirurgia Torácica: ['cirurgia pulmonar', 'câncer de pulmão', 'toracoscopia'],
  Cirurgia Vascular: ['aneurisma', 'cirurgia vascular', 'endarterectomia'],
  Coloproctologia : ['hemorroida', 'constipação', 'fissura anal', 'dor anal'],
  Dermatologia: ['coceira', 'vermelhidão', 'manchas', 'feridas na pele', 'acne', 'psoríase'],
  Endocrinologia e Metabologia: ['diabetes', 'problemas hormonais', 'ganho de peso', 'hipotireoidismo'],
  Gastroenterologia: ['dor abdominal', 'náusea', 'vômito', 'diarreia', 'constipação', 'refluxo'],
  Genética Médica : ['doença hereditária', 'genética', 'consanguinidade', 'análise genética'],
  Geriatria: ['queda', 'memória', 'envelhecimento', 'senilidade', 'incontinência'],
  Ginecologia e Obstetrícia: ['menstruação irregular', 'gravidez', 'dor pélvica', 'cólica'],
  Hematologia: ['anemia', 'hemofilia', 'sangramento frequente', 'plaquetas baixas'],
  Hepatologia: ['hepatite', 'cirrose', 'icterícia', 'dor abdominal'],
  Infectologia: ['febre', 'infecção', 'vírus', 'bactéria', 'sepsis'],
  Mastologia: ['nódulo na mama', 'dor mamária', 'secreção mamilar'],
  Medicina de Emergência: ['trauma', 'acidente', 'parada cardíaca', 'intoxicação'],
  Medicina de Família e Comunidade: ['check-up', 'vacina', 'orientação', 'saúde familiar'],
  Medicina do Esporte: ['lesão esportiva', 'fadiga', 'dor muscular', 'entorse'],
  Medicina do Trabalho: ['doença ocupacional', 'ergonomia', 'acidente de trabalho'],
  Medicina Física e Reabilitação: ['fisioterapia', 'reabilitação', 'deficiência', 'recuperação'],
  Medicina Intensiva: ['UTI', 'ventilação mecânica', 'choque', 'sedação'],
  Medicina Legal e Perícia Médica: ['laudo', 'perícia', 'exame médico legal'],
  Medicina Nuclear: ['gammagrafia', 'PET-CT', 'radio', 'tomografia'],
  Medicina Preventiva e Social: ['prevenção', 'campanha de vacinação', 'epidemiologia'],
  Nefrologia: ['insuficiência renal', 'diálise', 'proteinúria', 'creatinina elevada'],
  Neurocirurgia: ['aneurisma cerebral', 'tumor cerebral', 'trauma craniano', 'cirurgia cerebral'],
  Neurologia: ['dor de cabeça', 'tontura', 'desmaio', 'formigamento', 'convulsão', 'epilepsia'],
  Nutrologia: ['deficiência nutricional', 'dieta', 'peso', 'vitaminas'],
  Oftalmologia: ['visão embaçada', 'dor nos olhos', 'olhos vermelhos', 'lacrimejamento', 'glaucoma'],
  Oncologia: ['tumor', 'câncer', 'nódulo', 'quimioterapia', 'radioterapia'],
  Ortopedia e Traumatologia: ['fratura', 'entorse', 'lesão óssea', 'dor nas articulações', 'inchaço'],
  Otorrinolaringologia: ['dor de ouvido', 'rouquidão', 'sangramento nasal', 'ronco', 'sinusite'],
  Patologia: ['biópsia', 'exame anatomopatológico', 'citologia'],
  Pediatria: ['febre', 'tosse', 'coriza', 'irritabilidade', 'vômito'],
  Pneumologia: ['asma', 'bronquite', 'tosse crônica', 'falta de ar', 'pneumonia'],
  Psiquiatria: ['ansiedade', 'depressão', 'insônia', 'alterações de humor', 'stress'],
  Radiologia e Diagnóstico por Imagem: ['radiografia', 'ultrassom', 'tomografia', 'ressonância'],
  Reumatologia: ['artrite', 'dor nas articulações', 'inflamação', 'lupus'],
  Urologia: ['dor ao urinar', 'sangue na urina', 'incontinência', 'inchaço genital', 'cistite']
};

app.post('/api/triagem', (req, res) => {
  const sintomasRaw = req.body.sintomas || '';
  const sintomas = sintomasRaw.toLowerCase();

  if (!sintomas.trim()) {
    return res.status(400).json({ resposta: 'Nenhum sintoma fornecido.' });
  }

  let especialidadeEncontrada = null;

  for (const [especialidade, palavras] of Object.entries(especialidades)) {
    for (const palavra of palavras) {
      if (sintomas.includes(palavra)) {
        especialidadeEncontrada = especialidade;
        break;
      }
    }
    if (especialidadeEncontrada) break;
  }

  if (especialidadeEncontrada) {
    return res.json({
      resposta: `Com base nos sintomas informados, a especialidade médica recomendada é: ${especialidadeEncontrada}.`
    });
  } else {
    return res.json({
      resposta: 'Não foi possível identificar uma especialidade médica específica com base nos sintomas fornecidos. Recomendamos procurar um médico para avaliação detalhada.'
    });
  }
});

