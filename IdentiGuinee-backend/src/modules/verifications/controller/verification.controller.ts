import { Request, Response, NextFunction } from 'express';
import verificationService from '../service/verification.service.js';

class VerificationController {
  /** Endpoint public : vérifier une carte par son numéro ou NIN */
  async verifierCarte(req: Request, res: Response, next: NextFunction) {
    try {
      const { numeroCarte, nin, institution } = req.query;
      
      if (!numeroCarte && !nin) {
        return res.status(400).json({ success: false, message: 'Numéro de carte ou NIN requis pour la recherche' });
      }

      const result = await verificationService.verifierCarte({
        numeroCarte: numeroCarte as string,
        nin: nin as string,
        institution: institution as string,
        ipAddress: req.ip,
      });

      if (!result) {
        return res.status(404).json({ success: false, message: 'Aucune carte trouvée ou document invalide', resultat: 'INVALIDE' });
      }

      res.json(result);
    } catch (error) { next(error); }
  }

  /** Admin : historique des vérifications */
  async getHistorique(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 30;

      const result = await verificationService.getHistorique(page, limit);

      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  /** Admin : statistiques globales de vérification */
  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await verificationService.getDashboardStats();
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }
}

export default new VerificationController();
