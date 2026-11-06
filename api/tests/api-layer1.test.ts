import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { afterEach, describe, it } from "node:test";
import request from "supertest";
import nodemailer from "nodemailer";
import { createApp } from "../src/server";
import Configuracao from "../src/models/Configuracao";
import User from "../src/models/User";
import Visita from "../src/models/Visita";
import RegistroAcesso from "../src/models/RegistroAcesso";

const app = createApp();
const JWT_SECRET = "chave_mestra_carcara_2026";
const originals: Array<{ target: object; key: string; value: unknown }> = [];
const originalEnv = new Map<string, string | undefined>();

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
  for (const [key, value] of originalEnv) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  originalEnv.clear();
});

const replaceEnv = (key: string, value: string | undefined) => {
  if (!originalEnv.has(key)) originalEnv.set(key, process.env[key]);
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
};

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

  it("impede acesso ao perfil de outro usuário", async () => {
    const resposta = await request(app)
      .put("/api/users/outro-usuario/perfil")
      .set("Authorization", ["Bearer", token("visitante")].join(" "))
      .send({ nome: "Tentativa" });

    assert.equal(resposta.status, 403);
  });

  it("permite alterar a camada somente para o usuário dev", async () => {
    const resposta = await request(app)
      .put("/api/users/configuracao/camada")
      .set("Authorization", ["Bearer", token("admin")].join(" "))
      .send({ camada: 2 });

    assert.equal(resposta.status, 403);
  });

  it("restringe listagem administrativa por função", async () => {
    const resposta = await request(app)
      .get("/api/users/admin/usuarios")
      .set("Authorization", ["Bearer", token("seguranca")].join(" "));

    assert.equal(resposta.status, 403);
  });
});

describe("validação de veículos e visitas", () => {
  it("rejeita veículo com placa ou dados incompletos", async () => {
    const resposta = await request(app)
      .post("/api/users/usuario-teste/veiculos")
      .set("Authorization", ["Bearer", token("visitante")].join(" "))
      .send({ placa: "ABC", marca: "Fiat" });

    assert.equal(resposta.status, 400);
    assert.equal(resposta.body.erro, "Informe placa, marca, modelo e cor válidos.");
  });

  it("rejeita visita com data, horário ou veículo inválidos", async () => {
    const resposta = await request(app)
      .post("/api/users/usuario-teste/visitas")
      .set("Authorization", ["Bearer", token("visitante")].join(" "))
      .send({
        dataVisita: "amanhã",
        horaVisita: "25:99",
        placa: "ABC1234",
        marca: "Fiat",
        modelo: "Argo",
        cor: "Azul",
      });

    assert.equal(resposta.status, 400);
    assert.equal(resposta.body.erro, "Informe data, horário e dados válidos do veículo.");
  });
});

describe("recuperação de senha", () => {
  it("rejeita solicitação sem e-mail", async () => {
    const resposta = await request(app).post("/api/users/senha/recuperar").send({});

    assert.equal(resposta.status, 400);
    assert.equal(resposta.body.erro, "Informe um e-mail válido.");
  });

  it("rejeita redefinição com senha fora da política", async () => {
    const resposta = await request(app)
      .post("/api/users/senha/redefinir")
      .send({ token: "token-invalido", password: "fraca" });

    assert.equal(resposta.status, 400);
    assert.equal(resposta.body.erro, "Token ou senha inválidos.");
  });

  it("informa quando o SMTP não está configurado", async () => {
    replaceEnv("SMTP_HOST", undefined);
    replaceMethod(User, "findOne", async () => ({ email: "ana@example.com" }));

    const resposta = await request(app)
      .post("/api/users/senha/recuperar")
      .send({ email: "ANA@example.com" });

    assert.equal(resposta.status, 503);
    assert.equal(resposta.body.erro, "O envio de e-mails ainda não está configurado no servidor.");
  });

  it("envia o token, redefine a senha e invalida o token após o uso", async () => {
    const usuario = {
      email: "ana@example.com",
      resetTokenHash: undefined as string | undefined,
      resetTokenExpiresAt: undefined as Date | undefined,
      senha: "senha-anterior",
      save: async () => usuario,
    };
    let mensagem = "";
    let consultas = 0;
    replaceEnv("SMTP_HOST", "smtp.test");
    replaceEnv("SMTP_PORT", "587");
    replaceEnv("SMTP_USER", "test-user");
    replaceEnv("SMTP_PASSWORD", "test-password");
    replaceMethod(nodemailer, "createTransport", () => ({
      sendMail: async (opcoes: { text: string }) => {
        mensagem = opcoes.text;
      },
    }));
    replaceMethod(User, "findOne", async () => {
      consultas += 1;
      return consultas === 1 ? usuario : consultas === 2 ? usuario : null;
    });

    const solicitacao = await request(app)
      .post("/api/users/senha/recuperar")
      .send({ email: usuario.email });
    const tokenEnviado = mensagem.match(/token=([a-f0-9]{64})/)?.[1];

    assert.equal(solicitacao.status, 200);
    assert.ok(tokenEnviado);
    assert.ok(usuario.resetTokenHash);

    const redefinicao = await request(app)
      .post("/api/users/senha/redefinir")
      .send({ token: tokenEnviado, password: "NovaSenha1!" });

    assert.equal(redefinicao.status, 200);
    assert.equal(usuario.resetTokenHash, undefined);
    assert.equal(usuario.resetTokenExpiresAt, undefined);

    const reutilizacao = await request(app)
      .post("/api/users/senha/redefinir")
      .send({ token: tokenEnviado, password: "OutraSenha1!" });

    assert.equal(reutilizacao.status, 400);
    assert.equal(reutilizacao.body.erro, "O link é inválido ou expirou.");
  });

  it("rejeita token expirado", async () => {
    replaceMethod(User, "findOne", async () => null);

    const resposta = await request(app)
      .post("/api/users/senha/redefinir")
      .send({ token: "a".repeat(64), password: "NovaSenha1!" });

    assert.equal(resposta.status, 400);
    assert.equal(resposta.body.erro, "O link é inválido ou expirou.");
  });
});

describe("CORS", () => {
  it("permite somente as origens configuradas", async () => {
    replaceEnv("CORS_ORIGIN", "https://portal.example");
    const appWithCors = createApp();
    const permitida = await request(appWithCors).get("/health").set("Origin", "https://portal.example");
    const bloqueada = await request(appWithCors).get("/health").set("Origin", "https://outro.example");

    assert.equal(permitida.headers["access-control-allow-origin"], "https://portal.example");
    assert.equal(bloqueada.headers["access-control-allow-origin"], undefined);
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
