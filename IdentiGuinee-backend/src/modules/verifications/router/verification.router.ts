import { Router } from 'express';
import verificationController from '../controller/verification.controller.js';
import { authMiddleware, adminMiddleware } from '../../../common/middlewares/auth.middleware.js';

const router = Router();

// Route publique : vérifier une carte
router.get('/verifier', verificationController.verifierCarte);

// Admin : historique et stats
router.get('/historique', authMiddleware, adminMiddleware, verificationController.getHistorique);
router.get('/stats', authMiddleware, adminMiddleware, verificationController.getDashboardStats);

export default router;
