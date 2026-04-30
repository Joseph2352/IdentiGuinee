import api from '../lib/axios';

export const demandeService = {
  getAll: async (page = 1, limit = 20, statut?: string) => {
    const response = await api.get('/demandes', { params: { page, limit, statut } });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/demandes/${id}`);
    return response.data;
  },
  getMyDemandes: async () => {
    const response = await api.get('/demandes/mes-demandes');
    return response.data;
  },
  create: async (formData: FormData) => {
    const response = await api.post('/demandes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  updateStatut: async (id: string, data: { statut: string; progression: number; motifRejet?: string }) => {
    const response = await api.patch(`/demandes/${id}/statut`, data);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/demandes/stats');
    return response.data;
  },
  getDocumentBlob: async (filename: string) => {
    const response = await api.get(`/demandes/document/${filename}`, {
      responseType: 'blob'
    });
    return response.data; // This will be the Blob object
  },
};
