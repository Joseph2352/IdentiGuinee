import { Request, Response, NextFunction } from 'express';
import prisma from '../../../common/config/prisma.js';
import blockchainService from '../service/blockchain.service.js';
import { AuthRequest } from '../../../common/middlewares/auth.middleware.js';

class BlockchainController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 30;
      const skip = (page - 1) * limit;

      const [transactions, total] = await Promise.all([
        prisma.blockchainTransaction.findMany({
          skip, take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.blockchainTransaction.count(),
      ]);

      res.json({ success: true, data: { transactions, total, page, totalPages: Math.ceil(total / limit) } });
    } catch (error) { next(error); }
  }

  async getByHash(req: Request, res: Response, next: NextFunction) {
    try {
      const tx = await prisma.blockchainTransaction.findUnique({ where: { txHash: req.params.hash as string } });
      if (!tx) return res.status(404).json({ success: false, message: 'Transaction non trouvée' });
      res.json({ success: true, data: tx });
    } catch (error) { next(error); }
  }

  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const [total, demandes, delivrances, verifications, revocations] = await Promise.all([
        prisma.blockchainTransaction.count(),
        prisma.blockchainTransaction.count({ where: { type: 'DEMANDE_SOUMISE' } }),
        prisma.blockchainTransaction.count({ where: { type: 'CARTE_DELIVREE' } }),
        prisma.blockchainTransaction.count({ where: { type: 'VERIFICATION' } }),
        prisma.blockchainTransaction.count({ where: { type: 'REVOCATION' } }),
      ]);
      res.json({ success: true, data: { total, demandes, delivrances, verifications, revocations } });
    } catch (error) { next(error); }
  }

  async anchor(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { numeroCarte, nin, hashDonnees, lieuDelivrance, dateExpiration } = req.body;

      const result = await blockchainService.certifierCarte(
        numeroCarte, 
        nin, 
        hashDonnees, 
        lieuDelivrance, 
        dateExpiration
      );
      
      // Log dans la DB
      await prisma.blockchainTransaction.create({
        data: {
          txHash: result.txHash,
          type: 'CARTE_DELIVREE',
          status: 'CONFIRMED',
          details: `Certification de la carte ${numeroCarte} sur la blockchain`,
          metadata: { numeroCarte, nin, blockNumber: result.blockNumber.toString() }
        }
      });

      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const { numeroCarte } = req.params;
      const result = await blockchainService.verifierCarte(numeroCarte as string);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async getIntegrity(req: Request, res: Response, next: NextFunction) {
    try {
      const { numeroCarte } = req.params;

      // 1. Récupérer les données en base de données
      const carte = await prisma.carteIdentite.findUnique({
        where: { numeroCarte: numeroCarte as string },
        include: { citoyen: true }
      }) as any;

      if (!carte) return res.status(404).json({ success: false, message: 'Carte non trouvée en base de données' });

      // 2. Recalculer le hash à partir des données DB
      const dbHash = blockchainService.generateDataHash({
        numeroCarte: carte.numeroCarte,
        nin: carte.citoyen.nin!,
        nom: carte.citoyen.nom,
        prenom: carte.citoyen.prenom,
        dateNaissance: carte.citoyen.dateNaissance,
        lieuNaissance: carte.citoyen.lieuNaissance,
        dateExpiration: carte.dateExpiration
      });

      // 3. Récupérer les données sur la Blockchain
      const chainData = await blockchainService.verifierCarte(numeroCarte as string);

      if (!chainData.valide) {
        return res.json({
          success: true,
          status: 'INVALID',
          message: 'Cette carte n\'existe pas sur la blockchain ou a expiré/été révoquée.',
          details: { dbHash, chainHash: null }
        });
      }

      // 4. Comparer les hashes
      const isIntegrityOk = dbHash === chainData.hashDonnees;

      res.json({
        success: true,
        status: isIntegrityOk ? 'VALID' : 'TAMPERED',
        message: isIntegrityOk ? 'Intégrité vérifiée avec succès' : 'ATTENTION : Les données locales ne correspondent pas à la blockchain !',
        data: {
          carte: {
            nom: carte.citoyen.nom,
            prenom: carte.citoyen.prenom,
            numero: carte.numeroCarte,
            dateExpiration: carte.dateExpiration
          },
          blockchain: {
            dateAncrage: chainData.dateAncrage,
            revoquee: chainData.revoquee
          },
          isIntegrityOk
        }
      });
    } catch (error) { next(error); }
  }
}

export default new BlockchainController();
