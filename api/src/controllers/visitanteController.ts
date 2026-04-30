import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import Visitante from '../models/Visitante';

export const cadastrarVisitante = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cpf, senha, nome, sobrenome, fotoUrl, carros } = req.body;

    const regexSenha = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!regexSenha.test(senha)) {
      res.status(400).json({ erro: 'A senha não atende aos requisitos mínimos de segurança.' });
      return;
    }

    const regexFoto = /\.(png|jpg|jpeg)$/i;
    if (!regexFoto.test(fotoUrl)) {
      res.status(400).json({ erro: 'A foto deve estar no formato PNG, JPG ou JPEG.' });
      return;
    }

    const visitanteExistente = await Visitante.findOne({ cpf });
    if (visitanteExistente) {
      res.status(400).json({ erro: 'CPF já cadastrado.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const novoVisitante = new Visitante({
      cpf,
      senha: senhaHash,
      nome,
      sobrenome,
      fotoUrl,
      carros: carros || [] // Carros é opcional
    });

    await novoVisitante.save();

    res.status(201).json({ mensagem: 'Visitante cadastrado com sucesso!' });
  } catch (erro) {
    console.error('Erro no cadastro:', erro);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

export const listarVisitantes = async (req: Request,  res: Response): Promise<void> => {
  try{
    const visitantes = await Visitante.find({});
    res.status(200).json(visitantes);
  } catch(erro){
    res.status(500).json({ erro: 'Erro ao buscar visitantes.' });
  }
}; 