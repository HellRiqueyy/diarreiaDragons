const db = require('./db');

function seed(){
  db.serialize(() => {
    console.log('Populando banco de dados...');

    const medicoCpf = '12345678901';
    const pacienteCpf = '98765432100';

    // Inserir médico se não existir
    db.get('SELECT * FROM medicos WHERE cpf = ?', [medicoCpf], (err, row) => {
      if(err) return console.error('Erro checando medico', err);
      if(row){
        console.log('Médico já existe:', medicoCpf);
        insertPaciente();
      } else {
        const dias = JSON.stringify(['segunda','terca','quarta']);
        const horarios = JSON.stringify(['08:00','08:30','09:00','09:30']);
        db.run('INSERT INTO medicos (nome, cpf, telefone, especialidade, dias, horarios, senha, disponibilidadeSemanal, disponibilidades) VALUES (?,?,?,?,?,?,?,?,?)',
          ['Dr. Teste', medicoCpf, '999999999', 'Pediatria', dias, horarios, 'senha123', JSON.stringify({}), JSON.stringify([])], function(err){
            if(err) return console.error('Erro inserindo medico', err);
            console.log('Médico inserido com id', this.lastID);
            // inserir uma avaliação
            db.run('INSERT INTO avaliacoes (medicoId, score, createdAt) VALUES (?,?,?)', [this.lastID, 5, new Date().toISOString()], function(aerr){ if(aerr) console.error('Erro inserindo avaliacao', aerr); else console.log('Avaliacao inserida'); });
            insertPaciente();
        });
      }
    });

    function insertPaciente(){
      db.get('SELECT * FROM paciente WHERE cpf = ?', [pacienteCpf], (err, prow) => {
        if(err) return console.error('Erro checando paciente', err);
        if(prow){
          console.log('Paciente já existe:', pacienteCpf);
          insertConsulta();
        } else {
          db.run('INSERT INTO paciente (nome, cpf, telefone) VALUES (?,?,?)', ['Paciente Teste', pacienteCpf, '888888888'], function(err){
            if(err) return console.error('Erro inserindo paciente', err);
            console.log('Paciente inserido com id', this.lastID);
            insertConsulta();
          });
        }
      });
    }

    function insertConsulta(){
      // pegar ids para referência
      db.get('SELECT id, nome FROM medicos WHERE cpf = ?', [medicoCpf], (err, mrow) => {
        if(err || !mrow) return console.error('Não encontrou medico para consulta', err);
        db.get('SELECT id, nome FROM paciente WHERE cpf = ?', [pacienteCpf], (err2, prow) => {
          if(err2 || !prow) return console.error('Não encontrou paciente para consulta', err2);
          // verificar se já existe consulta no mesmo dia/hora
          const date = new Date().toISOString().slice(0,10);
          const time = '08:00';
          db.get('SELECT * FROM consultas WHERE medicoId = ? AND date = ? AND time = ?', [mrow.id, date, time], (cerr, crow) => {
            if(cerr) return console.error('Erro checando consulta', cerr);
            if(crow){ console.log('Consulta já existe para hoje às', time); finish(); }
            else {
              db.run('INSERT INTO consultas (medicoId, medicoNome, date, time, pacienteNome, pacienteCpf, createdAt) VALUES (?,?,?,?,?,?,?)', [mrow.id, mrow.nome, date, time, prow.nome, pacienteCpf, new Date().toISOString()], function(ierr){
                if(ierr) return console.error('Erro inserindo consulta', ierr);
                console.log('Consulta inserida com id', this.lastID);
                finish();
              });
            }
          });
        });
      });
    }

    function finish(){
      console.log('Seed concluída.');
      // não fechar o DB imediatamente para permitir logs; fechar após curto delay
      setTimeout(()=> process.exit(0), 300);
    }
  });
}

seed();
