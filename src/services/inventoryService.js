import { api } from './apiClient';

export const inventoryService = {
  async getInventory(siteId = '1054') {
    const res = await api.get(`/sites/${siteId}/inventory`);
    return res.isFallback ? null : res.data;
  },

  async getShipments(siteId = '1054') {
    const res = await api.get(`/sites/${siteId}/shipments`);
    return res.isFallback ? null : res.data;
  },

  async placeAutoReplenish(replenishData) {
    const res = await api.post('/inventory/auto-replenish', replenishData);
    return res.isFallback ? null : res;
  },

  async batchReplenish(items) {
    const res = await api.post('/inventory/batch-replenish', { items });
    return res.isFallback ? null : res;
  },
};

