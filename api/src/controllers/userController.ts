import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import { OAuth2Client } from "google-auth-library";
import { Estudante } from "../models/Estudante";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);

export const googleAuth = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { token, tipo, cpf } = req.body; // cpf agora é opcional aqui

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      res
        .status(401)
        .json({ erro: "Não foi possível extrair dados do perfil do Google." });
      return;
    }

    const email = payload.email;
    const nomeCompleto = payload.name || "";
    const fotoUrl = payload.picture || "";

    // 1. Tenta buscar o usuário pelo e-mail do Google primeiro (vínculo já existente)
    let usuario = await User.findOne({ email: email });

    // 2. Se não achou por e-mail, mas o usuário digitou o CPF na tela de vínculo posterior
    if (!usuario && cpf) {
      usuario = await User.findOne({ cpf: cpf.trim() });

      if (usuario) {
        // Se achou o usuário pelo CPF, vincula o e-mail do Google nele para os próximos logins
        usuario.email = email;
        if (fotoUrl) usuario.fotoUrl = fotoUrl;
        await usuario.save();
        console.log(`🔗 E-mail ${email} vinculado com sucesso ao CPF ${cpf}`);
      } else {
        // Se nem o CPF existia, criamos o usuário do zero (Fluxo de Registro)
        console.log(
          `👤 Criando novo perfil de [${tipo || "visitante"}] via primeiro acesso Google para: ${email}`,
        );

        const partesNome = nomeCompleto.split(" ");
        const nome = partesNome[0];
        const sobrenome = partesNome.slice(1).join(" ") || " ";

        // Lógica de validação do IFC caso seja aluno/servidor
        if (tipo === "aluno" || tipo === "servidor") {
          const dadosAcademicos = await Estudante.findOne({ cpf: cpf.trim() });
          if (!dadosAcademicos) {
            res
              .status(403)
              .json({ erro: "Este CPF não foi encontrado no sistema do IFC." });
            return;
          }

          usuario = await User.create({
            cpf: cpf.trim(),
            matricula: dadosAcademicos.matricula,
            nome: nome,
            sobrenome: sobrenome,
            email,
            tipo,
            fotoUrl,
            ativo: true,
          });
        } else {
          // Visitante
          usuario = await User.create({
            cpf: cpf.trim(),
            nome: nome,
            sobrenome: sobrenome,
            email,
            tipo: "visitante",
            fotoUrl,
            ativo: true,
          });
        }
      }
    }

    // 3. Se não achou por e-mail E o usuário não mandou CPF (é o primeiro clique dele no Login)
    if (!usuario && !cpf) {
      // Retornamos 202 (Aceito, mas incompleto) sinalizando que o frontend precisa pedir o CPF
      res.status(202).json({
        vinculoPendente: true,
        mensagem:
          "Conta Google autenticada. É necessário informar o CPF para concluir o vínculo.",
        perfilSugerido: { nomeCompleto, fotoUrl },
      });
      return;
    }

    // 4. Se chegou aqui, o usuário existe (achou por e-mail ou acabou de vincular/criar)
    res.status(200).json({
      mensagem: "Autenticação realizada com sucesso!",
      usuario: {
        id: usuario?._id,
        nome: `${usuario?.nome} ${usuario?.sobrenome}`,
        cpf: usuario?.cpf,
        tipo: usuario?.tipo,
        fotoUrl: usuario?.fotoUrl,
      },
    });
  } catch (error: any) {
    console.error("❌ Erro no controlador de auth do Google:", error.message);
    res.status(401).json({ erro: "Token do Google inválido ou expirado." });
  }
};

export const registryUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { cpf, matricula, senha, nome, sobrenome, fotoUrl, carros, tipo } =
      req.body;

    const regexSenha =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!regexSenha.test(senha)) {
      res.status(400).json({
        erro: "A senha não atende aos requisitos mínimos de segurança.",
      });
      return;
    }

    const regexFoto = /\.(png|jpg|jpeg)$/i;
    if (!regexFoto.test(fotoUrl)) {
      res
        .status(400)
        .json({ erro: "A foto deve estar no formato PNG, JPG ou JPEG." });
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
      cpf,
      matricula,
      senha: senhaHash,
      nome,
      sobrenome,
      tipo,
      fotoUrl,
      carros: carros || [],
    });

    await newUser.save();

    res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
  } catch (erro) {
    console.error("Erro no cadastro:", erro);
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
