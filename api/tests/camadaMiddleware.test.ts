import assert from "node:assert/strict";
import express from "express";
import { describe, it } from "node:test";
import request from "supertest";
import { criarMiddlewareCamada } from "../src/middleware/camadaMiddleware";

const criarAppDeTeste = (
  camada: 1 | 2,
  camadaPermitida: 1 | 2 = 1,
) => {
  const app = express();
  app.get(
    "/recurso",
    criarMiddlewareCamada(async () => camada, camadaPermitida),
    (_req, res) => res.status(200).json({ liberado: true }),
  );
  return app;
};

describe("liberação de recursos por camada", () => {
  it("libera o recurso quando a instituição está na camada exigida", async () => {
    const resposta = await request(criarAppDeTeste(1)).get("/recurso");

    assert.equal(resposta.status, 200);
    assert.deepEqual(resposta.body, { liberado: true });
  });

  it("bloqueia um recurso de layer 1 para uma instituição layer 2", async () => {
    const resposta = await request(criarAppDeTeste(2)).get("/recurso");

    assert.equal(resposta.status, 403);
    assert.equal(resposta.body.camadaAtual, 2);
    assert.equal(resposta.body.camadaPermitida, 1);
  });

  it("permite declarar recursos exclusivos da layer 2", async () => {
    const resposta = await request(criarAppDeTeste(2, 2)).get("/recurso");

    assert.equal(resposta.status, 200);
  });

  it("retorna erro explícito quando não consegue resolver a camada", async () => {
    const app = express();
    app.get(
      "/recurso",
      criarMiddlewareCamada(async () => {
        throw new Error("falha de configuração");
      }, 1),
      (_req, res) => res.status(200).send(),
    );

    const resposta = await request(app).get("/recurso");

    assert.equal(resposta.status, 500);
    assert.equal(
      resposta.body.erro,
      "Não foi possível validar os recursos da instituição.",
    );
  });
});
