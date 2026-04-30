import { Router } from 'express';
import { registryUser, usersList } from '../controllers/userController';
import { Estudante } from '../models/Estudante';

const router = Router();

router.get('/todos', usersList);
router.get('/validar-ifc/:cpf/:matricula', async (req, res) => {
  try {
    const { cpf, matricula } = req.params;
    const estudante = await Estudante.findOne({ 
      cpf: cpf.trim(), 
      matricula: matricula.trim() 
    });

    if (estudante) {
      return res.json({ valido: true, nome: estudante.nome });
    }
    
    res.status(404).json({ valido: false, erro: 'Nenhuma matrícula encontrada para este CPF no sistema IFC.' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro interno ao consultar banco IFC.' });
  }
});

router.post('/cadastro', registryUser);
router.post('/admin/mock-estudante', async (req, res) => {
  const { cpf, matricula, nome } = req.body;
  try {
    await Estudante.create({ cpf, matricula, nome });
    res.status(201).send("OK");
  } catch (e) {
    res.status(500).send("Erro ao mockar dados");
  }
});

export default router;