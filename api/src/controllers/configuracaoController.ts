import { Request, Response } from 'express';
import Configuracao from '../models/Configuracao';

export const getConfiguracao = async (req: Request, res: Response) => {
  try {
    let config = await Configuracao.findOne({ campusId: 'videira-principal' });
    if (!config) {
      config = await Configuracao.create({ campusId: 'videira-principal', totalVagas: 200 });
    }
    res.status(200).json(config);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar configurações' });
  }
};

export const updateConfiguracao = async (req: Request, res: Response) => {
  try {
    const { totalVagas } = req.body;
    const config = await Configuracao.findOneAndUpdate(
      { campusId: 'videira-principal' },
      { totalVagas },
      { new: true, upsert: true }
    );
    res.status(200).json(config);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao atualizar configurações' });
  }
};