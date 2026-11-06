import "dotenv/config";
import express from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import mongoose from "mongoose";
import cors from "cors";
import routes from "./routes/routes";
import { seedDatabase } from "./seeder";

const apiVersion = process.env.API_VERSION || "1.0.0";
const apiBuild = process.env.API_BUILD || process.env.NODE_ENV || "development";

export const createApp = () => {
  const app = express();

  const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
  }));
  app.use(express.json());

  const swaggerDocument = YAML.load(path.join(__dirname, "docs/openapi.yaml"));

  app.get("/", (_req, res) => {
    res.json({ mensagem: "API Carcará Sentinela Operacional", versao: apiVersion, build: apiBuild });
  });
  app.get("/version", (_req, res) => {
    res.json({ servico: "api", versao: apiVersion, build: apiBuild });
  });
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", servico: "api", versao: apiVersion, build: apiBuild });
  });
  app.get("/health/ready", (_req, res) => {
    const pronto = mongoose.connection.readyState === 1;
    res.status(pronto ? 200 : 503).json({
      status: pronto ? "ready" : "not_ready",
      mongodb: pronto ? "connected" : "disconnected",
    });
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
