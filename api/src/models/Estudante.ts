import { Schema, model } from 'mongoose';

const EstudanteSchema = new Schema({
    cpf: { type: String, required: true, unique: true },
    matricula: { type: String, require: true, unique: true },
    nome: { type: String, require: true } 
});

export const Estudante = model('Estudante', EstudanteSchema);