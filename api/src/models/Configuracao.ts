import { Schema, model } from 'mongoose';
import { CAMADAS_INSTITUICAO, CamadaInstituicao } from './Camada';

export interface IConfiguracao {
  campusId: string;
  totalVagas: number;
  camada: CamadaInstituicao;
}

const ConfiguracaoSchema = new Schema<IConfiguracao>({
  campusId: { type: String, default: 'videira-principal', unique: true },
  totalVagas: { type: Number, required: true, default: 200 },
  camada: { type: Number, enum: CAMADAS_INSTITUICAO, required: true, default: 1 },
});

export default model<IConfiguracao>('Configuracao', ConfiguracaoSchema);