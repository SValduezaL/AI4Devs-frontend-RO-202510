// Tipos de dominio (sin dependencias de API)

export interface InterviewStep {
  id: number;
  name: string;
  orderIndex: number;
  interviewFlowId: number;
  interviewTypeId: number;
}

export interface Candidate {
  id: number;
  applicationId: number;
  fullName: string;
  currentInterviewStep: string; // Nombre de la etapa (desde API)
  averageScore: number;
}

export interface InterviewFlow {
  id: number;
  description?: string;
  interviewSteps: InterviewStep[];
}

export interface PositionData {
  positionName: string;
  interviewFlow: InterviewFlow;
}
