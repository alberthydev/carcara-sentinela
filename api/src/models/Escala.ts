import { Schema, model } from 'mongoose';

const EscalaSchema = new Schema({
  nome: { type: String, required: true },
  turno: { type: String, required: true },
  dias: [{ type: String, required: true }],
  horaInicio: { type: String, required: true },
  horaFim: { type: String, required: true } 
}, { timestamps: true });

export default model('Escala', EscalaSchema);