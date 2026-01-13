// Configuración de la API
// Las variables de entorno en React deben comenzar con REACT_APP_
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3010';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    CANDIDATES: `${API_BASE_URL}/candidates`,
    UPLOAD: `${API_BASE_URL}/upload`,
    POSITION: `${API_BASE_URL}/position`,
  },
};

export default API_CONFIG;
