import { NextFunction, Request, Response } from "express";
import Configuracao from "../models/Configuracao";
import { CamadaInstituicao } from "../models/Camada";

type ResolverCamada = () => Promise<CamadaInstituicao>;

export const criarMiddlewareCamada = (
  resolverCamada: ResolverCamada,
  camadaPermitida: CamadaInstituicao,
) => {
  return async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const camadaAtual = await resolverCamada();

      if (camadaAtual !== camadaPermitida) {
        res.status(403).json({
          erro: "Este recurso não está disponível para a camada da instituição.",
          camadaAtual,
          camadaPermitida,
        });
        return;
      }

      next();
    } catch (error) {
      console.error("Erro ao resolver camada da instituição:", error);
      res.status(500).json({ erro: "Não foi possível validar os recursos da instituição." });
    }
  };
};

const resolverCamadaInstituicao = async (): Promise<CamadaInstituicao> => {
  const configuracao = await Configuracao.findOne({ campusId: "videira-principal" }).lean();
  return configuracao?.camada ?? 1;
};

export const requerCamadaLpr = criarMiddlewareCamada(resolverCamadaInstituicao, 1);
export const requerCamadaVisao = criarMiddlewareCamada(resolverCamadaInstituicao, 2);
