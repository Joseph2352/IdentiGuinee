import api from '../lib/axios';

export interface GeoItem {
  id: string;
  nom: string;
  code?: string;
}

export const geoService = {
  getRegions: async () => {
    const response = await api.get('/geo/regions');
    return response.data;
  },

  getPrefectures: async (regionId?: string) => {
    const response = await api.get(`/geo/prefectures${regionId ? `?regionId=${regionId}` : ''}`);
    return response.data;
  },

  getSousPrefectures: async (prefectureId?: string) => {
    const response = await api.get(`/geo/sous-prefectures${prefectureId ? `?prefectureId=${prefectureId}` : ''}`);
    return response.data;
  }
};
