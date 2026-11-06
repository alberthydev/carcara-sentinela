import { NextFunction, Response } from "express";
import { AuthRequest } from "./authMiddleware";
import Visita from "../models/Visita";

export const requerProprioUsuario = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const usuarioId = req.params.id;
  if (!usuarioId || req.user?.id !== usuarioId) {
    res.status(403).json({ erro: "Você não pode acessar dados de outro usuário." });
    return;
  }
  next();
};

export const requerPapel = (...papeis: string[]) => (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user?.tipo || !papeis.includes(req.user.tipo)) {
    res.status(403).json({ erro: "Você não tem permissão para este recurso." });
    return;
  }
  next();
};

export const requerPropriaVisita = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const visita = await Visita.findById(req.params.visitaId).select("usuarioId");
    if (!visita || String(visita.usuarioId) !== req.user?.id) {
      res.status(visita ? 403 : 404).json({
        erro: visita ? "Você não pode alterar esta visita." : "Visita não encontrada.",
      });
      return;
    }
    next();
  } catch {
    res.status(500).json({ erro: "Não foi possível validar a visita." });
  }
};
