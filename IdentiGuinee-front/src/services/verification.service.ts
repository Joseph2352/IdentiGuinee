import api from '../lib/axios';

export const verificationService = {
  verifierCarte: async (params: { numeroCarte?: string; nin?: string; institution?: string }) => {
    const response = await api.get('/verifications/verifier', { params });
    return response.data;
  },
  getHistorique: async (page = 1, limit = 30) => {
    const response = await api.get('/verifications/historique', { params: { page, limit } });
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/verifications/stats');
    return response.data;
  },
  verifierTransactionHash: async (hash: string) => {
    const response = await api.get(`/blockchain/tx/${hash}`);
    return response.data;
  }
};
