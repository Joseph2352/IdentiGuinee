import { Router } from 'express';
import geoController from '../controller/geo.controller.js';

const router = Router();

router.get('/regions', geoController.getRegions);
router.get('/prefectures', geoController.getPrefectures);
router.get('/sous-prefectures', geoController.getSousPrefectures);

export default router;
