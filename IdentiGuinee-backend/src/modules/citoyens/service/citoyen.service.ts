import citoyenRepository from '../repository/citoyen.repository.js';

class CitoyenService {
  async getAll(page?: number, limit?: number) {
    return citoyenRepository.findAll(page, limit);
  }

  async getById(id: string) {
    const citoyen = await citoyenRepository.findById(id);
    if (!citoyen) throw new Error('Citoyen non trouvé');
    return citoyen;
  }

  async getByUserId(userId: string) {
    const citoyen = await citoyenRepository.findByUserId(userId);
    if (!citoyen) throw new Error('Profil citoyen non trouvé');
    return citoyen;
  }

  async createProfile(userId: string, data: any) {
    const existing = await citoyenRepository.findByUserId(userId);
    if (existing) throw new Error('Ce citoyen a déjà un profil');

    return citoyenRepository.create({
      userId,
      nom: data.nom,
      prenom: data.prenom,
      sexe: data.sexe,
      dateNaissance: new Date(data.dateNaissance),
      lieuNaissance: data.lieuNaissance,
      nationalite: data.nationalite || 'Guinéenne',
      taille: data.taille,
      regionId: data.regionId,
      prefectureId: data.prefectureId,
      sousPrefectureId: data.sousPrefectureId,
      quartier: data.quartier,
      secteurVillage: data.secteurVillage,
      photoUrl: data.photoUrl,
      signatureUrl: data.signatureUrl,
    });
  }

  async updateProfile(id: string, data: any) {
    return citoyenRepository.update(id, data);
  }
}

export default new CitoyenService();
