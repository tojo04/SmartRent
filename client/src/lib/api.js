// lib/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || '/api');

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
  /\/auth\/(login|register|refresh|logout|me)(\?|$)/.test(url);

// Single-flight refresh lock
let refreshInFlight = null;
const runRefreshOnce = async () => {
  if (!refreshInFlight) {
    refreshInFlight = api.post('/auth/refresh')
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

    // Never try to refresh if the failing call itself is an auth endpoint
    if (status === 401 && !original._retry && !isAuthEndpoint(original.url)) {
      original._retry = true;
      try {
        const newToken = await runRefreshOnce();
        if (newToken) {
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original); // replay original request
        }
      } catch (_) {
        // fall through
      }
    }
    return Promise.reject(error);
  }
);

// ---- exported API ----
export const authAPI = {
  login:  (body) => api.post('/auth/login', body).then(r => r.data),
  register: (body) => api.post('/auth/register', body).then(r => r.data),
  logout: () => api.post('/auth/logout').then(r => r.data),
  me:     () => api.get('/auth/me').then(r => r.data),
  refresh: () => api.post('/auth/refresh').then(r => r.data), // safe now (interceptor skips it)
};

export default api;
