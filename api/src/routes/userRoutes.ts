import { Router } from "express";
import { registryUser, usersList } from "../controllers/userController";
import { Estudante } from "../models/Estudante";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
dotenv.config();

const router = Router();

router.get("/todos", usersList);
router.get("/validar-ifc/:cpf/:matricula", async (req, res) => {
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
});

router.post("/cadastro", registryUser);
router.post("/admin/mock-estudante", async (req, res) => {
  const { cpf, matricula, nome } = req.body;
  try {
    await Estudante.create({ cpf, matricula, nome });
    res.status(201).send("OK");
  } catch (e) {
    res.status(500).send("Erro ao mockar dados");
  }
});

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);

router.post("/auth/google", async (req, res) => {
  const { token, tipo } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res
        .status(401)
        .json({ erro: "Não foi possível extrair dados do perfil do Google" });
    }

    const email = payload.email;
    const nomeCompleto = payload.name;
    const fotoUrl = payload.picture;

    return res
      .status(200)
      .json({ mensagem: "Usuário autenticado!", email, nomeCompleto });
  } catch (error) {
    return res
      .status(401)
      .json({ erro: "Token do Google inválido ou expirado." });
  }
});

export default router;
