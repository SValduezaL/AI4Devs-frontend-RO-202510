// DTOs exactos de la API

export interface InterviewStepDTO {
  id: number;
  interviewFlowId: number;
  interviewTypeId: number;
  name: string;
  orderIndex: number;
}

export interface InterviewFlowDTO {
  id: number;
  description?: string;
  interviewSteps: InterviewStepDTO[];
}

export interface InterviewFlowResponse {
  interviewFlow: {
    positionName: string;
    interviewFlow: InterviewFlowDTO;
  };
}

export interface CandidateResponse {
  fullName: string;
  currentInterviewStep: string; // String, no ID
  averageScore: number;
  id: number;
  applicationId: number;
}

export interface UpdateStageRequest {
  applicationId: number;
  currentInterviewStep: number; // Backend espera número (ID del step)
}
