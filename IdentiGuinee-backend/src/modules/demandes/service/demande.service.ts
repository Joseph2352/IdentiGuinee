import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import demandeRepository from '../repository/demande.repository.js';
import prisma from '../../../common/config/prisma.js';
import carteService from '../../cartes/service/carte.service.js';

class DemandeService {
  async getAll(page?: number, limit?: number, filters?: any) {
    return demandeRepository.findAll(page, limit, filters);
  }

  async getById(id: string) {
    const demande = await demandeRepository.findById(id);
    if (!demande) throw new Error('Demande non trouvée');
    return demande;
  }

  async getByCitoyenId(citoyenId: string) {
    return demandeRepository.findByCitoyenId(citoyenId);
  }

  async getByUserId(userId: string) {
    const citoyen = await prisma.citoyen.findUnique({ where: { userId } });
    if (!citoyen) throw new Error('Profil citoyen non trouvé');
    return demandeRepository.findByCitoyenId(citoyen.id);
  }

  async create(citoyenId: string, data: { type: string; extraitNaissanceUrl?: string; extraitNaissanceId?: string; signatureUrl?: string }) {
    const reference = `REQ-GN-${new Date().getFullYear()}-${uuidv4().substring(0, 4).toUpperCase()}`;

    const demande = await demandeRepository.create({
      citoyenId,
      reference,
      type: data.type,
      statut: 'SOUMISE',
      progression: 10,
      extraitNaissanceUrl: data.extraitNaissanceUrl,
      extraitNaissanceId: data.extraitNaissanceId,
    });

    // Mettre à jour la signature du citoyen si fournie
    if (data.signatureUrl) {
      await prisma.citoyen.update({
        where: { id: citoyenId },
        data: { signatureUrl: data.signatureUrl }
      });
    }

    // Ancrage blockchain simulation (Demande soumise)
    const txHash = '0x' + crypto.createHash('sha256').update(demande.id + Date.now()).digest('hex');
    await prisma.blockchainTransaction.create({
      data: {
        txHash,
        type: 'DEMANDE_SOUMISE',
        referenceId: demande.id,
        demandeId: demande.id,
        blockNumber: String(Math.floor(Math.random() * 500000) + 100000),
        metadata: { reference: demande.reference, type: demande.type, citoyenId },
      },
    });

    // AUTOMATION: Génération immédiate de la carte
    try {
      await carteService.generateForCitoyen(citoyenId, demande.id);
      
      // Mise à jour de la demande en DELIVREE
      const updatedDemande = await demandeRepository.update(demande.id, {
        statut: 'DELIVREE',
        progression: 100,
        dateTraitement: new Date()
      });
      
      return updatedDemande;
    } catch (error) {
      console.error(`❌ Erreur lors de la génération automatique de la carte :`, error);
      return demande;
    }
  }

  async createFromUser(userId: string, data: { type: string; extraitNaissanceUrl?: string; extraitNaissanceId?: string; signatureUrl?: string }) {
    const citoyen = await prisma.citoyen.findUnique({ where: { userId } });
    if (!citoyen) throw new Error('Complétez votre profil avant de soumettre une demande');
    return this.create(citoyen.id, data);
  }

  async updateStatut(id: string, statut: string, progression: number, motifRejet?: string) {
    const demande = await demandeRepository.update(id, {
      statut,
      progression,
      motifRejet,
      ...(statut === 'DELIVREE' || statut === 'REJETEE' ? { dateTraitement: new Date() } : {}),
    });

    // Si on passe en PRODUCTION, on génère la carte physiquement
    if (statut === 'PRODUCTION') {
      try {
        await carteService.generateForCitoyen(demande.citoyenId, demande.id);
        console.log(`✅ Carte générée pour la demande ${demande.reference}`);
      } catch (error) {
        console.error(`❌ Erreur lors de la génération de la carte :`, error);
        // On pourrait ici repasser le statut en erreur ou logger plus finement
      }
    }

    return demande;
  }

  async getStats() {
    const [total, soumises, enVerification, enProduction, delivrees, rejetees] = await Promise.all([
      demandeRepository.count(),
      demandeRepository.count({ statut: 'SOUMISE' }),
      demandeRepository.count({ statut: 'VERIFICATION' }),
      demandeRepository.count({ statut: 'PRODUCTION' }),
      demandeRepository.count({ statut: 'DELIVREE' }),
      demandeRepository.count({ statut: 'REJETEE' }),
    ]);

    const tauxDelivrance = total > 0 ? Math.round((delivrees / total) * 100) : 0;
    const enAttente = soumises + enVerification + enProduction;
    const fraudes = rejetees; // Simulation: les rejets sont considérés comme des fraudes détectées

    return { 
      total, 
      soumises, 
      enVerification, 
      enProduction, 
      delivrees, 
      rejetees,
      tauxDelivrance,
      enAttente,
      fraudes
    };
  }
}

export default new DemandeService();
