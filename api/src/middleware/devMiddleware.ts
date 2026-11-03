import { NextFunction, Response } from "express";
import { AuthRequest } from "./authMiddleware";

export const requerUsuarioDev = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (req.user?.tipo !== "dev") {
    res.status(403).json({ erro: "Apenas o usuário desenvolvedor pode alterar a camada." });
    return;
  }
  next();
};
