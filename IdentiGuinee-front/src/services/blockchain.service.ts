import api from '../lib/axios';

export const blockchainService = {
  getAll: async (page = 1, limit = 20) => {
    const response = await api.get('/blockchain', { params: { page, limit } });
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/blockchain/stats');
    return response.data;
  },
  getByHash: async (hash: string) => {
    const response = await api.get(`/blockchain/tx/${hash}`);
    return response.data;
  },
  verify: async (numeroCarte: string) => {
    const response = await api.get(`/blockchain/verify/${numeroCarte}`);
    return response.data;
  },
  getIntegrity: async (numeroCarte: string) => {
    const response = await api.get(`/blockchain/integrity/${numeroCarte}`);
    return response.data;
  }
};
