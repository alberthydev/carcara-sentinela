import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'; 
import visitanteRoutes from './routes/visitanteRoutes';

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://banco_dados:27017/carcara_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('🔥 MongoDB Conectado'))
  .catch((err) => console.error('Erro ao conectar no MongoDB:', err));

app.get('/', (req, res) => {
  res.json({ mensagem: 'API Carcará Sentinela Operacional' });
});

app.use('/api/visitantes', visitanteRoutes); 

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});