import axios from 'axios';
import { API_CONFIG } from '../../config/api';

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejo centralizado de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error para debugging
    console.error('API Error:', error.response?.data || error.message);
    
    // Re-lanzar error para que sea manejado por el código que llama
    return Promise.reject(error);
  }
);

export default apiClient;
