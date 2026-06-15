import { Request, Response } from "express";
import User from "../models/User";

let clients: Response[] = [];

export const lprStream = (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  clients.push(res);

  req.on("close", () => {
    clients = clients.filter((client) => client !== res);
  });
};

export const simularLeituraLPR = async (req: Request, res: Response): Promise<void> => {
  try {
    const { placa, marca, modelo, cor } = req.body;

    if (!placa) {
      res.status(400).json({ erro: "Placa é obrigatória" });
      return;
    }

    const user = await User.findOne({ "carros.placa": placa.toUpperCase() });

    const evento = {
      placa: placa.toUpperCase(),
      marca: marca || "Desconhecida",
      modelo: modelo || "Desconhecido",
      cor: cor || "Indefinida",
      timestamp: new Date().toISOString(),
      status: user ? "conhecido" : "desconhecido",
      motorista: user ? { nome: `${user.nome} ${user.sobrenome}`, tipo: user.tipo } : null,
    };

    clients.forEach((client) => {
      client.write(`data: ${JSON.stringify(evento)}\n\n`);
    });

    res.status(200).json({ mensagem: "Evento LPR processado e enviado.", evento });
  } catch (error) {
    console.error("Erro no LPR:", error);
    res.status(500).json({ erro: "Erro interno ao processar LPR" });
  }
};