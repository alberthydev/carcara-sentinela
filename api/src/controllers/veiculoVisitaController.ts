import { Request, Response } from "express";
import User from "../models/User";
import Visita from "../models/Visita";
import RegistroAcesso from "../models/RegistroAcesso";

export const adicionarVeiculo = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const novoVeiculo = req.body;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ erro: "Usuário não encontrado." });
      return;
    }

    user.carros?.push(novoVeiculo);
    await user.save();

    res
      .status(201)
      .json({ mensagem: "Veículo cadastrado!", carros: user.carros });
  } catch (erro) {
    console.error("Erro do Mongoose ao salvar carro:", erro);
    res.status(500).json({ erro: "Erro ao cadastrar veículo." });
  }
};

export const getVeiculos = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user?.carros || []);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao buscar veículos." });
  }
};

export const agendarVisita = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { dataVisita, horaVisita, placa, marca, modelo, cor } = req.body;

    const novaVisita = await Visita.create({
      usuarioId: id,
      dataVisita,
      horaVisita,
      veiculo: { placa, marca, modelo, cor },
    });

    res.status(201).json({ mensagem: "Visita agendada!", visita: novaVisita });
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao agendar visita." });
  }
};

export const getVisitasUsuario = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const visitas = await Visita.find({ usuarioId: req.params.id }).sort({
      dataVisita: 1,
    });
    res.status(200).json(visitas);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao buscar visitas." });
  }
};

export const getHistoricoAcessos = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const acessos = await RegistroAcesso.find({ usuarioId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(30);
    res.status(200).json(acessos);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao buscar histórico de acessos." });
  }
};

export const getTodosAcessos = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const acessos = await RegistroAcesso.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const acessosFormatados = await Promise.all(
      acessos.map(async (acesso: any) => {
        let carroTexto = acesso.placa;
        let usuarioObj: any = null;

        if (acesso.usuarioId) {
          try {
            usuarioObj = await User.findById(acesso.usuarioId).lean();
          } catch (err) {}
        }

        if (acesso.marca && acesso.marca !== "Desconhecida") {
          carroTexto = `${acesso.marca} | ${acesso.modelo} | ${acesso.cor} | ${acesso.placa}`;
        } 

        else if (usuarioObj?.carros) {
          const carro = usuarioObj.carros.find(
            (c: any) => c.placa === acesso.placa,
          );
          if (carro) {
            carroTexto = `${carro.marca} | ${carro.modelo} | ${carro.cor} | ${carro.placa}`;
          }
        }

        return {
          _id: acesso._id,
          nome: usuarioObj
            ? `${usuarioObj.nome} ${usuarioObj.sobrenome || ""}`.trim()
            : acesso.nomeMotorista || "Não Informado",
          tipo: usuarioObj?.tipo || acesso.tipoMotorista || "Acesso Manual",
          carro: carroTexto,
          placa: acesso.placa,
          marca: acesso.marca,
          modelo: acesso.modelo,
          cor: acesso.cor,
          horaEntrada: acesso.horaEntrada,
          horaSaida: acesso.horaSaida,
          isManual: !usuarioObj,
        };
      }),
    );

    res.status(200).json(acessosFormatados);
  } catch (erro) {
    console.error("Erro FATAL ao buscar histórico do Admin:", erro);
    res.status(500).json({ erro: "Erro ao buscar histórico geral." });
  }
};

export const registroManual = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { placa, marca, modelo, cor, nomeMotorista, tipoMotorista } =
      req.body;

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
      placa: placa.toUpperCase(),
      data: dataHoje,
      horaSaida: null,
    });

    if (registroAberto) {
      registroAberto.horaSaida = horaAgora;
      await registroAberto.save();
    } else {
      await RegistroAcesso.create({
        usuarioId: null,
        nomeMotorista: nomeMotorista || "Não Informado",
        tipoMotorista: tipoMotorista || "Acesso Manual",
        placa: placa.toUpperCase(),
        marca: marca || "Desconhecida",
        modelo: modelo || "Desconhecido",
        cor: cor || "Indefinida",
        data: dataHoje,
        horaEntrada: horaAgora,
      });
    }

    res.status(200).json({ mensagem: "Acesso manual registrado com sucesso!" });
  } catch (error) {
    console.error("Erro no registro manual:", error);
    res.status(500).json({ erro: "Erro ao registrar acesso manual." });
  }
};

export const getPlacasParaSimulacao = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const users = await User.find({}, "carros.placa").lean();
    const placasFixas = users.flatMap(
      (u: any) => u.carros?.map((c: any) => c.placa) || [],
    );

    const dataHoje = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
    }).format(new Date());
    const visitas = await Visita.find(
      { dataVisita: dataHoje },
      "veiculo.placa",
    ).lean();
    const placasVisitas = visitas
      .map((v: any) => v.veiculo?.placa)
      .filter(Boolean);

    const todasPlacas = [...new Set([...placasFixas, ...placasVisitas])];
    res.status(200).json(todasPlacas);
  } catch (erro) {
    console.error("Erro ao buscar placas para simulador:", erro);
    res.status(500).json({ erro: "Erro ao buscar placas." });
  }
};

export const getVagasOcupadas = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const dataHoje = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
    }).format(new Date());

    const ocupadas = await RegistroAcesso.countDocuments({
      data: dataHoje,
      horaSaida: null,
    });

    const todosAcessosHoje = await RegistroAcesso.find({
      data: dataHoje,
    }).lean();

    let auto = 0;
    let manual = 0;

    for (const acesso of todosAcessosHoje) {
      if (acesso.usuarioId) auto++;
      else manual++;
    }

    res
      .status(200)
      .json({ ocupadas, acessosAuto: auto, acessosManual: manual });
  } catch (erro) {
    console.error("Erro ao buscar vagas ocupadas e estatísticas:", erro);
    res.status(500).json({ erro: "Erro ao calcular estatísticas de acesso." });
  }
};

export const inativarVisita = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { visitaId } = req.params;
    await Visita.findByIdAndUpdate(visitaId, { ativo: false });
    res
      .status(200)
      .json({ mensagem: "Visita cancelada/inativada com sucesso." });
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao inativar visita." });
  }
};

export const editarVisita = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { visitaId } = req.params;
    const dadosAtualizados = req.body;

    const visita = await Visita.findByIdAndUpdate(visitaId, dadosAtualizados, {
      new: true,
    });
    res.status(200).json({ mensagem: "Visita atualizada!", visita });
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao editar visita." });
  }
};

export const removerVeiculo = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id, placa } = req.params;
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ erro: "Usuário não encontrado." });
      return;
    }

    user.carros = user.carros?.filter((c) => c.placa !== placa);
    await user.save();

    res.status(200).json({ mensagem: "Veículo removido com sucesso!" });
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao remover veículo." });
  }
};

export const editarVeiculo = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id, placa } = req.params;
    const dadosAtualizados = req.body;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ erro: "Usuário não encontrado." });
      return;
    }

    const carroIndex = user.carros?.findIndex((c) => c.placa === placa);
    if (carroIndex !== undefined && carroIndex >= 0 && user.carros) {
      user.carros[carroIndex] = {
        ...user.carros[carroIndex],
        ...dadosAtualizados,
      };
      await user.save();
      res
        .status(200)
        .json({ mensagem: "Veículo atualizado!", carros: user.carros });
    } else {
      res.status(404).json({ erro: "Veículo não encontrado." });
    }
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao atualizar veículo." });
  }
};
