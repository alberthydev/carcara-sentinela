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
    marca: { type: String, required: false, default: null },
    modelo: { type: String, required: false, default: null },
    cor: { type: String, required: false, default: null },
    data: { type: String, required: true },
    horaEntrada: { type: String, required: true },
    horaSaida: { type: String, default: null },
    saidaManual: { type: Boolean },
    controleVisao: { type: Boolean, select: false },
    eventosVisao: {
      type: [new Schema({
        id: { type: String, required: true },
        direcao: { type: String, enum: ["entrada", "saida"], required: true },
      }, { _id: false })],
      default: undefined,
      select: false,
    },
  },
  { timestamps: true },
);

RegistroAcessoSchema.index({ "eventosVisao.id": 1 }, { unique: true, sparse: true });
RegistroAcessoSchema.index({ placa: 1 }, {
  name: "placa_aberta_visao",
  unique: true,
  partialFilterExpression: { controleVisao: true, horaSaida: { $eq: null } },
});

export default model("RegistroAcesso", RegistroAcessoSchema);
