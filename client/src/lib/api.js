// lib/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.DEV
  ? '/api'
  : (import.meta.env.VITE_API_URL || '/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ---- token holder ----
let accessToken = null;
export const setAccessToken = (token) => {
  accessToken = token;
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
};

// ---- attach token on each request ----
api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// ---- helpers ----
const isAuthEndpoint = (url = '') =>
  /\/auth\/(login|login-admin|register|refresh|logout|me)(\?|$)/.test(url);

// Single-flight refresh lock
let refreshInFlight = null;
const runRefreshOnce = async () => {
  if (!refreshInFlight) {
    const persist = localStorage.getItem('sr_remember') === '1';
    refreshInFlight = api.post('/auth/refresh', { persist })
      .then(res => {
        const newToken = res.data?.accessToken || null;
        setAccessToken(newToken);
        return newToken;
      })
      .catch(err => {
        setAccessToken(null);
        throw err;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
};

// ---- response interceptor ----
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config || {};
    const status = error?.response?.status;

    // Don't try refresh if the failing call itself is an auth endpoint
    if (status === 401 && !original._retry && !isAuthEndpoint(original.url)) {
      original._retry = true;
      try {
        const newToken = await runRefreshOnce();
        if (newToken) {
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original); // replay original request
        }
      } catch {
        // fall through
      }
    }
    return Promise.reject(error);
  }
);

// ----------------------- AUTH -----------------------
export const authAPI = {
  login:       (body) => api.post('/auth/login', body).then(r => r.data),
  loginAdmin:  (body) => api.post('/auth/login-admin', body).then(r => r.data), // NEW
  register:    (body) => api.post('/auth/register', body).then(r => r.data),

  verifyEmail:            (body) => api.post('/auth/verify-email', body).then(r => r.data),
  resendOTP:              (body) => api.post('/auth/resend-otp', body).then(r => r.data),
  requestPasswordReset:   (body) => api.post('/auth/request-password-reset', body).then(r => r.data),
  resetPassword:          (body) => api.post('/auth/reset-password', body).then(r => r.data),

  me:        () => api.get('/auth/me').then(r => r.data),
  logout:    () => api.post('/auth/logout').then(r => r.data),
  refresh:   () => {
    const persist = localStorage.getItem('sr_remember') === '1';
    return api.post('/auth/refresh', { persist }).then(r => r.data);
  },
};

// --------------------- PRODUCTS ---------------------
export const productAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/products${qs ? `?${qs}` : ''}`).then(r => r.data);
  },
  get:     (id) => api.get(`/products/${id}`).then(r => r.data),
  create:  (body) => api.post('/products', body).then(r => r.data),            // admin
  update:  (id, body) => api.patch(`/products/${id}`, body).then(r => r.data), // admin
  remove:  (id) => api.delete(`/products/${id}`).then(r => r.data),            // admin
};

// ---------------------- ORDERS ----------------------
export const orderAPI = {
  // Customer/Admin create booking (PENDING)
  create: (body) => api.post('/orders', body).then(r => r.data),

  // Customer "My Rentals"
  my: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/orders/my${qs ? `?${qs}` : ''}`).then(r => r.data);
  },

  // Admin list ALL orders (requires backend GET /orders)
  adminList: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/orders${qs ? `?${qs}` : ''}`).then(r => r.data);
  },

  // Fetch one order (customer can see own; admin can see any)
  get: (id) => api.get(`/orders/${id}`).then(r => r.data),

  // Admin update status
  updateStatus: (id, status) =>
    api.patch(`/orders/${id}/status`, { status }).then(r => r.data),

  // Convenience helpers for UI buttons
  approve:  (id) => api.patch(`/orders/${id}/status`, { status: 'CONFIRMED' }).then(r => r.data),
  cancel:   (id) => api.patch(`/orders/${id}/status`, { status: 'CANCELLED' }).then(r => r.data),
};

export default api;
