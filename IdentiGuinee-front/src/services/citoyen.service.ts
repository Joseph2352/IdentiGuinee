import api from '../lib/axios';

export const citoyenService = {
  getMyProfile: async () => {
    const response = await api.get('/citoyens/me');
    return response.data;
  },
  createProfile: async (formData: FormData) => {
    const response = await api.post('/citoyens/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  updateMyProfile: async (data: any) => {
    const isFormData = data instanceof FormData;
    const response = await api.patch('/citoyens/me', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return response.data;
  },
  getAll: async (page = 1, limit = 20) => {
    const response = await api.get('/citoyens', { params: { page, limit } });
    return response.data;
  },
};
