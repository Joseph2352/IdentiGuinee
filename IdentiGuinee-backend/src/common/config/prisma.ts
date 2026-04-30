import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function testConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    console.log('✅ Connexion PostgreSQL établie (Prisma)');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    return false;
  }
}

export default prisma;
