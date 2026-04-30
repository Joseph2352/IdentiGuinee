import api from '../lib/axios';

export const carteService = {
  /**
   * Récupère la liste de toutes les cartes (Admin)
   */
  getAll: async (page = 1, limit = 20) => {
    const response = await api.get('/cartes', { params: { page, limit } });
    return response.data;
  },

  /**
   * Récupère les détails d'une carte par son ID
   */
  getById: async (id: string) => {
    const response = await api.get(`/cartes/${id}`);
    return response.data;
  },

  /**
   * Récupère l'URL du PDF pour téléchargement
   */
  getPDFUrl: (id: string) => {
    return `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/cartes/${id}/pdf`;
  }
};
