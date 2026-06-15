import bcrypt from 'bcrypt';
import User from './models/User';
import Escala from './models/Escala';

export const seedDatabase = async () => {
  try {
    await User.deleteMany({});
    await Escala.deleteMany({});

    const devExists = await User.findOne({ cpf: '000.000.000-00' });
    
    console.log('Existo');

    if (!devExists) {
      console.log('Populando o banco de dados com usuários e escalas iniciais...');
      const salt = await bcrypt.genSalt(10);

      const devUser = {
        cpf: '000.000.000-00',
        nome: 'Desenvolvedor',
        sobrenome: 'Master',
        tipo: 'dev',
        senha: await bcrypt.hash('dev123', 10),
        ativo: true,
        fotoUrl: 'https://ui-avatars.com/api/?name=Dev'
      };
      await User.create(devUser);

      const users = [
        { cpf: '000.000.000-01', nome: 'Admin', sobrenome: 'Sistema', tipo: 'admin', senhaStr: 'admin123', fotoUrl: 'https://ui-avatars.com/api/?name=Admin' },
        { cpf: '111.111.111-11', nome: 'Visitante', sobrenome: 'Padrão', tipo: 'visitante', senhaStr: 'visit123', fotoUrl: 'https://ui-avatars.com/api/?name=Visitante' },
        { cpf: '222.222.222-22', nome: 'Aluno', sobrenome: 'Padrão', tipo: 'aluno', matricula: '2024001', senhaStr: 'alun123', fotoUrl: 'https://ui-avatars.com/api/?name=Aluno' },
        { cpf: '333.333.333-33', nome: 'Servidor', sobrenome: 'Padrão', tipo: 'servidor', matricula: '2024002', senhaStr: 'serv123', fotoUrl: 'https://ui-avatars.com/api/?name=Servidor' },
        { cpf: '444.444.444-44', nome: 'Segurança', sobrenome: 'Guarita', tipo: 'seguranca', senhaStr: 'seg123', fotoUrl: 'https://ui-avatars.com/api/?name=Seguranca' },
      ];

      for (const u of users) {
        const senhaHash = await bcrypt.hash(u.senhaStr, salt);
        await User.create({
          cpf: u.cpf, nome: u.nome, sobrenome: u.sobrenome, tipo: u.tipo, 
          matricula: u.matricula, senha: senhaHash, fotoUrl: u.fotoUrl, ativo: true
        });
      }

      const diasUteis = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
      await Escala.create([
        { nome: 'Carlos Silva (Manhã)', turno: 'M', dias: diasUteis, horaInicio: '06:00', horaFim: '14:00' },
        { nome: 'Fernando Torres (Tarde)', turno: 'T', dias: diasUteis, horaInicio: '14:00', horaFim: '22:00' },
        { nome: 'Roberto Alves (Noite)', turno: 'N', dias: diasUteis, horaInicio: '22:00', horaFim: '06:00' },
      ]);

      console.log('Banco populado com sucesso!');
    } else {
      console.log('O banco já possui dados (Usuário Dev encontrado). Pulando o seeder.');
    }
  } catch (error) {
    console.error('Erro ao popular banco:', error);
  }
};