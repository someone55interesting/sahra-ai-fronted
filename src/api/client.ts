import axios from 'axios';

// Адрес бэкенда на VPS
const API_URL = 'http://31.129.98.168:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Автоматически добавляем JWT токен к каждому запросу, если он есть
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
