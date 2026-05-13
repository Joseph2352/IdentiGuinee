import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('--- DÉBUT DE LA SUPPRESSION DES DONNÉES ---');

  try {
    // Supprimer dans l'ordre pour respecter les contraintes d'intégrité (clés étrangères)
    console.log('Suppression des vérifications...');
    await prisma.verification.deleteMany();

    console.log('Suppression des transactions blockchain...');
    await prisma.blockchainTransaction.deleteMany();

    console.log('Suppression des demandes...');
    await prisma.demande.deleteMany();

    console.log('Suppression des cartes d\'identité...');
    await prisma.carteIdentite.deleteMany();

    console.log('Suppression des citoyens...');
    await prisma.citoyen.deleteMany();

    console.log('Suppression des utilisateurs...');
    // On peut garder l'admin si on veut, ou tout supprimer
    // Ici on supprime tout sauf l'admin principal si nécessaire
    await prisma.user.deleteMany({
      where: {
        NOT: {
          telephone: '+224000000000'
        }
      }
    });

    console.log('--- NETTOYAGE TERMINÉ AVEC SUCCÈS ---');
  } catch (error) {
    console.error('Erreur lors de la suppression :', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
