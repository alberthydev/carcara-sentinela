import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { OAuth2Client } from "google-auth-library";
import { Estudante } from "../models/Estudante";

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
        const partesNome = nomeCompleto.split(" ");
        const nome = partesNome[0];
        const sobrenome = partesNome.slice(1).join(" ") || " ";

        if (tipo === "aluno" || tipo === "servidor") {
          const dadosAcademicos = await Estudante.findOne({ cpf: cpf.trim() });
          if (!dadosAcademicos) {
            res.status(403).json({ erro: "Este CPF não foi encontrado no sistema do IFC." });
            return;
          }

          usuario = await User.create({
            cpf: cpf.trim(), matricula: dadosAcademicos.matricula, nome, sobrenome, email, tipo, fotoUrl, ativo: true,
          });
        } else {
          usuario = await User.create({
            cpf: cpf.trim(), nome, sobrenome, email, tipo: "visitante", fotoUrl, ativo: true,
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
    const { cpf, matricula, senha, nome, sobrenome, fotoUrl, carros, tipo } = req.body;

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

    const hasUser = await User.findOne({ cpf });
    if (hasUser) {
      res.status(400).json({ erro: "CPF já cadastrado." });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const newUser = new User({
      cpf, matricula, senha: senhaHash, nome, sobrenome, tipo, fotoUrl, carros: carros || [],
    });

    await newUser.save();
    res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
  } catch (erro) {
    res.status(500).json({ erro: "Erro interno do servidor." });
  }
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