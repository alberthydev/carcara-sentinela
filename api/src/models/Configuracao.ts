import { Schema, model } from 'mongoose';

const ConfiguracaoSchema = new Schema({
  campusId: { type: String, default: 'videira-principal', unique: true },
  totalVagas: { type: Number, required: true, default: 200 }
});

export default model('Configuracao', ConfiguracaoSchema);