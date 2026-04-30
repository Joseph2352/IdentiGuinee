import { Request, Response, NextFunction } from 'express';
import geoService from '../service/geo.service.js';

class GeoController {
  async getRegions(_req: Request, res: Response, next: NextFunction) {
    try {
      const regions = await geoService.getRegions();
      res.json({ success: true, data: regions });
    } catch (error) { next(error); }
  }

  async getPrefectures(req: Request, res: Response, next: NextFunction) {
    try {
      const regionId = req.query.regionId as string | undefined;
      const prefectures = await geoService.getPrefectures(regionId);
      res.json({ success: true, data: prefectures });
    } catch (error) { next(error); }
  }

  async getSousPrefectures(req: Request, res: Response, next: NextFunction) {
    try {
      const prefectureId = req.query.prefectureId as string | undefined;
      const sousPrefectures = await geoService.getSousPrefectures(prefectureId);
      res.json({ success: true, data: sousPrefectures });
    } catch (error) { next(error); }
  }
}

export default new GeoController();
