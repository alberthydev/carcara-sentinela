import { Request, Response } from "express";
import User from "../models/User";
import Visita from "../models/Visita";
import RegistroAcesso from "../models/RegistroAcesso";

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

export const simularLeituraLPR = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { placa, marca, modelo, cor } = req.body;
    if (!placa) {
      res.status(400).json({ erro: "Placa é obrigatória" });
      return;
    }

    const placaFormatada = placa.toUpperCase();
    const dataHoje = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
    }).format(new Date());
    const horaAgora = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date());
    const userFixo = await User.findOne({ "carros.placa": placaFormatada });
    const visitaAgendada = await Visita.findOne({
      "veiculo.placa": placaFormatada,
      dataVisita: dataHoje,
    });

    let statusVeiculo = "desconhecido";
    let motoristaInfo = null;

    if (userFixo) {
      statusVeiculo = "conhecido";
      motoristaInfo = {
        nome: `${userFixo.nome} ${userFixo.sobrenome}`,
        tipo: userFixo.tipo,
      };

      const registroAberto = await RegistroAcesso.findOne({
        usuarioId: userFixo._id,
        placa: placaFormatada,
        data: dataHoje,
        horaSaida: null,
      });

      if (registroAberto) {
        registroAberto.horaSaida = horaAgora;
        await registroAberto.save();
      } else {
        await RegistroAcesso.create({
          usuarioId: userFixo._id,
          placa: placaFormatada,
          data: dataHoje,
          horaEntrada: horaAgora,
        });
      }
    } else if (visitaAgendada) {
      statusVeiculo = "conhecido";

      const visitante = await User.findById(visitaAgendada.usuarioId);
      motoristaInfo = {
        nome: visitante
          ? `${visitante.nome} ${visitante.sobrenome}`
          : "Visitante",
        tipo: "visitante",
      };

      if (!visitaAgendada.horaEntrada) {
        visitaAgendada.horaEntrada = horaAgora;
        visitaAgendada.status = "em_andamento";
      } else if (!visitaAgendada.horaSaida) {
        visitaAgendada.horaSaida = horaAgora;
        visitaAgendada.status = "concluida";
      }
      await visitaAgendada.save();
    }

    const evento = {
      placa: placaFormatada,
      marca: marca || "Desconhecida",
      modelo: modelo || "Desconhecido",
      cor: cor || "Indefinida",
      timestamp: new Date().toISOString(),
      status: statusVeiculo,
      motorista: motoristaInfo,
    };

    clients.forEach((client) =>
      client.write(`data: ${JSON.stringify(evento)}\n\n`),
    );
    res.status(200).json({
      mensagem: "Evento LPR processado e salvo no histórico.",
      evento,
    });
  } catch (error) {
    console.error("Erro no LPR:", error);
    res.status(500).json({ erro: "Erro interno ao processar LPR" });
  }
};
