import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { afterEach, describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../src/server";
import Configuracao from "../src/models/Configuracao";
import User from "../src/models/User";
import Visita from "../src/models/Visita";
import RegistroAcesso from "../src/models/RegistroAcesso";

const app = createApp();
const JWT_SECRET = "chave_mestra_carcara_2026";
const originals: Array<{ target: object; key: string; value: unknown }> = [];

const replaceMethod = (target: object, key: string, value: unknown) => {
  if (!originals.some((original) => original.target === target && original.key === key)) {
    originals.push({ target, key, value: (target as Record<string, unknown>)[key] });
  }
  (target as Record<string, unknown>)[key] = value;
};

afterEach(() => {
  for (const { target, key, value } of originals) {
    (target as Record<string, unknown>)[key] = value;
  }
  originals.length = 0;
});

const token = (tipo = "seguranca") =>
  jwt.sign({ id: "usuario-teste", tipo }, JWT_SECRET, { expiresIn: "1h" });

const mockLayer1 = () => {
  replaceMethod(Configuracao, "findOne", () => ({
    lean: async () => ({ camada: 1 }),
  }));
};

const mockLayer2 = () => {
  replaceMethod(Configuracao, "findOne", () => ({
    lean: async () => ({ camada: 2 }),
  }));
};

describe("autenticação e autorização da API", () => {
  it("recusa evento LPR sem token", async () => {
    const resposta = await request(app).post("/api/lpr/evento").send({ placa: "ABC1234" });

    assert.equal(resposta.status, 401);
    assert.equal(resposta.body.erro, "Acesso negado. Token não fornecido.");
  });

  it("recusa token inválido", async () => {
    const resposta = await request(app)
      .post("/api/lpr/evento")
      .set("Authorization", ["Bearer", "invalid"].join(" "))
      .send({ placa: "ABC1234" });

    assert.equal(resposta.status, 403);
    assert.equal(resposta.body.erro, "Token inválido ou expirado.");
  });

  it("valida o formato do login antes de consultar o banco", async () => {
    const resposta = await request(app).post("/api/users/login").send({});

    assert.equal(resposta.status, 400);
    assert.equal(resposta.body.erro, "Dados de login inválidos.");
  });
});

describe("configuração e fluxo LPR da Layer 1", () => {
  it("rejeita uma camada inválida na configuração", async () => {
    const resposta = await request(app)
      .put("/api/users/configuracao")
      .set("Authorization", ["Bearer", token("admin")].join(" "))
      .send({ camada: 3 });

    assert.equal(resposta.status, 400);
    assert.equal(resposta.body.erro, "A camada da instituição deve ser 1 ou 2.");
  });

  describe("integração do worker na Layer 2", () => {
    it("bloqueia o endpoint de visão quando a instituição está na Layer 1", async () => {
      mockLayer1();

      const resposta = await request(app)
        .post("/api/users/visao/evento")
        .set("Authorization", ["Bearer", token()].join(" "))
        .send({
          placa_recomendada: "QJF5373",
          confianca_recomendada: 0.9,
          liberacao_automatica: true,
        });

      assert.equal(resposta.status, 403);
    });

    it("encaminha resultado de placa não cadastrada para intervenção", async () => {
      mockLayer2();
      replaceMethod(RegistroAcesso, "find", async () => []);
      replaceMethod(User, "findOne", async () => null);

      const resposta = await request(app)
        .post("/api/users/visao/evento")
        .set("Authorization", ["Bearer", token()].join(" "))
        .send({
          placa_recomendada: "QJF5373",
          confianca_recomendada: 0.5,
          liberacao_automatica: false,
          deteccoes: [{ placa: "QJF8373" }],
        });

      assert.equal(resposta.status, 200);
      assert.equal(resposta.body.status, "desconhecido");
      assert.equal(resposta.body.placa, "QJF5373");
    });

    it("encaminha placa não cadastrada para intervenção manual", async () => {
      mockLayer2();
      replaceMethod(RegistroAcesso, "find", async () => []);
      replaceMethod(User, "findOne", async () => null);

      const resposta = await request(app)
        .post("/api/users/visao/evento")
        .set("Authorization", ["Bearer", token()].join(" "))
        .send({
          placa_recomendada: "ZZZ9999",
          confianca_recomendada: 0.5,
          liberacao_automatica: false,
        });

      assert.equal(resposta.status, 200);
      assert.equal(resposta.body.status, "desconhecido");
      assert.equal(resposta.body.placa, "ZZZ9999");
    });

    it("autoriza automaticamente placa cadastrada mesmo com confiança abaixo do limite", async () => {
      mockLayer2();
      replaceMethod(RegistroAcesso, "find", async () => []);
      replaceMethod(User, "findOne", async () => ({
        _id: "usuario-1",
        nome: "Ana",
        sobrenome: "Silva",
        tipo: "servidor",
        carros: [{ placa: "QJF5373", marca: "Fiat", modelo: "Argo", cor: "Azul" }],
      }));
      replaceMethod(RegistroAcesso, "create", async (dados: object) => dados);

      const resposta = await request(app)
        .post("/api/users/visao/evento")
        .set("Authorization", ["Bearer", token()].join(" "))
        .send({
          placa_recomendada: "QJF5373",
          confianca_recomendada: 0.5,
          liberacao_automatica: false,
        });

      assert.equal(resposta.status, 200);
      assert.equal(resposta.body.status, "conhecido");
      assert.equal(resposta.body.liberacao_automatica, true);
    });

    it("registra a saída quando já existe uma entrada aberta", async () => {
      mockLayer2();
      const registro = {
        placa: "QJF5373",
        data: "02/11/2026",
        horaSaida: null,
        save: async () => registro,
      };
      replaceMethod(RegistroAcesso, "find", async () => [registro]);

      const resposta = await request(app)
        .post("/api/users/visao/evento")
        .set("Authorization", ["Bearer", token()].join(" "))
        .send({
          placa_recomendada: "QJF5373",
          confianca_recomendada: 0.5,
          liberacao_automatica: false,
        });

      assert.equal(resposta.status, 200);
      assert.equal(resposta.body.isSaida, true);
      assert.equal(resposta.body.mensagem, "Saída Layer 2 registrada.");
      assert.notEqual(registro.horaSaida, null);
    });
  });

  it("processa a entrada de um veículo cadastrado", async () => {
    mockLayer1();
    replaceMethod(User, "findOne", async () => ({
      _id: "usuario-1",
      nome: "Ana",
      sobrenome: "Silva",
      tipo: "servidor",
      carros: [{ placa: "ABC1234", marca: "Fiat", modelo: "Argo", cor: "Azul" }],
    }));
    replaceMethod(Visita, "findOne", async () => null);
    replaceMethod(RegistroAcesso, "findOne", async () => null);
    replaceMethod(RegistroAcesso, "create", async (dados: object) => dados);

    const resposta = await request(app)
      .post("/api/lpr/evento")
      .set("Authorization", ["Bearer", token()].join(" "))
      .send({ placa: "abc1234" });

    assert.equal(resposta.status, 200);
    assert.equal(resposta.body.evento.status, "conhecido");
    assert.equal(resposta.body.evento.placa, "ABC1234");
    assert.equal(resposta.body.evento.motorista.nome, "Ana Silva");
  });

  it("processa a saída de um veículo com registro aberto", async () => {
    mockLayer1();
    const registro = {
      placa: "ABC1234",
      marca: "Fiat",
      modelo: "Argo",
      cor: "Azul",
      nomeMotorista: "Ana Silva",
      horaSaida: null,
      save: async () => undefined,
    };
    replaceMethod(RegistroAcesso, "findOne", async () => registro);

    const resposta = await request(app)
      .post("/api/lpr/evento")
      .set("Authorization", ["Bearer", token()].join(" "))
      .send({ placa: "abc1234" });

    assert.equal(resposta.status, 200);
    assert.equal(resposta.body.mensagem, "Saída registrada.");
    assert.equal(resposta.body.evento.isSaida, true);
    assert.equal(resposta.body.evento.status, "conhecido");
  });
});
