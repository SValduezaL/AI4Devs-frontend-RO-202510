import axios from "axios";
import { API_CONFIG } from "../config/api";

export const uploadCV = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await axios.post(
            API_CONFIG.ENDPOINTS.UPLOAD,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data; // Devuelve la ruta del archivo y el tipo
    } catch (error) {
        const errorMessage = error.response?.data 
            ? `Error al subir el archivo: ${JSON.stringify(error.response.data)}`
            : `Error al subir el archivo: ${error.message || 'Error desconocido'}`;
        throw new Error(errorMessage);
    }
};

export const sendCandidateData = async (candidateData) => {
    try {
        const response = await axios.post(
            API_CONFIG.ENDPOINTS.CANDIDATES,
            candidateData
        );
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data 
            ? `Error al enviar datos del candidato: ${JSON.stringify(error.response.data)}`
            : `Error al enviar datos del candidato: ${error.message || 'Error desconocido'}`;
        throw new Error(errorMessage);
    }
};
