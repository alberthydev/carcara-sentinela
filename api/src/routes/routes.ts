import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";

// Controllers
import { registryUser, loginUser, googleAuth, getAllUsersAdmin, updateUserAdmin, atualizarPerfilProprio } from "../controllers/userController";
import { lprStream, simularLeituraLPR } from "../controllers/lprController";
import { getConfiguracao, updateConfiguracao, updateCamada } from "../controllers/configuracaoController";
import { getEscalas, createEscala, updateEscala, getEscalaAtiva } from "../controllers/escalaController";
import { adicionarVeiculo, getVeiculos, agendarVisita, getVisitasUsuario, getHistoricoAcessos, getTodosAcessos, registroManual, cadastroRapidoPortaria, getPlacasParaSimulacao, getVagasOcupadas, inativarVisita, editarVisita, removerVeiculo, editarVeiculo } from "../controllers/veiculoVisitaController";

// Models e Middlewares
import { Estudante } from "../models/Estudante";
import { verificarToken } from "../middleware/authMiddleware";
import { requerCamadaLpr, requerCamadaVisao } from "../middleware/camadaMiddleware";
import { receberResultadoVisao } from "../controllers/visaoController";
import { requerUsuarioDev } from "../middleware/devMiddleware";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { erro: "Muitas tentativas de login. Tente novamente em alguns minutos." },
});

router.post("/login", authLimiter, loginUser);
router.post("/cadastro", registryUser);
router.post("/auth/google", authLimiter, googleAuth);

router.get("/validar-ifc/:cpf/:matricula", async (req: Request, res: Response) => {
  try {
    const { cpf, matricula } = req.params;
    const estudante = await Estudante.findOne({ cpf: cpf.trim(), matricula: matricula.trim() });
    if (estudante) return res.json({ valido: true, nome: estudante.nome });
    res.status(404).json({ valido: false, erro: "Nenhuma matrícula encontrada." });
  } catch (error) {
    res.status(500).json({ erro: "Erro interno ao consultar banco." });
  }
});

router.use(verificarToken);

// --- LPR e Câmera ---
router.post("/visao/evento", requerCamadaVisao, receberResultadoVisao);
router.get("/stream", requerCamadaLpr, lprStream);
router.post("/evento", requerCamadaLpr, simularLeituraLPR);
router.get("/placas-simulacao", requerCamadaLpr, getPlacasParaSimulacao);

// --- Perfil ---
router.put("/:id/perfil", atualizarPerfilProprio);

// --- Admin ---
router.get("/admin/acessos", getTodosAcessos);
router.get("/admin/vagas-ocupadas", getVagasOcupadas);
router.get("/admin/usuarios", getAllUsersAdmin);
router.post("/admin/acesso-manual", registroManual);
router.post("/admin/cadastro-rapido", cadastroRapidoPortaria);
router.put("/admin/usuarios/:id", updateUserAdmin);

// --- Configurações Gerais ---
router.get("/configuracao", getConfiguracao);
router.put("/configuracao", updateConfiguracao);
router.put("/configuracao/camada", requerUsuarioDev, updateCamada);

// --- Escala ---
router.get("/escala", getEscalas);
router.get("/escala/ativa", getEscalaAtiva);
router.post("/escala", createEscala);
router.put("/escala/:id", updateEscala);

// --- Veículos (Meus Veículos) ---
router.post("/:id/veiculos", adicionarVeiculo);
router.get("/:id/veiculos", getVeiculos);
router.delete("/:id/veiculos/:placa", removerVeiculo);
router.put("/:id/veiculos/:placa", editarVeiculo);

// --- Visitas (Agendamentos) ---
router.post("/:id/visitas", agendarVisita);
router.get("/:id/visitas", getVisitasUsuario);
router.put("/visitas/:visitaId/inativar", inativarVisita);
router.put("/visitas/:visitaId", editarVisita);

// --- Histórico Pessoal ---
router.get("/:id/acessos", getHistoricoAcessos);

export default router;