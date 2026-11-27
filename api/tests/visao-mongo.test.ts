import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { after, before, describe, it } from "node:test";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import request from "supertest";
import { createApp } from "../src/server";
import Configuracao from "../src/models/Configuracao";
import RegistroAcesso from "../src/models/RegistroAcesso";
import User from "../src/models/User";

const uri = process.env.TEST_VISAO_MONGO_URI;
const credencial = randomBytes(32).toString("hex");
const app = createApp();
const operador = jwt.sign(
  { id: "operador-teste", tipo: "seguranca" },
  process.env.JWT_SECRET || "chave_mestra_carcara_2026",
);
const novoEvento = (placa: string, direcao: "entrada" | "saida") => ({
  versao: 2, evento_id: randomBytes(32).toString("hex"), camera_id: "portao-teste",
  placa, direcao, estado: "confirmada", confianca: 1, quadros: 5, leituras: 3,
  liberacao_automatica: true,
});
const enviar = (body: object) => request(app).post("/api/users/visao/passagem")
  .set("Authorization", "Bearer " + credencial).send(body);
const enviarLegado = (placa: string) => request(app).post("/api/users/visao/evento")
  .set("Authorization", "Bearer " + operador)
  .send({ placa_recomendada: placa, confianca_recomendada: 0.4, liberacao_automatica: false });
const manual = (placa: string, id: string, direcao: string) => request(app)
  .post("/api/users/admin/acesso-manual").set("Authorization", "Bearer " + operador)
  .send({ placa, confirmacao_visao: { id, direcao } });

describe("Layer 2 com MongoDB real", { skip: !uri }, () => {
  const dbName = "carcara_teste_visao_" + randomUUID().replace(/-/g, "");
  before(async () => {
    process.env.VISION_INGEST_TOKEN = credencial;
    await mongoose.connect(uri!, { dbName, serverSelectionTimeoutMS: 5000 });
    await Configuracao.create({ camada: 2 });
    await User.create({
      cpf: "cpf-teste", nome: "Pessoa", sobrenome: "Teste", fotoUrl: "sintetica",
      carros: ["ABC1234", "DEF1G23", "MNO1234", "OLD-1234"].map((placa) => ({
        placa, marca: "Teste", modelo: "Teste", cor: "Cinza",
      })),
    });
  });
  after(async () => {
    if (mongoose.connection.readyState === 1 && mongoose.connection.name === dbName) {
      await mongoose.connection.dropDatabase();
    }
    await mongoose.disconnect();
    delete process.env.VISION_INGEST_TOKEN;
  });

  it("encaminha incertezas e desconhecidos sem gravar acessos", async () => {
    const base = novoEvento("ABC1234", "entrada");
    for (const body of [
      { ...base, placa: null, estado: "revisao" },
      { ...base, leituras: 2 },
      { ...base, confianca: 0.5 },
      { ...base, liberacao_automatica: false },
      { ...base, direcao: null },
    ]) {
      const resposta = await enviar(body);
      assert.equal(resposta.status, 200);
      assert.equal(resposta.body.status, "revisao");
    }
    assert.equal((await enviarLegado("ABC1234")).body.status, "revisao");
    assert.equal((await enviar(novoEvento("ZZZ9Z99", "entrada"))).body.status, "desconhecido");
    assert.equal(await RegistroAcesso.countDocuments(), 0);
  });

  it("registra dois veículos, protege um acesso aberto e deduplica entrada e saída", async () => {
    const entrada = novoEvento("ABC1234", "entrada");
    const respostas = await Promise.all([enviar(entrada), enviar(entrada), enviar(novoEvento("DEF1G23", "entrada"))]);
    assert.deepEqual(respostas.map((r) => r.status), [200, 200, 200]);
    assert.deepEqual(respostas.slice(0, 2).map((r) => r.body.repetido).sort(), [false, true]);
    assert.equal(await RegistroAcesso.countDocuments({ horaSaida: null }), 2);
    assert.equal((await enviarLegado("ABC1234")).body.status, "revisao");
    const saida = novoEvento("ABC1234", "saida");
    assert.equal((await enviar({ ...saida, confianca: 0.6 })).body.status, "revisao");
    assert.equal(await RegistroAcesso.countDocuments({ placa: "ABC1234", horaSaida: null }), 1);
    assert.equal((await enviar({ ...entrada, camera_id: entrada.camera_id, direcao: "saida" })).status, 409);
    const fechamentos = await Promise.all([enviar(saida), enviar(saida)]);
    assert.deepEqual(fechamentos.map((r) => r.status), [200, 200]);
    assert.deepEqual(fechamentos.map((r) => r.body.repetido).sort(), [false, true]);
    assert.equal((await enviar(entrada)).body.repetido, true);
    assert.equal(await RegistroAcesso.countDocuments({ placa: "ABC1234" }), 1);
    assert.equal(await RegistroAcesso.countDocuments({ placa: "ABC1234", horaSaida: null }), 0);
  });

  it("permite só uma entrada concorrente, inclusive na confirmação manual", async () => {
    const id = randomBytes(16).toString("hex");
    const auto = novoEvento("MNO1234", "entrada");
    const corrida = await Promise.all([enviar(auto), manual(auto.placa, id, "entrada")]);
    assert.deepEqual(corrida.map((r) => r.status).sort(), [200, 409]);
    assert.equal(await RegistroAcesso.countDocuments({ placa: auto.placa, horaSaida: null }), 1);
    const saidaId = randomBytes(16).toString("hex");
    const saidas = await Promise.all([
      manual(auto.placa, saidaId, "saida"), manual(auto.placa, saidaId, "saida"),
    ]);
    assert.deepEqual(saidas.map((r) => r.status), [200, 200]);
    assert.deepEqual(saidas.map((r) => r.body.repetido).sort(), [false, true]);
    assert.equal(saidas[0].body.direcao, "saida");
    assert.match(saidas[0].body.hora, /^\d{2}:\d{2}:\d{2}$/);
    assert.equal(saidas[0].body.hora, saidas[1].body.hora);
    assert.equal(await RegistroAcesso.countDocuments({ placa: auto.placa, horaSaida: null }), 0);
    const historico = await request(app).get("/api/users/admin/acessos?ordem=atividade")
      .set("Authorization", "Bearer " + operador);
    const acesso = historico.body.find((item: { placa: string }) => item.placa === auto.placa);
    assert.equal(historico.status, 200);
    assert.equal(acesso.saidaManual, true);
    assert.equal(acesso.horaSaida, saidas[0].body.hora);
    assert.match(acesso.dataSaida, /^\d{2}\/\d{2}\/\d{4}$/);
    const consulta = await request(app).get("/api/users/admin/acessos?pagina=1&placa=MNO-1234&sentido=saida")
      .set("Authorization", "Bearer " + operador);
    assert.equal(consulta.status, 200);
    assert.deepEqual(consulta.body.registros.map((item: { placa: string }) => item.placa), [auto.placa]);
    assert.equal(consulta.body.proxima, false);
  });

  it("preserva histórico legado ambíguo e fecha acesso único com hífen", async () => {
    await RegistroAcesso.create({ placa: "OLD-1234", data: "10/10/2026", horaEntrada: "08:00" });
    const saida = novoEvento("OLD1234", "saida");
    assert.equal((await enviar(saida)).status, 200);
    assert.equal(await RegistroAcesso.countDocuments({ placa: "OLD-1234", horaSaida: null }), 0);
    await RegistroAcesso.create([
      { placa: "OLD-1234", data: "11/10/2026", horaEntrada: "08:00" },
      { placa: "OLD1234", data: "12/10/2026", horaEntrada: "08:00" },
    ]);
    assert.equal((await enviar(novoEvento("OLD1234", "saida"))).status, 409);
    assert.equal(await RegistroAcesso.countDocuments({ placa: { $in: ["OLD1234", "OLD-1234"] }, horaSaida: null }), 2);

    await RegistroAcesso.create(Array.from({ length: 21 }, (_, index) => ({
      placa: "PAG" + String(index).padStart(4, "0"), data: "12/10/2026", horaEntrada: "08:00",
    })));
    const buscarPagina = (pagina: number) => request(app)
      .get("/api/users/admin/acessos?placa=PAG&pagina=" + pagina)
      .set("Authorization", "Bearer " + operador);
    const [primeira, segunda] = await Promise.all([buscarPagina(1), buscarPagina(2)]);
    assert.equal(primeira.body.registros.length, 20);
    assert.equal(primeira.body.proxima, true);
    assert.equal(segunda.body.registros.length, 1);
    assert.equal(segunda.body.proxima, false);
  });
});
