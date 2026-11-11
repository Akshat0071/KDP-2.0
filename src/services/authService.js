import { api } from './apiClient';

export const authService = {
  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    if (!res.isFallback) {
      if (res.token) localStorage.setItem('kdp_auth_token', res.token);
      return { success: true, user: res.user };
    }
    return null; // Signals to use local AuthContext fallback
  },

  async signup(userData) {
    const res = await api.post('/auth/signup', userData);
    if (!res.isFallback) {
      if (res.token) localStorage.setItem('kdp_auth_token', res.token);
      return { success: true, user: res.user };
    }
    return null;
  },

  async changePassword(currentPassword, newPassword) {
    const res = await api.post('/auth/change-password', { currentPassword, newPassword });
    if (!res.isFallback) {
      return { success: true };
    }
    return null;
  },

  async forgotPassword(email) {
    const res = await api.post('/auth/forgot-password', { email });
    if (!res.isFallback) {
      return { success: true };
    }
    return null;
  },

  logout() {
    localStorage.removeItem('kdp_auth_token');
    localStorage.removeItem('kdp_auth_user');
  },
};

