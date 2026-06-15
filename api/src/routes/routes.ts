import { Router, Request, Response } from "express";
import {
  registryUser,
  loginUser,
  googleAuth,
} from "../controllers/userController";
import { Estudante } from "../models/Estudante";
import rateLimit from "express-rate-limit";
import { lprStream, simularLeituraLPR } from "../controllers/lprController";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    erro: "Muitas tentativas de login. Tente novamente em alguns minutos.",
  },
});

router.get(
  "/validar-ifc/:cpf/:matricula",
  async (req: Request, res: Response) => {
    try {
      const { cpf, matricula } = req.params;
      const estudante = await Estudante.findOne({
        cpf: cpf.trim(),
        matricula: matricula.trim(),
      });

      if (estudante) {
        return res.json({ valido: true, nome: estudante.nome });
      }

      res.status(404).json({
        valido: false,
        erro: "Nenhuma matrícula encontrada para este CPF no sistema IFC.",
      });
    } catch (error) {
      res.status(500).json({ erro: "Erro interno ao consultar banco IFC." });
    }
  },
);

router.post("/cadastro", registryUser);

router.post("/admin/mock-estudante", async (req: Request, res: Response) => {
  const { cpf, matricula, nome } = req.body;
  try {
    await Estudante.create({ cpf, matricula, nome });
    res.status(201).send("OK");
  } catch (e) {
    res.status(500).send("Erro ao mockar dados");
  }
});

router.post("/login", authLimiter, loginUser);
router.post("/auth/google", authLimiter, googleAuth);

router.get("/stream", lprStream);
router.post("/evento", simularLeituraLPR);

export default router;
