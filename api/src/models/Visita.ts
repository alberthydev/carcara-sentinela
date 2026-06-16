import { Schema, model } from "mongoose";

const VisitaSchema = new Schema(
  {
    usuarioId: {
      type: Schema.Types.ObjectId,
      ref: "Visitante",
      required: true,
    },
    dataVisita: { type: String, required: true },
    horaVisita: { type: String, required: true },
    veiculo: {
      placa: { type: String, required: true },
      marca: { type: String, required: true },
      modelo: { type: String, required: true },
      cor: { type: String, required: true },
    },
    horaEntrada: { type: String, default: null },
    horaSaida: { type: String, default: null },
    status: {
      type: String,
      default: "agendada",
      enum: ["agendada", "em_andamento", "concluida"],
    },
    ativo: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default model("Visita", VisitaSchema);
