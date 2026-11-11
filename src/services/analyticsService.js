import { api } from './apiClient';

export const analyticsService = {
  async getAnalytics(period = 'oct-2026', siteId = '1054') {
    const res = await api.get(`/sites/${siteId}/analytics?period=${period}`);
    return res.isFallback ? null : res.data;
  },
};

