import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Note: The request interceptor below is a FALLBACK.
// The primary token injection happens in useApi.js via Clerk's useAuth() hook.
// This interceptor covers direct api.get()/post() calls made outside of useApi.
api.interceptors.request.use(
  async (config) => {
    // Only add token if not already set by the useApi hook
    if (!config.headers.Authorization && window.Clerk && window.Clerk.session) {
      try {
        const token = await window.Clerk.session.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.warn('Failed to get Clerk token from interceptor:', e.message);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/auth');
      if (!isAuthEndpoint && window.Clerk) {
        window.Clerk.redirectToSignIn();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
