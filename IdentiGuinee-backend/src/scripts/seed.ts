import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const regionsData = [
  {
    nom: 'Conakry',
    code: 'C01',
    prefectures: ['Kaloum', 'Dixinn', 'Ratoma', 'Matam', 'Matoto', 'Kassa']
  },
  {
    nom: 'Boké',
    code: 'B02',
    prefectures: ['Boké', 'Boffa', 'Fria', 'Gaoual', 'Koundara']
  },
  {
    nom: 'Kindia',
    code: 'K03',
    prefectures: ['Kindia', 'Coyah', 'Dubréka', 'Forécariah', 'Télimélé']
  },
  {
    nom: 'Labé',
    code: 'L04',
    prefectures: ['Labé', 'Koubia', 'Lélouma', 'Mali', 'Tougué']
  },
  {
    nom: 'Mamou',
    code: 'M05',
    prefectures: ['Mamou', 'Dalaba', 'Pita']
  },
  {
    nom: 'Faranah',
    code: 'F06',
    prefectures: ['Faranah', 'Dabola', 'Dinguiraye', 'Kissidougou']
  },
  {
    nom: 'Kankan',
    code: 'K07',
    prefectures: ['Kankan', 'Kérouané', 'Kouroussa', 'Mandiana', 'Siguiri']
  },
  {
    nom: 'Nzérékoré',
    code: 'N08',
    prefectures: ['Nzérékoré', 'Beyla', 'Guéckédou', 'Lola', 'Macenta', 'Yomou']
  }
];

async function main() {
  console.log('🌱 Début du peuplement de la base de données...');

  for (const region of regionsData) {
    const createdRegion = await prisma.region.upsert({
      where: { nom: region.nom },
      update: {},
      create: {
        nom: region.nom,
        code: region.code
      }
    });

    console.log(`📍 Région créée: ${createdRegion.nom}`);

    for (const prefName of region.prefectures) {
      const createdPref = await prisma.prefecture.create({
        data: {
          nom: prefName,
          regionId: createdRegion.id
        }
      });

      // Ajout automatique d'une sous-préfecture du même nom par défaut
      await prisma.sousPrefecture.create({
        data: {
          nom: prefName,
          prefectureId: createdPref.id
        }
      });
    }
  }

  console.log('✅ Peuplement terminé avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
