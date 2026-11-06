import { Request, Response } from "express";
import User from "../models/User";
import RegistroAcesso from "../models/RegistroAcesso";

interface ResultadoVisao {
  placa_recomendada?: string | null;
  confianca_recomendada?: number;
  liberacao_automatica?: boolean;
  video?: string;
  deteccoes?: unknown[];
}

const normalizarPlaca = (valor: string) =>
  valor.toUpperCase().replace(/[^A-Z0-9]/g, "");

const dataHoraAtual = () => {
  const agora = new Date();
  return {
    data: new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
    }).format(agora),
    hora: new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(agora),
  };
};

export const receberResultadoVisao = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const resultado = req.body as ResultadoVisao;
  const placa = resultado.placa_recomendada
    ? normalizarPlaca(resultado.placa_recomendada)
    : undefined;
  const confianca = resultado.confianca_recomendada;

  if (
    !placa ||
    placa.length < 6 ||
    placa.length > 8 ||
    typeof confianca !== "number" ||
    confianca < 0 ||
    confianca > 1 ||
    typeof resultado.liberacao_automatica !== "boolean"
  ) {
    res.status(400).json({
      erro: "Resultado de visão inválido. Informe placa_recomendada, confianca_recomendada e liberacao_automatica.",
    });
    return;
  }

  const { data, hora } = dataHoraAtual();
  const registrosAbertos = await RegistroAcesso.find({
    placa,
    data,
    horaSaida: null,
  });

  if (registrosAbertos.length > 0) {
    await Promise.all(
      registrosAbertos.map(async (registroAberto) => {
        registroAberto.horaSaida = hora;
        await registroAberto.save();
      }),
    );
    res.status(200).json({
      mensagem: "Saída Layer 2 registrada.",
      status: "conhecido",
      placa,
      confianca,
      isSaida: true,
      liberacao_automatica: true,
    });
    return;
  }

  const usuario = await User.findOne({
    "carros.placa": { $in: [placa, `${placa.slice(0, 3)}-${placa.slice(3)}`] },
  });

  if (!usuario) {
    res.status(200).json({
      mensagem: "Placa não encontrada na whitelist.",
      status: "desconhecido",
      placa,
      confianca,
    });
    return;
  }

  try {
    const carro = usuario.carros?.find(
      (item) => normalizarPlaca(item.placa) === placa,
    );
    const nomeMotorista = `${usuario.nome} ${usuario.sobrenome}`;

    await RegistroAcesso.create({
      usuarioId: usuario._id,
      nomeMotorista,
      tipoMotorista: usuario.tipo,
      placa,
      marca: carro?.marca ?? "Desconhecida",
      modelo: carro?.modelo ?? "Desconhecido",
      cor: carro?.cor ?? "Indefinida",
      data,
      horaEntrada: hora,
    });

    res.status(200).json({
      mensagem: "Acesso Layer 2 autorizado automaticamente.",
      status: "conhecido",
      placa,
      confianca,
      liberacao_automatica: true,
      motorista: { nome: nomeMotorista, tipo: usuario.tipo },
    });
  } catch (error) {
    console.error("Erro ao registrar resultado de visão:", error);
    res.status(500).json({ erro: "Erro interno ao registrar resultado de visão." });
  }
};
