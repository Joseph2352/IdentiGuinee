import crypto from 'crypto';
import prisma from '../../../common/config/prisma.js';

class VerificationService {
  async verifierCarte(params: { numeroCarte?: string; nin?: string; ipAddress?: string; institution?: string }) {
    const { numeroCarte, nin, ipAddress, institution } = params;

    let carte;
    if (numeroCarte) {
      carte = await prisma.carteIdentite.findUnique({
        where: { numeroCarte: numeroCarte as string },
        select: {
          id: true,
          numeroCarte: true,
          statut: true,
          dateEmission: true,
          dateExpiration: true,
          blockchainHash: true,
          carteRectoUrl: true,
          carteVersoUrl: true,
          citoyen: { select: { nom: true, prenom: true, sexe: true, dateNaissance: true, photoUrl: true, nin: true } }
        }
      });
    } else if (nin) {
      const citoyen = await prisma.citoyen.findUnique({ where: { nin: nin as string } });
      if (citoyen) {
        carte = await prisma.carteIdentite.findFirst({
          where: { citoyenId: citoyen.id, statut: 'ACTIVE' },
          select: {
            id: true,
            numeroCarte: true,
            statut: true,
            dateEmission: true,
            dateExpiration: true,
            blockchainHash: true,
            carteRectoUrl: true,
            carteVersoUrl: true,
            citoyen: { select: { nom: true, prenom: true, sexe: true, dateNaissance: true, photoUrl: true, nin: true } }
          }
        });
      }
    }

    if (!carte) return null;

    // Log the verification
    await prisma.verification.create({
      data: {
        carteId: carte.id,
        institution: institution || 'Vérification publique',
        typeAcces: 'Recherche par ' + (numeroCarte ? 'numéro de carte' : 'NIN'),
        resultat: carte.statut === 'ACTIVE' ? 'VALIDE' : 'REVOQUEE',
        ipAddress: ipAddress || 'unknown',
      },
    });

    // Blockchain trace simulation
    const txHash = '0x' + crypto.createHash('sha256').update(carte.id + Date.now()).digest('hex');
    await prisma.blockchainTransaction.create({
      data: {
        txHash,
        type: 'VERIFICATION',
        referenceId: carte.id,
        carteId: carte.id,
        blockNumber: String(Math.floor(Math.random() * 500000) + 100000),
        metadata: { numeroCarte: carte.numeroCarte, resultat: carte.statut },
      },
    });

    return {
      success: true,
      resultat: carte.statut === 'ACTIVE' ? 'VALIDE' : carte.statut,
      data: {
        numeroCarte: carte.numeroCarte,
        statut: carte.statut,
        dateEmission: carte.dateEmission,
        dateExpiration: carte.dateExpiration,
        blockchainHash: carte.blockchainHash,
        blockchainTx: { txHash },
        carteRectoUrl: carte.carteRectoUrl,
        carteVersoUrl: carte.carteVersoUrl,
        citoyen: carte.citoyen,
      },
    };
  }

  async getHistorique(page = 1, limit = 30) {
    const skip = (page - 1) * limit;
    const [verifications, total] = await Promise.all([
      prisma.verification.findMany({
        skip, take: limit,
        include: { carte: { select: { numeroCarte: true, citoyen: { select: { nom: true, prenom: true } } } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.verification.count(),
    ]);

    return { verifications, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getDashboardStats() {
    const [total, valides, invalides, fraudes] = await Promise.all([
      prisma.verification.count(),
      prisma.verification.count({ where: { resultat: 'VALIDE' } }),
      prisma.verification.count({ where: { resultat: 'REVOQUEE' } }),
      prisma.verification.count({ where: { resultat: 'INVALIDE' } }),
    ]);

    const successPct = total > 0 ? ((valides / total) * 100).toFixed(1) : '100';

    return {
      total,
      valides,
      invalides,
      fraudes,
      successPct
    };
  }
}

export default new VerificationService();
