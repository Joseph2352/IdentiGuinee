import { Router } from 'express';
import citoyenController from '../controller/citoyen.controller.js';
import { authMiddleware, adminMiddleware } from '../../../common/middlewares/auth.middleware.js';
import { upload } from '../../../common/config/multer.js';

const router = Router();

// Routes citoyens authentifiés
router.get('/me', authMiddleware, citoyenController.getMyProfile);
router.get('/carte/pdf/:id', authMiddleware, citoyenController.downloadCartePDF);
router.patch('/me', authMiddleware, upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'signature', maxCount: 1 }]), citoyenController.updateMyProfile);
router.post('/profile', authMiddleware, upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'signature', maxCount: 1 }]), citoyenController.createProfile);

// Routes admin
router.get('/', authMiddleware, adminMiddleware, citoyenController.getAll);
router.get('/:id', authMiddleware, adminMiddleware, citoyenController.getById);
router.put('/:id', authMiddleware, adminMiddleware, citoyenController.updateProfile);

export default router;
