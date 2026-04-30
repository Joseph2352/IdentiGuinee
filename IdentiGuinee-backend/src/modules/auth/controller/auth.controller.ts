import { Request, Response, NextFunction } from 'express';
import authService from '../service/auth.service.js';
import { AuthRequest } from '../../../common/middlewares/auth.middleware.js';

class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { telephone, email, password, nom, prenom, sexe, dateNaissance, lieuNaissance, nin } = req.body;
      if (!telephone || !password || !nom || !prenom || !sexe || !dateNaissance || !lieuNaissance) {
        return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
      }
      const result = await authService.register({ 
        telephone, 
        email, 
        password, 
        nom, 
        prenom,
        sexe,
        dateNaissance,
        lieuNaissance,
        nin
      });
      res.status(201).json({ success: true, message: 'Compte créé avec succès', data: result });
    } catch (error: any) {
      if (error.message.includes('déjà utilisé')) {
        return res.status(409).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier, password } = req.body;
      if (!identifier || !password) {
        return res.status(400).json({ success: false, message: 'Identifiant et mot de passe requis' });
      }
      const result = await authService.login(identifier, password);
      res.json({ success: true, message: 'Connexion réussie', data: result });
    } catch (error: any) {
      if (error.message.includes('incorrect')) {
        return res.status(401).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Error('Non authentifié');
      const user = await authService.validateToken(req.user.id);
      res.json({ success: true, data: { user } });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
