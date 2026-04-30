import { Request, Response, NextFunction } from 'express';
import carteRepository from '../repository/carte.repository.js';
import carteService from '../service/carte.service.js';

class CarteController {
  /**
   * Récupère toutes les cartes avec pagination
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await carteRepository.findAll(page, limit);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupère une carte par son ID
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const carte = await carteRepository.findById(id as string);

      if (!carte) {
        return res.status(404).json({ success: false, message: 'Carte non trouvée' });
      }

      res.json({ success: true, data: carte });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Télécharge le PDF d'une carte
   */
  async downloadPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const pdf = await carteService.generateCardPDF(id as string);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=carte_${id}.pdf`);
      
      pdf.pipe(res);
    } catch (error) {
      next(error);
    }
  }
}

export default new CarteController();
