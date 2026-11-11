/**
 * KDP GreenSource Enterprise API Client
 * Unified HTTP client configured for PostgreSQL Backend REST API
 * Automatically provides fallback when the database backend is not connected.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function apiRequest(endpoint, { method = 'GET', body, headers = {} } = {}) {
  // If no backend URL configured, immediately signal to use local state fallback
  if (!BASE_URL) {
    return { isFallback: true };
  }

  const token = localStorage.getItem('kdp_auth_token');
  const reqHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: reqHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn(`[KDP API] Endpoint ${endpoint} unreachable or errored, falling back to local dataset:`, err.message);
    return { isFallback: true, error: err.message };
  }
}

export const api = {
  get: (endpoint, headers) => apiRequest(endpoint, { method: 'GET', headers }),
  post: (endpoint, body, headers) => apiRequest(endpoint, { method: 'POST', body, headers }),
  put: (endpoint, body, headers) => apiRequest(endpoint, { method: 'PUT', body, headers }),
  delete: (endpoint, headers) => apiRequest(endpoint, { method: 'DELETE', headers }),
};

