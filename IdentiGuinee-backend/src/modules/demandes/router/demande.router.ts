import { Router } from 'express';
import demandeController from '../controller/demande.controller.js';
import { authMiddleware, adminMiddleware } from '../../../common/middlewares/auth.middleware.js';
import { upload } from '../../../common/config/multer.js';

const router = Router();

// Citoyen routes
router.get('/mes-demandes', authMiddleware, demandeController.getMyDemandes);
router.post('/', authMiddleware, upload.fields([
  { name: 'extrait', maxCount: 1 },
  { name: 'signature', maxCount: 1 }
]), demandeController.create);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, demandeController.getAll);
router.get('/stats', authMiddleware, adminMiddleware, demandeController.getStats);
router.get('/document/:filename', authMiddleware, demandeController.serveExtrait);
router.get('/:id', authMiddleware, demandeController.getById);
router.patch('/:id/statut', authMiddleware, adminMiddleware, demandeController.updateStatut);

export default router;
