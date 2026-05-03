import axios from 'axios';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7068';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем токен к каждому запросу
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Обработка 401 Unauthorized (рефреш токена)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const { accessToken, refreshToken, logout, setAccessToken } = useAuthStore.getState();

      if (refreshToken) {
        try {
          // Вызываем напрямую axios, чтобы не зациклить интерцептор
          const res = await axios.post(`${API_URL}/api/auth/refresh`, {
            accessToken,
            refreshToken
          });
          
          if (res.data && res.data.accessToken) {
            setAccessToken(res.data.accessToken);
            // Повторяем упавший запрос с новым токеном
            originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // Если рефреш не удался (например, протух) - разлогиниваем
          logout();
        }
      } else {
        logout();
      }
    }
    return Promise.reject(error);
  }
);
