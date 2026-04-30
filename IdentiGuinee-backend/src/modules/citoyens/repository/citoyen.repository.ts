import prisma from '../../../common/config/prisma.js';

class CitoyenRepository {
  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [citoyens, total] = await Promise.all([
      prisma.citoyen.findMany({
        skip, take: limit,
        include: { region: true, prefecture: true, sousPrefecture: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.citoyen.count(),
    ]);
    return { citoyens, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    return prisma.citoyen.findUnique({
      where: { id },
      include: { region: true, prefecture: true, sousPrefecture: true, user: { select: { email: true, telephone: true, role: true } }, cartes: true, demandes: true },
    });
  }

  async findByUserId(userId: string) {
    return prisma.citoyen.findUnique({
      where: { userId },
      include: { region: true, prefecture: true, sousPrefecture: true, cartes: true, demandes: { orderBy: { dateSoumission: 'desc' } } },
    });
  }

  async findByNin(nin: string) {
    return prisma.citoyen.findUnique({ where: { nin } });
  }

  async create(data: any) {
    return prisma.citoyen.create({ data });
  }

  async update(id: string, data: any) {
    return prisma.citoyen.update({ where: { id }, data });
  }
}

export default new CitoyenRepository();
