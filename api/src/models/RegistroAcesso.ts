import { Schema, model } from "mongoose";

const RegistroAcessoSchema = new Schema(
  {
    usuarioId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    nomeMotorista: { type: String, required: false, default: null },
    tipoMotorista: { type: String, required: false, default: null },
    placa: { type: String, required: true },
    data: { type: String, required: true },
    horaEntrada: { type: String, required: true },
    horaSaida: { type: String, default: null },
  },
  { timestamps: true },
);

export default model("RegistroAcesso", RegistroAcessoSchema);
