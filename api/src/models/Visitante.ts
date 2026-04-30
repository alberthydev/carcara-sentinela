import mongoose, { Schema, Document } from 'mongoose';

export interface ICarro {
  placa: string;
  marca: string;
  ano: number;
  modelo: string;
  cor: string;
}

export interface IVisitante extends Document {
  cpf: string;
  senha: string;
  nome: string;
  sobrenome: string;
  fotoUrl: string; 
  carros?: ICarro[]; // Opcional
}

const VisitanteSchema: Schema = new Schema({
  cpf: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  nome: { type: String, required: true },
  sobrenome: { type: String, required: true },
  fotoUrl: { type: String, required: true },
  carros: [{
    placa: { type: String, required: true },
    marca: { type: String, required: true },
    ano: { type: Number, required: true },
    modelo: { type: String, required: true },
    cor: { type: String, required: true }
  }]
}, { timestamps: true });

export default mongoose.model<IVisitante>('Visitante', VisitanteSchema);