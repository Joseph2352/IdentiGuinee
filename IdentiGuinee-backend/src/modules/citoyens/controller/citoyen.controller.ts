import { Request, Response, NextFunction } from 'express';
import citoyenService from '../service/citoyen.service.js';
import carteService from '../../cartes/service/carte.service.js';
import { AuthRequest } from '../../../common/middlewares/auth.middleware.js';

class CitoyenController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await citoyenService.getAll(page, limit);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const citoyen = await citoyenService.getById(req.params.id as string);
      res.json({ success: true, data: citoyen });
    } catch (error: any) {
      if (error.message === 'Citoyen non trouvé') return res.status(404).json({ success: false, message: error.message });
      next(error);
    }
  }

  async getMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const citoyen = await citoyenService.getByUserId(req.user!.id);
      res.json({ success: true, data: citoyen });
    } catch (error: any) {
      if (error.message === 'Profil citoyen non trouvé') return res.status(404).json({ success: false, message: error.message });
      next(error);
    }
  }

  async createProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const photoUrl = files?.photo ? `/uploads/photos/${files.photo[0].filename}` : undefined;
      const signatureUrl = files?.signature ? `/uploads/signatures/${files.signature[0].filename}` : undefined;

      const citoyen = await citoyenService.createProfile(req.user!.id, {
        ...req.body,
        photoUrl,
        signatureUrl,
      });

      res.status(201).json({ success: true, message: 'Profil citoyen créé', data: citoyen });
    } catch (error: any) {
      if (error.message.includes('déjà')) return res.status(409).json({ success: false, message: error.message });
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const citoyen = await citoyenService.updateProfile(req.params.id as string, req.body);
      res.json({ success: true, message: 'Profil mis à jour', data: citoyen });
    } catch (error) { next(error); }
  }

  async updateMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const citoyen = await citoyenService.getByUserId(req.user!.id);
      
      const updateData = { ...req.body };
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files?.photo) {
        updateData.photoUrl = `/uploads/photos/${files.photo[0].filename}`;
      }
      if (files?.signature) {
        updateData.signatureUrl = `/uploads/signatures/${files.signature[0].filename}`;
      }

      const updated = await citoyenService.updateProfile(citoyen.id, updateData);
      res.json({ success: true, message: 'Votre profil a été mis à jour', data: updated });
    } catch (error: any) {
      if (error.message === 'Profil citoyen non trouvé') return res.status(404).json({ success: false, message: error.message });
      next(error);
    }
  }

  async downloadCartePDF(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const doc = await carteService.generateCardPDF(id);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=carte-identite-${id}.pdf`);

      doc.pipe(res);
    } catch (error) {
      next(error);
    }
  }
}

export default new CitoyenController();
