import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // DEMO-SAFE FALLBACK: Prevent app from crashing on network or server errors during presentation
    if (!error.response || error.response.status >= 500) {
      console.warn("DEMO MODE: Network or Server Error. Intercepting to prevent crash.", error);
      // Return a safe mock response structure
      return Promise.resolve({
        data: {
          data: [],
          meta: { current_page: 1, last_page: 1, total: 0 },
          message: "Demo Fallback Data"
        }
      });
    }

    return Promise.reject(error);
  }
);

export default api;
