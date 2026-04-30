import { PrismaClient } from '@prisma/client';
import imageService from '../modules/cartes/service/image.service.js';

const prisma = new PrismaClient();

async function fixQrCodes() {
  console.log('Début de la correction des QR codes...');
  
  // 1. Récupérer toutes les cartes actives (ou toutes)
  const cartes = await prisma.carteIdentite.findMany({
    include: {
      citoyen: {
        include: {
          region: true,
          prefecture: true,
          sousPrefecture: true
        }
      }
    }
  });

  console.log(`${cartes.length} cartes trouvées à corriger.`);

  let count = 0;

  for (const carte of cartes) {
    const citoyen = carte.citoyen;
    const numeroCarte = carte.numeroCarte;
    
    // Le nouveau QR Code JSON qui contiendra les infos de base
    const qrDataObj = {
      numeroCarte,
      nin: citoyen.nin || '',
      nom: citoyen.nom,
      prenom: citoyen.prenom,
      expires: carte.dateExpiration.toISOString().split('T')[0],
      v: "1.1"
    };
    const qrDataString = JSON.stringify(qrDataObj);
    
    console.log(`Correction de la carte: ${numeroCarte} (ID: ${carte.id})`);

    // Reconstruire les données MRZ qui ont été stockées
    const mrz = [carte.mrzLigne1, carte.mrzLigne2, carte.mrzLigne3].filter(Boolean) as string[];

    // 2. Régénérer l'image physique de la carte avec le nouveau QR Data
    try {
      await imageService.generateCardImages({
        id: carte.id,
        nom: citoyen.nom,
        prenom: citoyen.prenom,
        sexe: citoyen.sexe,
        dateNaissance: citoyen.dateNaissance,
        lieuNaissance: citoyen.lieuNaissance,
        nationalite: citoyen.nationalite,
        taille: citoyen.taille || '1.70m',
        nin: citoyen.nin || '',
        numeroCarte: numeroCarte,
        dateEmission: carte.dateEmission,
        dateExpiration: carte.dateExpiration,
        region: citoyen.region?.nom || 'Conakry',
        prefecture: citoyen.prefecture?.nom || 'Matam',
        sousPrefecture: citoyen.sousPrefecture?.nom || 'Matam',
        quartier: citoyen.quartier || '',
        secteurVillage: citoyen.secteurVillage || '',
        photoUrl: citoyen.photoUrl || '',
        signatureUrl: citoyen.signatureUrl || '',
        mrz,
        qrData: qrDataString, // LE NOUVEAU QR CODE
      });
      console.log(` -> Images régénérées avec succès pour ${numeroCarte}`);
    } catch (err) {
      console.error(` -> Erreur lors de la création d'image pour ${numeroCarte}:`, err);
    }

    // 3. Mettre à jour la base de données
    await prisma.carteIdentite.update({
      where: { id: carte.id },
      data: {
        qrCodeData: qrDataString
      }
    });
    
    count++;
  }

  console.log(`Terminé ! ${count} cartes ont été corrigées avec le nouveau format de QR Code.`);
  await prisma.$disconnect();
}

fixQrCodes().catch(e => {
  console.error("Erreur fatale:", e);
  prisma.$disconnect();
  process.exit(1);
});
