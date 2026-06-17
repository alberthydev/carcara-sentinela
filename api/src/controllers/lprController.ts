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

    const registroAberto = await RegistroAcesso.findOne({
      placa: placaFormatada,
      data: dataHoje,
      horaSaida: null,
    });

    if (registroAberto) {
      registroAberto.horaSaida = horaAgora;
      await registroAberto.save();

      const evento = {
        placa: placaFormatada,
        marca: registroAberto.marca,
        modelo: registroAberto.modelo,
        cor: registroAberto.cor,
        timestamp: new Date().toISOString(),
        status: "conhecido",
        isSaida: true,
        motorista: {
          nome: registroAberto.nomeMotorista || "Usuário",
          tipo: "Saída de Veículo",
        },
      };

      clients.forEach((client) => client.write(`data: ${JSON.stringify(evento)}\n\n`));
      res.status(200).json({ mensagem: "Saída registrada.", evento });
      return;
    }

    let statusVeiculo = "desconhecido";
    let motoristaInfo = null;
    let marcaFinal = marca || "Desconhecida";
    let modeloFinal = modelo || "Desconhecido";
    let corFinal = cor || "Indefinida";

    const userFixo = await User.findOne({ "carros.placa": placaFormatada });
    const visitaAgendada = await Visita.findOne({ "veiculo.placa": placaFormatada, dataVisita: dataHoje });

    if (userFixo) {
      statusVeiculo = "conhecido";
      motoristaInfo = { nome: `${userFixo.nome} ${userFixo.sobrenome}`, tipo: userFixo.tipo };

      const carroEncontrado = userFixo.carros?.find(c => c.placa === placaFormatada);
      if (carroEncontrado) {
        marcaFinal = carroEncontrado.marca;
        modeloFinal = carroEncontrado.modelo;
        corFinal = carroEncontrado.cor;
      }

      await RegistroAcesso.create({
        usuarioId: userFixo._id,
        nomeMotorista: motoristaInfo.nome,
        tipoMotorista: motoristaInfo.tipo,
        placa: placaFormatada,
        marca: marcaFinal,
        modelo: modeloFinal,
        cor: corFinal,
        data: dataHoje,
        horaEntrada: horaAgora,
      });

    } else if (visitaAgendada) {
      statusVeiculo = "conhecido";
      if (visitaAgendada.veiculo) {
        marcaFinal = visitaAgendada.veiculo.marca;
        modeloFinal = visitaAgendada.veiculo.modelo;
        corFinal = visitaAgendada.veiculo.cor;
      }

      const visitante = await User.findById(visitaAgendada.usuarioId);
      motoristaInfo = {
        nome: visitante ? `${visitante.nome} ${visitante.sobrenome}` : "Visitante",
        tipo: "visitante",
      };

      if (!visitaAgendada.horaEntrada) {
        visitaAgendada.horaEntrada = horaAgora;
        visitaAgendada.status = "em_andamento";
        await visitaAgendada.save();

        await RegistroAcesso.create({
          usuarioId: visitaAgendada.usuarioId,
          nomeMotorista: motoristaInfo.nome,
          tipoMotorista: "visitante",
          placa: placaFormatada,
          marca: marcaFinal,
          modelo: modeloFinal,
          cor: corFinal,
          data: dataHoje,
          horaEntrada: horaAgora,
        });
      }
    }

    const evento = {
      placa: placaFormatada,
      marca: marcaFinal,
      modelo: modeloFinal,
      cor: corFinal,
      timestamp: new Date().toISOString(),
      status: statusVeiculo,
      isSaida: false,
      motorista: motoristaInfo,
    };

    clients.forEach((client) => client.write(`data: ${JSON.stringify(evento)}\n\n`));
    res.status(200).json({ mensagem: "Entrada processada.", evento });
  } catch (error) {
    res.status(500).json({ erro: "Erro interno LPR" });
  }
};