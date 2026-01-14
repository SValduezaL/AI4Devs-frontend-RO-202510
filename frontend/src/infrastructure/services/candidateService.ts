import apiClient from '../api/apiClient';
import { UpdateStageRequest } from '../api/dto/position.dto';

/**
 * Actualiza la etapa de entrevista de un candidato
 * @param candidateId ID del candidato
 * @param applicationId ID de la aplicación
 * @param stepId ID de la nueva etapa (InterviewStep)
 */
export const updateStage = async (
  candidateId: number,
  applicationId: number,
  stepId: number
): Promise<any> => {
  try {
    const requestBody: UpdateStageRequest = {
      applicationId,
      currentInterviewStep: stepId,
    };

    const response = await apiClient.put(
      `/candidates/${candidateId}`,
      requestBody
    );

    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar la etapa del candidato';
    throw new Error(errorMessage);
  }
};
