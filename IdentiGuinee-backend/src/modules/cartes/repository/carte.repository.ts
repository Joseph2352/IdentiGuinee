import prisma from '../../../common/config/prisma.js';

class CarteRepository {
  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [cartes, total] = await Promise.all([
      prisma.carteIdentite.findMany({
        skip, take: limit,
        include: { 
          citoyen: { 
            select: { 
              nom: true, 
              prenom: true, 
              nin: true, 
              sexe: true, 
              photoUrl: true 
            } 
          },
          transactions: true
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.carteIdentite.count(),
    ]);
    return { cartes, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    return prisma.carteIdentite.findUnique({
      where: { id },
      include: { citoyen: true, demandes: true, transactions: true },
    });
  }

  async findByNumero(numeroCarte: string) {
    return prisma.carteIdentite.findUnique({
      where: { numeroCarte },
      include: { citoyen: true },
    });
  }

  async create(data: any) {
    return prisma.carteIdentite.create({ data });
  }

  async update(id: string, data: any) {
    return prisma.carteIdentite.update({ where: { id }, data });
  }
}

export default new CarteRepository();
