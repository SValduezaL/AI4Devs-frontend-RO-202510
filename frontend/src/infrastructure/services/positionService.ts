import apiClient from '../api/apiClient';
import { InterviewFlowResponse, CandidateResponse } from '../api/dto/position.dto';
import { PositionData, Candidate } from '../../domain/types/position.types';

/**
 * Obtiene el flujo de entrevistas de una posición
 */
export const fetchInterviewFlow = async (positionId: number): Promise<PositionData> => {
  try {
    const response = await apiClient.get<InterviewFlowResponse>(
      `/position/${positionId}/interviewflow`
    );
    
    // Extraer datos del wrapper
    const { positionName, interviewFlow } = response.data.interviewFlow;
    
    return {
      positionName,
      interviewFlow: {
        id: interviewFlow.id,
        description: interviewFlow.description,
        interviewSteps: interviewFlow.interviewSteps.map(step => ({
          id: step.id,
          name: step.name,
          orderIndex: step.orderIndex,
          interviewFlowId: step.interviewFlowId,
          interviewTypeId: step.interviewTypeId,
        })),
      },
    };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Error al cargar el flujo de entrevistas';
    throw new Error(errorMessage);
  }
};

/**
 * Obtiene los candidatos de una posición
 */
export const fetchCandidates = async (positionId: number): Promise<Candidate[]> => {
  try {
    const response = await apiClient.get<CandidateResponse[]>(
      `/position/${positionId}/candidates`
    );
    
    return response.data.map(candidate => ({
      id: candidate.id,
      applicationId: candidate.applicationId,
      fullName: candidate.fullName,
      currentInterviewStep: candidate.currentInterviewStep,
      averageScore: candidate.averageScore,
    }));
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Error al cargar los candidatos';
    throw new Error(errorMessage);
  }
};
