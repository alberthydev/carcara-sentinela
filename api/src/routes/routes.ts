import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";

// Controllers
import { registryUser, loginUser, googleAuth, getAllUsersAdmin, updateUserAdmin, atualizarPerfilProprio, solicitarRecuperacaoSenha, redefinirSenha } from "../controllers/userController";
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
import { requerPapel, requerPropriaVisita, requerProprioUsuario } from "../middleware/authorizationMiddleware";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { erro: "Muitas tentativas de login. Tente novamente em alguns minutos." },
});

router.get("/health", (_req, res) => {
  res.json({ status: "ok", servico: "users" });
});
router.post("/login", authLimiter, loginUser);
router.post("/cadastro", registryUser);
router.post("/auth/google", authLimiter, googleAuth);
router.post("/senha/recuperar", authLimiter, solicitarRecuperacaoSenha);
router.post("/senha/redefinir", authLimiter, redefinirSenha);

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
router.put("/:id/perfil", requerProprioUsuario, atualizarPerfilProprio);

// --- Admin ---
router.get("/admin/acessos", requerPapel("admin", "seguranca", "dev"), getTodosAcessos);
router.get("/admin/vagas-ocupadas", requerPapel("admin", "seguranca", "dev"), getVagasOcupadas);
router.get("/admin/usuarios", requerPapel("admin", "dev"), getAllUsersAdmin);
router.post("/admin/acesso-manual", requerPapel("admin", "seguranca", "dev"), registroManual);
router.post("/admin/cadastro-rapido", requerPapel("admin", "seguranca", "dev"), cadastroRapidoPortaria);
router.put("/admin/usuarios/:id", requerPapel("admin", "dev"), updateUserAdmin);

// --- Configurações Gerais ---
router.get("/configuracao", getConfiguracao);
router.put("/configuracao", requerPapel("admin", "dev"), updateConfiguracao);
router.put("/configuracao/camada", requerUsuarioDev, updateCamada);

// --- Escala ---
router.get("/escala", requerPapel("admin", "dev"), getEscalas);
router.get("/escala/ativa", requerPapel("admin", "seguranca", "dev"), getEscalaAtiva);
router.post("/escala", requerPapel("admin", "dev"), createEscala);
router.put("/escala/:id", requerPapel("admin", "dev"), updateEscala);

// --- Veículos (Meus Veículos) ---
router.post("/:id/veiculos", requerProprioUsuario, adicionarVeiculo);
router.get("/:id/veiculos", requerProprioUsuario, getVeiculos);
router.delete("/:id/veiculos/:placa", requerProprioUsuario, removerVeiculo);
router.put("/:id/veiculos/:placa", requerProprioUsuario, editarVeiculo);

// --- Visitas (Agendamentos) ---
router.post("/:id/visitas", requerProprioUsuario, agendarVisita);
router.get("/:id/visitas", requerProprioUsuario, getVisitasUsuario);
router.put("/visitas/:visitaId/inativar", requerPropriaVisita, inativarVisita);
router.put("/visitas/:visitaId", requerPropriaVisita, editarVisita);

// --- Histórico Pessoal ---
router.get("/:id/acessos", requerProprioUsuario, getHistoricoAcessos);

export default router;