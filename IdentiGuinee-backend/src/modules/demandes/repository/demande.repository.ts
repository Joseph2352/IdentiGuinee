import prisma from '../../../common/config/prisma.js';

class DemandeRepository {
  async findAll(page = 1, limit = 20, filters?: { statut?: string; citoyenId?: string }) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters?.statut) where.statut = filters.statut;
    if (filters?.citoyenId) where.citoyenId = filters.citoyenId;

    const [demandes, total] = await Promise.all([
      prisma.demande.findMany({
        skip, take: limit, where,
        include: { 
          citoyen: { 
            include: { 
              region: true,
              prefecture: true,
              sousPrefecture: true,
              user: { select: { email: true, telephone: true } }
            } 
          }, 
          carte: true 
        },
        orderBy: { dateSoumission: 'desc' },
      }),
      prisma.demande.count({ where }),
    ]);
    return { demandes, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    return prisma.demande.findUnique({
      where: { id },
      include: { 
        citoyen: { 
          include: { 
            region: true, 
            prefecture: true,
            sousPrefecture: true,
            user: { select: { email: true, telephone: true } }
          } 
        }, 
        carte: true, 
        transactions: true 
      },
    });
  }

  async findByCitoyenId(citoyenId: string) {
    return prisma.demande.findMany({
      where: { citoyenId },
      include: { carte: true },
      orderBy: { dateSoumission: 'desc' },
    });
  }

  async create(data: any) {
    return prisma.demande.create({ data });
  }

  async update(id: string, data: any) {
    return prisma.demande.update({ where: { id }, data });
  }

  async count(filters?: { statut?: string }) {
    const where: any = {};
    if (filters?.statut) where.statut = filters.statut;
    return prisma.demande.count({ where });
  }
}

export default new DemandeRepository();
