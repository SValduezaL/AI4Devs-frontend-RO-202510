import { useState, useEffect } from 'react';
import { fetchInterviewFlow, fetchCandidates } from '../../../infrastructure/services/positionService';
import { InterviewStep, Candidate } from '../../../domain/types/position.types';
import { createStepMap, sortSteps, groupCandidatesByStep } from '../utils/positionUtils';

interface UsePositionDataResult {
  steps: InterviewStep[];
  candidatesByStep: Map<number, Candidate[]>;
  positionName: string;
  isLoading: boolean;
  error: string | null;
}

export const usePositionData = (positionId: string | undefined): UsePositionDataResult => {
  const [steps, setSteps] = useState<InterviewStep[]>([]);
  const [candidatesByStep, setCandidatesByStep] = useState<Map<number, Candidate[]>>(new Map());
  const [positionName, setPositionName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!positionId) {
      setError('ID de posición no válido');
      setIsLoading(false);
      return;
    }

    const positionIdNumber = parseInt(positionId, 10);
    if (isNaN(positionIdNumber)) {
      setError('ID de posición no válido');
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Cargar datos en paralelo
        const [positionData, candidates] = await Promise.all([
          fetchInterviewFlow(positionIdNumber),
          fetchCandidates(positionIdNumber),
        ]);

        // Normalizar datos
        const sortedSteps = sortSteps(positionData.interviewFlow.interviewSteps);
        const stepMap = createStepMap(sortedSteps);
        const grouped = groupCandidatesByStep(candidates, stepMap);

        setSteps(sortedSteps);
        setCandidatesByStep(grouped);
        setPositionName(positionData.positionName);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar los datos';
        setError(errorMessage);
        console.error('Error loading position data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [positionId]);

  return {
    steps,
    candidatesByStep,
    positionName,
    isLoading,
    error,
  };
};
