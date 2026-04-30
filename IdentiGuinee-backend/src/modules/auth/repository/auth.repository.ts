import { Prisma } from '@prisma/client';
import prisma from '../../../common/config/prisma.js';

class AuthRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findByTelephone(telephone: string) {
    return prisma.user.findUnique({ where: { telephone } });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, telephone: true, role: true, isVerified: true, createdAt: true },
    });
  }

  async create(data: { 
    email?: string; 
    telephone: string; 
    passwordHash: string; 
    nom: string; 
    prenom: string;
    sexe: 'M' | 'F';
    dateNaissance: Date;
    lieuNaissance: string;
    nin?: string;
  }) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          telephone: data.telephone,
          passwordHash: data.passwordHash,
          role: 'CITOYEN',
        },
      });

      await tx.citoyen.create({
        data: {
          userId: user.id,
          nom: data.nom,
          prenom: data.prenom,
          sexe: data.sexe,
          dateNaissance: data.dateNaissance,
          lieuNaissance: data.lieuNaissance,
          nin: data.nin,
        },
      });

      return user;
    });
  }
}

export default new AuthRepository();
