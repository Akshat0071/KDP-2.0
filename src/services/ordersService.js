import { api } from './apiClient';

export const ordersService = {
  async getOrders(siteId = '1054') {
    const res = await api.get(`/sites/${siteId}/orders`);
    return res.isFallback ? null : res.data;
  },

  async getOrderDetails(orderId) {
    const res = await api.get(`/orders/${orderId}`);
    return res.isFallback ? null : res.data;
  },

  async confirmSourcing(orderId, sourcingData) {
    const res = await api.post(`/orders/${orderId}/confirm`, sourcingData);
    return res.isFallback ? null : res;
  },
};

