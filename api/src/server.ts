import express from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import mongoose from "mongoose";
import cors from "cors";
import routes from "./routes/routes";
import { seedDatabase } from "./seeder";

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const swaggerDocument = YAML.load(path.join(__dirname, "docs/openapi.yaml"));

  app.get("/", (_req, res) => {
    res.json({ mensagem: "API Carcará Sentinela Operacional" });
  });

  app.use("/api/users", routes);
  app.use("/api/lpr", routes);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  return app;
};

export const startServer = async () => {
  const PORT = process.env.PORT || 3000;
  const MONGO_URI =
    process.env.MONGO_URI || "mongodb://banco_dados:27017/carcara_db";

  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Conectado");
    await seedDatabase();
  } catch (err) {
    console.error("Erro ao conectar no MongoDB:", err);
  }

  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
};

if (require.main === module) {
  void startServer();
}
