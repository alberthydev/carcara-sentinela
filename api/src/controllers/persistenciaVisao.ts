import RegistroAcesso from "../models/RegistroAcesso";

export type Direcao = "entrada" | "saida";

type DadosAcesso = Pick<InstanceType<typeof RegistroAcesso>,
  "usuarioId" | "nomeMotorista" | "tipoMotorista" | "marca" | "modelo" | "cor">;

type Decisao =
  | { status: "registrado"; direcao: Direcao; hora: string | null; repetido: boolean }
  | { status: "desconhecido" }
  | { status: "conflito"; motivo: string };

const formatoData = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" });
const formatoHora = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit", second: "2-digit",
});

export const variantesPlaca = (placa: string) => [placa, `${placa.slice(0, 3)}-${placa.slice(3)}`];

let indices: Promise<unknown> | undefined;

export async function acessoPorPassagem(
  placa: string, id: string, obterDados: () => Promise<DadosAcesso | null>, direcao: Direcao,
): Promise<Decisao> {
  indices ??= RegistroAcesso.createIndexes().catch((error) => {
    indices = undefined;
    throw error;
  });
  await indices;

  const lerReenvio = async (): Promise<Decisao | null> => {
    const registro = await RegistroAcesso.findOne({ "eventosVisao.id": id })
      .select("placa horaEntrada horaSaida +eventosVisao");
    const evento = registro?.eventosVisao?.find((item) => item.id === id);
    if (!registro || !evento) return null;
    if (!variantesPlaca(placa).includes(registro.placa) ||
        evento.direcao !== direcao) {
      return { status: "conflito", motivo: "Identificador já usado em outro acesso." };
    }
    const hora = direcao === "entrada" ? registro.horaEntrada : registro.horaSaida ?? null;
    return { status: "registrado", direcao, hora, repetido: true };
  };

  const anterior = await lerReenvio();
  if (anterior) return anterior;
  const dados = await obterDados();
  if (!dados) return { status: "desconhecido" };
  const abertos = await RegistroAcesso.find({ placa: { $in: variantesPlaca(placa) }, horaSaida: null })
    .select("_id").limit(2);
  const agora = new Date();
  const hora = formatoHora.format(agora);
  const evento = { id, direcao };

  try {
    if (direcao === "entrada" && !abertos.length) {
      await RegistroAcesso.create({
        ...dados, placa, data: formatoData.format(agora), horaEntrada: hora,
        controleVisao: true, eventosVisao: [evento],
      });
      return { status: "registrado", direcao, hora, repetido: false };
    }
    if (direcao === "saida" && abertos.length === 1) {
      const atualizado = await RegistroAcesso.updateOne(
        { _id: abertos[0]._id, horaSaida: null, "eventosVisao.id": { $ne: id } },
        { $set: { horaSaida: hora, saidaManual: id.startsWith("manual:") }, $push: { eventosVisao: evento } },
      );
      if (atualizado.modifiedCount === 1) return { status: "registrado", direcao, hora, repetido: false };
    }
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
  }

  return await lerReenvio() ?? {
    status: "conflito",
    motivo: "Direção incompatível com o estado do acesso. Confira manualmente.",
  };
}
