import prisma from '../../../common/config/prisma.js';

class GeoService {
  async getRegions() {
    return prisma.region.findMany({
      include: { prefectures: { include: { sousPrefectures: true } } },
      orderBy: { nom: 'asc' },
    });
  }

  async getPrefectures(regionId?: string) {
    const where: any = {};
    if (regionId) where.regionId = regionId;
    return prisma.prefecture.findMany({
      where,
      include: { sousPrefectures: true, region: true },
      orderBy: { nom: 'asc' },
    });
  }

  async getSousPrefectures(prefectureId?: string) {
    const where: any = {};
    if (prefectureId) where.prefectureId = prefectureId;
    return prisma.sousPrefecture.findMany({
      where,
      include: { prefecture: true },
      orderBy: { nom: 'asc' },
    });
  }
}

export default new GeoService();
