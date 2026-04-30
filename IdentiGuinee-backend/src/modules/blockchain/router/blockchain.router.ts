import { Router } from 'express';
import blockchainController from '../controller/blockchain.controller.js';
import { authMiddleware, adminMiddleware } from '../../../common/middlewares/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, adminMiddleware, blockchainController.getAll);
router.get('/stats', authMiddleware, adminMiddleware, blockchainController.getStats);
router.get('/tx/:hash', blockchainController.getByHash);

// Nouvelles routes d'ancrage et de vérification
router.post('/anchor', authMiddleware, blockchainController.anchor);
router.get('/verify/:numeroCarte', blockchainController.verify);
router.get('/integrity/:numeroCarte', blockchainController.getIntegrity);

export default router;
