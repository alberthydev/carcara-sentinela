import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import mongoose from 'mongoose';
import cors from 'cors'; 
import routes from './routes/routes';
import { seedDatabase } from './seeder';

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://banco_dados:27017/carcara_db';
const swaggerDocument = YAML.load(path.join(__dirname, 'docs/openapi.yaml'));

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Conectado');
    seedDatabase();
  })
  .catch((err) => console.error('Erro ao conectar no MongoDB:', err));

app.get('/', (req, res) => {
  res.json({ mensagem: 'API Carcará Sentinela Operacional' });
});

app.use('/api', routes); 
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});