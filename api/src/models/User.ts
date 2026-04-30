import mongoose, { Schema, Document } from 'mongoose';

export interface ICarro {
  placa: string;
  marca: string;
  ano: number;
  modelo: string;
  cor: string;
}

export interface IUser extends Document {
  cpf: string;
  senha: string;
  nome: string;
  sobrenome: string;
  tipo: 'visitante' | 'aluno' | 'servidor',
  fotoUrl: string; 
  carros?: ICarro[]; // Opcional
}

const UserSchema: Schema = new Schema({
  cpf: { type: String, required: true, unique: true },
  matricula: { type: String, required: false},
  senha: { type: String, required: true },
  nome: { type: String, required: true },
  sobrenome: { type: String, required: true },
  tipo: { 
    type: String, 
    enum: ['visitante', 'aluno', 'servidor'], 
    required: true,
    default: 'visitante' 
  },
  fotoUrl: { type: String, required: true },
  carros: [{
    placa: { type: String, required: true },
    marca: { type: String, required: true },
    ano: { type: Number, required: true },
    modelo: { type: String, required: true },
    cor: { type: String, required: true }
  }]
}, { timestamps: true });

export default mongoose.model<IUser>('Visitante', UserSchema);