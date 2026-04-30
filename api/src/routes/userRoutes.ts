import { Router } from 'express';
import { registryUser, listarVisitantes } from '../controllers/userController';

const router = Router();

router.get('/todos', listarVisitantes);
router.post('/cadastro', registryUser);

export default router;