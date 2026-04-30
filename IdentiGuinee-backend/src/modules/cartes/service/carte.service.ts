import { v4 as uuidv4 } from 'uuid';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import carteRepository from '../repository/carte.repository.js';
import imageService from './image.service.js';
import blockchainService from '../../blockchain/service/blockchain.service.js';
import { MRZUtils } from '../../../common/utils/mrz.utils.js';
import prisma from '../../../common/config/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CarteService {
  /**
   * Génère une nouvelle carte pour un citoyen à partir d'une demande
   */
  async generateForCitoyen(citoyenId: string, demandeId: string) {
    const citoyen = await prisma.citoyen.findUnique({
      where: { id: citoyenId },
      include: { region: true, prefecture: true, sousPrefecture: true },
    });

    if (!citoyen) throw new Error('Citoyen non trouvé');

    // 1. Générer le NIN si absent
    const nin = citoyen.nin || this.generateNIN();
    if (!citoyen.nin) {
      await prisma.citoyen.update({ where: { id: citoyenId }, data: { nin } });
    }

    // 2. Générer les informations de la carte
    const numeroCarte = `GN${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;
    const dateEmission = new Date();
    const dateExpiration = new Date();
    dateExpiration.setFullYear(dateEmission.getFullYear() + 10);

    // 3. Générer le MRZ
    const mrz = MRZUtils.generateTD1({
      numeroCarte,
      nin,
      dateNaissance: citoyen.dateNaissance,
      sexe: citoyen.sexe,
      dateExpiration,
      nom: citoyen.nom,
      prenom: citoyen.prenom,
      nationalite: citoyen.nationalite,
    });

    // 4. Générer le hash des données pour la blockchain
    const dataHash = blockchainService.generateDataHash({
      numeroCarte,
      nin,
      nom: citoyen.nom,
      prenom: citoyen.prenom,
      dateNaissance: citoyen.dateNaissance,
      lieuNaissance: citoyen.lieuNaissance,
      dateExpiration
    });

    // 5. Générer le contenu du QR Code (JSON contenant le numeroCarte et informations de base pour scan hors-ligne)
    const qrDataObj = {
      numeroCarte,
      nin,
      nom: citoyen.nom,
      prenom: citoyen.prenom,
      expires: dateExpiration.toISOString().split('T')[0],
      v: "1.1"
    };
    const qrDataString = JSON.stringify(qrDataObj);

    // 5. Créer l'enregistrement de la carte
    const carte = await carteRepository.create({
      citoyenId: citoyen.id,
      numeroCarte,
      dateEmission,
      dateExpiration,
      mrzLigne1: mrz[0],
      mrzLigne2: mrz[1],
      mrzLigne3: mrz[2],
      qrCodeData: qrDataString,
      blockchainHash: dataHash, // Hash calculé (en attente d'ancrage)
      statut: 'ACTIVE',
      lieuDelivrance: 'CONAKRY',
    });

    // 7. Ancrer sur la blockchain de manière asynchrone (pour ne pas bloquer la réponse)
    // On pourrait aussi le faire de manière synchrone selon le besoin de fiabilité
    blockchainService.certifierCarte(
      numeroCarte,
      nin,
      dataHash,
      'CONAKRY',
      Math.floor(dateExpiration.getTime() / 1000)
    ).then(result => {
      console.log(`Carte ${numeroCarte} ancrée avec succès: ${result.txHash}`);
    }).catch(err => {
      console.error(`Échec de l'ancrage de la carte ${numeroCarte}:`, err);
    });

    // 6. Générer les images physiques
    const images = await imageService.generateCardImages({
      id: carte.id,
      nom: citoyen.nom,
      prenom: citoyen.prenom,
      sexe: citoyen.sexe,
      dateNaissance: citoyen.dateNaissance,
      lieuNaissance: citoyen.lieuNaissance,
      nationalite: citoyen.nationalite,
      taille: citoyen.taille || '1.70m',
      nin,
      numeroCarte,
      dateEmission,
      dateExpiration,
      region: citoyen.region?.nom || 'Conakry',
      prefecture: citoyen.prefecture?.nom || 'Matam',
      sousPrefecture: citoyen.sousPrefecture?.nom || 'Matam',
      quartier: citoyen.quartier || '',
      secteurVillage: citoyen.secteurVillage || '',
      photoUrl: citoyen.photoUrl || '',
      signatureUrl: citoyen.signatureUrl || '',
      mrz,
      qrData: qrDataString,
    });

    // 7. Mettre à jour la carte avec les URLs des images
    const updatedCarte = await carteRepository.update(carte.id, {
      carteRectoUrl: images.rectoUrl,
      carteVersoUrl: images.versoUrl,
    });

    // 8. Lier la carte à la demande
    await prisma.demande.update({
      where: { id: demandeId },
      data: { carteId: updatedCarte.id },
    });

    return updatedCarte;
  }

  /**
   * Génère un document PDF contenant le recto et le verso de la carte
   */
  async generateCardPDF(carteId: string): Promise<PDFKit.PDFDocument> {
    const carte = await carteRepository.findById(carteId);
    if (!carte) throw new Error('Carte non trouvée');

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    const uploadsPath = path.join(__dirname, '../../../../uploads');
    const rectoPath = carte.carteRectoUrl ? path.join(uploadsPath, '../', carte.carteRectoUrl.replace(/^\//, '')) : null;
    const versoPath = carte.carteVersoUrl ? path.join(uploadsPath, '../', carte.carteVersoUrl.replace(/^\//, '')) : null;

    // Titre du document
    doc.font('Helvetica-Bold').fontSize(20).fillColor('#0D1B2A').text('DOCUMENT D\'IDENTITÉ NUMÉRIQUE', { align: 'center' });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(10).fillColor('#666').text('RÉPUBLIQUE DE GUINÉE - SYSTÈME IDENTIGUINÉE', { align: 'center' });
    
    doc.moveDown(2);
    doc.strokeColor('#eee').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(2);

    // Section Recto
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#333').text('FACE RECTO', { underline: true });
    doc.moveDown(0.5);
    if (rectoPath && fs.existsSync(rectoPath)) {
      doc.image(rectoPath, { fit: [420, 265], align: 'center' });
    } else {
      doc.text('Image recto non disponible');
    }

    doc.moveDown(2); // Réduit pour éviter l'overflow

    // Section Verso
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#333').text('FACE VERSO', { underline: true });
    doc.moveDown(0.5);
    if (versoPath && fs.existsSync(versoPath)) {
      doc.image(versoPath, { fit: [420, 265], align: 'center' });
    } else {
      doc.text('Image verso non disponible');
    }

    // Footer avec informations de sécurité
    doc.fontSize(8).fillColor('#999').text(
      `Document généré le ${new Date().toLocaleString()} - ID Carte: ${carte.numeroCarte} - Certifié par Blockchain Hash: ${carte.blockchainHash || 'En attente'}`,
      50, 750, { align: 'center' }
    );

    doc.end();
    return doc;
  }

  private generateNIN(): string {
    // Format NIN guinéen : 1 chiffre (Sexe) + 2 chiffres (Année) + 8 chiffres aléatoires
    return `1${new Date().getFullYear().toString().slice(-2)}${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
  }
}

export default new CarteService();
