// Serve the real application against a disposable demo database.
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import bcrypt from "bcrypt";
import express from "express";
import mongoose from "mongoose";
import Configuracao from "../src/models/Configuracao";
import User from "../src/models/User";
import { createApp } from "../src/server";

async function main() {
  const uri = process.env.DEMO_MONGO_URI;
  const senha = process.env.DEMO_PASSWORD;
  const token = process.env.VISION_INGEST_TOKEN;
  const address = uri ? new URL(uri) : null;
  if (address?.protocol !== "mongodb:" || address.hostname !== "127.0.0.1" ||
      !senha || !token || token.length < 32) {
    throw new Error("Configure DEMO_MONGO_URI em loopback, DEMO_PASSWORD e VISION_INGEST_TOKEN.");
  }
  const dist = path.resolve(__dirname, "../../app/dist");
  const index = path.join(dist, "index.html");
  if (!existsSync(index)) throw new Error("Gere o build do app antes de iniciar a bancada.");

  const dbName = "carcara_demo_" + randomUUID().replace(/-/g, "");
  const limpar = async () => {
    if (mongoose.connection.name === dbName && mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
    }
    await mongoose.disconnect();
  };
  try {
    await mongoose.connect(uri!, { dbName, serverSelectionTimeoutMS: 5000 });
    await Configuracao.create({ camada: 2 });
    await User.create({
      cpf: "000.000.000-00", nome: "Operador", sobrenome: "Demonstração",
      senha: await bcrypt.hash(senha, 10), tipo: "dev", fotoUrl: "/favicon.ico",
      carros: ["ABC1D23", "DEF1G23"].map((placa) => ({
        placa, marca: "Teste", modelo: "Bancada", cor: "Cinza",
      })),
    });
    const app = createApp();
    app.use(express.static(dist));
    app.get(["/login", "/dashboard"], (_req, res) => res.sendFile(index));
    const server = app.listen(3300, "127.0.0.1", () => {
      console.log("Demonstração em http://127.0.0.1:3300 com banco descartável " + dbName);
    });
    let encerrando = false;
    const fechar = () => {
      if (encerrando) return;
      encerrando = true;
      server.close(() => void limpar().catch(() => { process.exitCode = 1; }));
      server.closeAllConnections();
    };
    process.on("SIGINT", fechar);
    process.on("SIGTERM", fechar);
    server.on("error", (error) => {
      console.error(error.message);
      process.exitCode = 1;
      fechar();
    });
  } catch (error) {
    await limpar();
    throw error;
  }
}

void main().catch((error: Error) => {
  console.error(error.message);
  process.exitCode = 1;
});
