import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
}

const CHAVE_MESTRA = process.env.JWT_SECRET || 'chave_mestra_carcara_2026';

export const verificarToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token) {
    token = req.query.token as string;
  }

  if (!token) {
    res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, CHAVE_MESTRA); 
    req.user = decoded; 
    next(); 
  } catch (error: any) {
    console.error("Erro ao abrir Token no Middleware:", error.message);
    res.status(403).json({ erro: 'Token inválido ou expirado.' });
  }
};