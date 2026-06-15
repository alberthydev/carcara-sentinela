import { Request, Response } from 'express';
import User from '../models/User';
import Visita from '../models/Visita';

export const adicionarVeiculo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const novoVeiculo = req.body;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ erro: 'Usuário não encontrado.' });
      return;
    }

    user.carros?.push(novoVeiculo);
    await user.save();

    res.status(201).json({ mensagem: 'Veículo cadastrado!', carros: user.carros });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao cadastrar veículo.' });
  }
};

export const getVeiculos = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user?.carros || []);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar veículos.' });
  }
};

export const agendarVisita = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // ID do visitante
    const { dataVisita, horaVisita, setorDestino, placa, marca, modelo, cor } = req.body;

    const novaVisita = await Visita.create({
      usuarioId: id,
      dataVisita,
      horaVisita,
      setorDestino,
      veiculo: { placa, marca, modelo, cor }
    });

    res.status(201).json({ mensagem: 'Visita agendada!', visita: novaVisita });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao agendar visita.' });
  }
};

export const getVisitasUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const visitas = await Visita.find({ usuarioId: req.params.id }).sort({ dataVisita: 1 });
    res.status(200).json(visitas);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar visitas.' });
  }
};