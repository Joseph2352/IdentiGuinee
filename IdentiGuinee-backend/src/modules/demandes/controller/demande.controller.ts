import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import demandeService from '../service/demande.service.js';
import { AuthRequest } from '../../../common/middlewares/auth.middleware.js';
import prisma from '../../../common/config/prisma.js';

class DemandeController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const statut = req.query.statut as string | undefined;
      const result = await demandeService.getAll(page, limit, { statut });
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const demande = await demandeService.getById(req.params.id as string);
      res.json({ success: true, data: demande });
    } catch (error: any) {
      if (error.message === 'Demande non trouvée') return res.status(404).json({ success: false, message: error.message });
      next(error);
    }
  }

  async getMyDemandes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const demandes = await demandeService.getByUserId(req.user!.id);
      res.json({ success: true, data: demandes });
    } catch (error: any) {
      if (error.message === 'Profil citoyen non trouvé') return res.status(404).json({ success: false, message: error.message });
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const extraitNaissanceUrl = files?.extrait ? `/uploads/extraits/${files.extrait[0].filename}` : undefined;
      const signatureUrl = files?.signature ? `/uploads/signatures/${files.signature[0].filename}` : undefined;
      
      const demande = await demandeService.createFromUser(req.user!.id, {
        ...req.body,
        extraitNaissanceUrl,
        signatureUrl,
      });
      res.status(201).json({ success: true, message: 'Demande soumise avec succès. L\'ancrage blockchain sera effectué lors de la délivrance.', data: demande });
    } catch (error: any) {
      if (error.message.includes('Complétez votre profil')) return res.status(404).json({ success: false, message: error.message });
      next(error);
    }
  }

  async updateStatut(req: Request, res: Response, next: NextFunction) {
    try {
      const { statut, progression, motifRejet } = req.body;
      const demande = await demandeService.updateStatut(req.params.id as string, statut, progression, motifRejet);
      res.json({ success: true, message: 'Statut mis à jour', data: demande });
    } catch (error) { next(error); }
  }

  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await demandeService.getStats();
      res.json({ success: true, data: stats });
    } catch (error) { next(error); }
  }

  async serveExtrait(req: Request, res: Response, next: NextFunction) {
    try {
      const { filename } = req.params;
      const safeFilename = String(filename).toLowerCase().endsWith('.pdf') ? String(filename) : `${filename}.pdf`;
      
      const filePath = path.join(process.cwd(), 'uploads/extraits', safeFilename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'Document non trouvé' });
      }

      // Standard download headers
      res.status(200);
      res.contentType('application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('Cache-Control', 'no-cache');
      
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    } catch (error) { next(error); }
  }
}

export default new DemandeController();
