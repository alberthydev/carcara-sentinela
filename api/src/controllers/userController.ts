import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { OAuth2Client } from "google-auth-library";
import { Estudante } from "../models/Estudante";
import crypto from "node:crypto";
import nodemailer from "nodemailer";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);

const CHAVE_MESTRA = process.env.JWT_SECRET || 'chave_mestra_carcara_2026';

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  const { token, tipo, cpf } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(401).json({ erro: "Não foi possível extrair dados do perfil do Google." });
      return;
    }

    const email = payload.email;
    const nomeCompleto = payload.name || "";
    const fotoUrl = payload.picture || "";

    let usuario = await User.findOne({ email: email });

    if (!usuario && cpf) {
      usuario = await User.findOne({ cpf: cpf.trim() });

      if (usuario) {
        usuario.email = email;
        if (fotoUrl) usuario.fotoUrl = fotoUrl;
        await usuario.save();
      } else {
        const partesNomeGoogle = nomeCompleto.split(" ");
        const nomeGoogle = partesNomeGoogle[0];
        const sobrenomeGoogle = partesNomeGoogle.slice(1).join(" ") || " ";

        if (tipo === "aluno" || tipo === "servidor") {
          const dadosAcademicos = await Estudante.findOne({ cpf: cpf.trim() });
          if (!dadosAcademicos) {
            res.status(403).json({ erro: "Este CPF não foi encontrado no sistema do IFC." });
            return;
          }

          const nomeCompletoIFC = dadosAcademicos.nome ?? "";
          const partesNomeIFC = nomeCompletoIFC.split(" ");
          const nomeIFC = partesNomeIFC[0] || "";
          const sobrenomeIFC = partesNomeIFC.slice(1).join(" ") || " ";

          usuario = await User.create({
            cpf: cpf.trim(), 
            matricula: dadosAcademicos.matricula, 
            nome: nomeIFC, 
            sobrenome: sobrenomeIFC, 
            email, 
            tipo, 
            fotoUrl, 
            ativo: true,
          });
        } else {
          usuario = await User.create({
            cpf: cpf.trim(), 
            nome: nomeGoogle, 
            sobrenome: sobrenomeGoogle, 
            email, 
            tipo: "visitante", 
            fotoUrl, 
            ativo: true,
          });
        }
      }
    }

    if (!usuario && !cpf) {
      res.status(202).json({
        vinculoPendente: true,
        mensagem: "Conta Google autenticada. É necessário informar o CPF para concluir o vínculo.",
        perfilSugerido: { nomeCompleto, fotoUrl },
      });
      return;
    }

    const tokenJwt = jwt.sign({ id: usuario?._id, tipo: usuario?.tipo }, CHAVE_MESTRA, { expiresIn: '1d' });

    res.status(200).json({
      mensagem: "Autenticação realizada com sucesso!",
      token: tokenJwt,
      usuario: {
        id: usuario?._id, nome: `${usuario?.nome} ${usuario?.sobrenome}`, cpf: usuario?.cpf, tipo: usuario?.tipo, fotoUrl: usuario?.fotoUrl,
      },
    });
  } catch (error: any) {
    res.status(401).json({ erro: "Token do Google inválido ou expirado." });
  }
};

export const registryUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cpf, matricula, senha, nome, sobrenome, fotoUrl, carros, tipo, email } = req.body;
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      res.status(400).json({ erro: "Informe um e-mail válido." });
      return;
    }

    const regexSenha = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!regexSenha.test(senha)) {
      res.status(400).json({ erro: "A senha não atende aos requisitos mínimos de segurança." });
      return;
    }

    const regexFoto = /\.(png|jpg|jpeg)$/i;
    if (!regexFoto.test(fotoUrl)) {
      res.status(400).json({ erro: "A foto deve estar no formato PNG, JPG ou JPEG." });
      return;
    }

    const hasUser = await User.findOne({ $or: [{ cpf }, { email: email.trim().toLowerCase() }] });
    if (hasUser) {
      res.status(400).json({ erro: hasUser.cpf === cpf ? "CPF já cadastrado." : "E-mail já cadastrado." });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const newUser = new User({
      cpf, matricula, senha: senhaHash, nome, sobrenome, tipo, email: email.trim().toLowerCase(), fotoUrl, carros: carros || [],
    });

    await newUser.save();
    res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
  } catch (erro) {
    console.error("ERRO NO CADASTRO DE USUÁRIO:", erro);
    res.status(500).json({ erro: "Erro interno do servidor." });
  }
};

const criarTransportadorEmail = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });
};

export const solicitarRecuperacaoSenha = async (req: Request, res: Response): Promise<void> => {
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  if (!email) {
    res.status(400).json({ erro: "Informe um e-mail válido." });
    return;
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404).json({ erro: "Não encontramos uma conta com este e-mail." });
    return;
  }

  const transportador = criarTransportadorEmail();
  if (!transportador) {
    res.status(503).json({ erro: "O envio de e-mails ainda não está configurado no servidor." });
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");
  user.resetTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();

  const appUrl = process.env.APP_URL || "http://localhost:5173";
  try {
    await transportador.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: "Redefinição de senha - Carcará Sentinela",
      text: `Acesse ${appUrl}/reset-password?token=${token} para redefinir sua senha. O link expira em 30 minutos.`,
    });
  } catch (erro) {
    user.resetTokenHash = undefined;
    user.resetTokenExpiresAt = undefined;
    await user.save();
    console.error("ERRO AO ENVIAR E-MAIL DE RECUPERAÇÃO:", erro);
    res.status(502).json({ erro: "Não foi possível enviar o e-mail de recuperação." });
    return;
  }

  res.json({ mensagem: "Se o e-mail estiver cadastrado, um link de recuperação foi enviado." });
};

export const redefinirSenha = async (req: Request, res: Response): Promise<void> => {
  const { token, password } = req.body;
  const regexSenha = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (typeof token !== "string" || typeof password !== "string" || !regexSenha.test(password)) {
    res.status(400).json({ erro: "Token ou senha inválidos." });
    return;
  }

  const user = await User.findOne({
    resetTokenHash: crypto.createHash("sha256").update(token).digest("hex"),
    resetTokenExpiresAt: { $gt: new Date() },
  });
  if (!user) {
    res.status(400).json({ erro: "O link é inválido ou expirou." });
    return;
  }

  user.senha = await bcrypt.hash(password, 10);
  user.resetTokenHash = undefined;
  user.resetTokenExpiresAt = undefined;
  await user.save();
  res.json({ mensagem: "Senha redefinida com sucesso." });
};

export const usersList = async (req: Request, res: Response): Promise<void> => {
  try {
    const visitantes = await User.find({});
    res.status(200).json(visitantes);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao buscar usuário." });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cpf, password } = req.body;
    if (typeof cpf !== "string" || typeof password !== "string") {
      res.status(400).json({ erro: "Dados de login inválidos." });
      return;
    }

    const cpfNormalizado = cpf.trim();
    const senhaInformada = password.trim();

    if (!cpfNormalizado || !senhaInformada) {
      res.status(400).json({ erro: "Dados de login inválidos." });
      return;
    }

    const user = await User.findOne({ cpf: cpfNormalizado });
    if (!user || !user.senha) {
      res.status(401).json({ erro: "CPF ou senha inválidos." });
      return;
    }

    const senhaCorreta = await bcrypt.compare(senhaInformada, user.senha);
    if (!senhaCorreta) {
      res.status(401).json({ erro: "CPF ou senha inválidos." });
      return;
    }

    const token = jwt.sign({ id: user._id, tipo: user.tipo }, CHAVE_MESTRA, { expiresIn: '1d' });

    res.status(200).json({ 
      mensagem: "Login realizado com sucesso!", 
      token, 
      usuario: {
        id: user._id, nome: `${user.nome} ${user.sobrenome}`, cpf: user.cpf, tipo: user.tipo, fotoUrl: user.fotoUrl
      }
    });
  } catch (erro) {
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
};

export const getAllUsersAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarios = await User.find().select('-senha').sort({ createdAt: -1 });
    res.status(200).json(usuarios);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao buscar a lista de usuários." });
  }
};

export const updateUserAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nome, sobrenome, ativo } = req.body;
    
    const userAtualizado = await User.findByIdAndUpdate(id, { nome, sobrenome, ativo }, { new: true }).select('-senha');
    if (!userAtualizado) { res.status(404).json({ erro: "Usuário não encontrado." }); return; }
    res.status(200).json(userAtualizado);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao atualizar os dados do usuário." });
  }
};

export const atualizarPerfilProprio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nome, sobrenome, password } = req.body;

    const user = await User.findById(id);
    if (!user) { res.status(404).json({ erro: "Usuário não encontrado." }); return; }

    if (nome) user.nome = nome;
    if (sobrenome) user.sobrenome = sobrenome;
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.senha = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.status(200).json({ 
      mensagem: "Perfil atualizado com sucesso!", 
      usuario: { id: user._id, nome: user.nome, sobrenome: user.sobrenome, cpf: user.cpf, matricula: user.matricula, tipo: user.tipo } 
    });
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao atualizar perfil." });
  }
};