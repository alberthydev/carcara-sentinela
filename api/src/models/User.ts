import mongoose, { Schema, Document } from "mongoose";

export interface ICarro {
  placa: string;
  marca: string;
  ano: number;
  modelo: string;
  cor: string;
}

export interface IUser extends Document {
  cpf: string;
  matricula: string;
  senha?: string;
  email?: string;
  nome: string;
  sobrenome: string;
  tipo: "visitante" | "aluno" | "servidor";
  fotoUrl: string;
  ativo: boolean;
  carros?: ICarro[];
}

const UserSchema: Schema = new Schema(
  {
    cpf: { type: String, required: true, unique: true },
    matricula: { type: String, required: false },
    senha: { type: String, required: false },
    email: { type: String, required: false, sparse: true },
    nome: { type: String, required: true },
    sobrenome: { type: String, required: true },
    ativo: { type: Boolean, required: true, default: true },
    tipo: {
      type: String,
      enum: ["visitante", "aluno", "servidor", "admin", "seguranca", "dev"],
      required: true,
      default: "visitante",
    },
    fotoUrl: { type: String, required: true },
    carros: [
      {
        placa: { type: String, required: true },
        marca: { type: String, required: true },
        modelo: { type: String, required: true },
        cor: { type: String, required: true },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model<IUser>("Visitante", UserSchema);
