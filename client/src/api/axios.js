import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true,
});

let currentToken = null;
export const setToken = (token) => {
  currentToken = token;
};

api.interceptors.request.use(
  (config) => {
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Catch 401 Unauthorized errors and attempt to refresh
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
        const newToken = res.data?.data?.accessToken;
        if (newToken) {
          setToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        setToken(null);
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
