import { Router } from 'express';
import carteController from '../controller/carte.controller.js';

const router = Router();

// Routes protégées ou publiques selon le besoin
// Ici on considère que l'admin y accède
router.get('/', carteController.getAll);
router.get('/:id', carteController.getById);
router.get('/:id/pdf', carteController.downloadPDF);

export default router;
