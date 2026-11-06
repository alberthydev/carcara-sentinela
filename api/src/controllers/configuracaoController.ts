import { Request, Response } from 'express';
import Configuracao from '../models/Configuracao';
import { isCamadaInstituicao } from '../models/Camada';
import { AuthRequest } from '../middleware/authMiddleware';

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
    const { totalVagas, camada } = req.body;
    if (camada !== undefined && !isCamadaInstituicao(camada)) {
      res.status(400).json({ erro: 'A camada da instituição deve ser 1 ou 2.' });
      return;
    }

    if (
      totalVagas !== undefined &&
      (typeof totalVagas !== "number" || !Number.isInteger(totalVagas) || totalVagas < 1 || totalVagas > 100000)
    ) {
      res.status(400).json({ erro: "O total de vagas deve ser um inteiro entre 1 e 100000." });
      return;
    }

    const atualizacoes: { totalVagas?: number; camada?: 1 | 2 } = {};
    if (totalVagas !== undefined) atualizacoes.totalVagas = totalVagas;
    if (camada !== undefined) atualizacoes.camada = camada;

    const config = await Configuracao.findOneAndUpdate(
      { campusId: 'videira-principal' },
      atualizacoes,
      { new: true, upsert: true }
    );
    res.status(200).json(config);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao atualizar configurações' });
  }
};

export const updateCamada = async (req: AuthRequest, res: Response) => {
  try {
    const { camada } = req.body;
    if (!isCamadaInstituicao(camada)) {
      res.status(400).json({ erro: 'A camada da instituição deve ser 1 ou 2.' });
      return;
    }

    const config = await Configuracao.findOneAndUpdate(
      { campusId: 'videira-principal' },
      { camada },
      { new: true, upsert: true }
    );
    res.status(200).json(config);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao atualizar a camada da instituição.' });
  }
};