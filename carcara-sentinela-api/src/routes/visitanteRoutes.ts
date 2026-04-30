import { Router } from 'express';
import { cadastrarVisitante } from '../controllers/visitanteController';

const router = Router();

router.post('/cadastro', cadastrarVisitante);

export default router;