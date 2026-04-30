import { Router } from 'express';
import { cadastrarVisitante, listarVisitantes } from '../controllers/visitanteController';

const router = Router();

router.get('/todos', listarVisitantes);
router.post('/cadastro', cadastrarVisitante);

export default router;