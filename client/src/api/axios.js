import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    if (window.Clerk && window.Clerk.session) {
      const token = await window.Clerk.session.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
      // With Clerk, a 401 usually means token expired. Clerk handles token refresh,
      // but if it truly fails, we can redirect or let Clerk handle it.
      const isAuthEndpoint = error.config.url.includes('/auth');
      if (!isAuthEndpoint && window.Clerk) {
        window.Clerk.redirectToSignIn();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
