import { createHash, timingSafeEqual } from "node:crypto";
import { NextFunction, Request, Response } from "express";
import User from "../models/User";
import { acessoPorPassagem, variantesPlaca } from "./persistenciaVisao";

const normalizarPlaca = (valor: unknown) => {
  if (typeof valor !== "string") return null;
  const placa = valor.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return /^[A-Z]{3}[0-9](?:[0-9]{3}|[A-Z][0-9]{2})$/.test(placa) ? placa : null;
};

const confiancaValida = (valor: unknown): valor is number =>
  typeof valor === "number" && Number.isFinite(valor) && valor >= 0 && valor <= 1;

export const receberResultadoVisao = (req: Request, res: Response): void => {
  const resultado = req.body;
  const placa = normalizarPlaca(resultado?.placa_recomendada);
  const confianca = resultado?.confianca_recomendada;
  const experimental = resultado?.versao_evidencia === 1;
  if (
    typeof resultado?.liberacao_automatica !== "boolean" ||
    (resultado.versao_evidencia !== undefined && (!experimental || resultado.liberacao_automatica)) ||
    (!experimental && !confiancaValida(confianca))
  ) {
    res.status(400).json({ erro: "Resultado de visão inválido." });
    return;
  }
  res.json({
    mensagem: placa ? "Confira a passagem antes de registrar o acesso." : "Sem placa válida para confirmação.",
    status: "revisao",
    liberacao_automatica: false,
    placa_recomendada: placa,
  });
};

const sha256 = (value: string) => createHash("sha256").update(value).digest();

export const autenticarWorkerVisao = (req: Request, res: Response, next: NextFunction): void => {
  const token = process.env.VISION_INGEST_TOKEN;
  if (!token || token.length < 32) {
    res.status(503).json({ erro: "Ingestão automática de visão desativada." });
    return;
  }
  const recebido = req.get("Authorization") ?? "";
  if (!timingSafeEqual(sha256(recebido), sha256("Bearer " + token))) {
    res.status(401).json({ erro: "Credencial de visão inválida." });
    return;
  }
  next();
};

export const receberPassagemVisao = async (req: Request, res: Response): Promise<void> => {
  const evento = req.body;
  const placa = normalizarPlaca(evento?.placa);
  if (
    evento?.versao !== 2 || typeof evento.camera_id !== "string" ||
    !/^[a-zA-Z0-9_.-]{1,64}$/.test(evento.camera_id) ||
    typeof evento.evento_id !== "string" || !/^[a-f0-9]{64}$/.test(evento.evento_id)
  ) {
    res.status(400).json({ erro: "Identificação da passagem inválida." });
    return;
  }
  if (
    !placa || evento.estado !== "confirmada" || evento.liberacao_automatica !== true ||
    (evento.direcao !== "entrada" && evento.direcao !== "saida") ||
    !Number.isInteger(evento.quadros) || !Number.isInteger(evento.leituras) ||
    evento.leituras < 3 || evento.quadros < evento.leituras ||
    !confiancaValida(evento.confianca) || evento.confianca < 0.75
  ) {
    res.json({ status: "revisao", liberacao_automatica: false });
    return;
  }

  try {
    const decisao = await acessoPorPassagem(
      placa, "visao:" + evento.camera_id + ":" + evento.evento_id,
      async () => {
        const [usuario, outro] = await User.find({
          ativo: true, "carros.placa": { $in: variantesPlaca(placa) },
        }).limit(2);
        if (outro) return null;
        if (!usuario) return null;
        const carro = usuario.carros?.find((item) => normalizarPlaca(item.placa) === placa);
        return {
          usuarioId: usuario._id,
          nomeMotorista: usuario.nome + " " + usuario.sobrenome,
          tipoMotorista: usuario.tipo,
          marca: carro?.marca ?? "Desconhecida",
          modelo: carro?.modelo ?? "Desconhecido",
          cor: carro?.cor ?? "Indefinida",
        };
      },
      evento.direcao,
    );
    if (decisao.status === "conflito") {
      res.status(409).json({ status: "revisao", placa, motivo: decisao.motivo, liberacao_automatica: false });
      return;
    }
    if (decisao.status === "desconhecido") {
      res.json({ status: decisao.status, placa, liberacao_automatica: false });
      return;
    }
    res.json({
      status: "conhecido", placa, liberacao_automatica: true,
      isSaida: decisao.direcao === "saida", repetido: decisao.repetido,
    });
  } catch (error) {
    console.error("Erro ao registrar passagem de visão:", error);
    res.status(500).json({ erro: "Erro interno ao registrar passagem de visão." });
  }
};
