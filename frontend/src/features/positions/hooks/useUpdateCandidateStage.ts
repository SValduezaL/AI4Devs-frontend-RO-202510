import { useState } from 'react';
import { updateStage } from '../../../infrastructure/services/candidateService';

interface UseUpdateCandidateStageResult {
  updateStage: (candidateId: number, applicationId: number, stepId: number) => Promise<void>;
  isUpdating: boolean;
  error: string | null;
}

export const useUpdateCandidateStage = (): UseUpdateCandidateStageResult => {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (
    candidateId: number,
    applicationId: number,
    stepId: number
  ): Promise<void> => {
    setIsUpdating(true);
    setError(null);

    try {
      await updateStage(candidateId, applicationId, stepId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar la etapa';
      setError(errorMessage);
      throw err; // Re-lanzar para que el componente pueda manejar el rollback
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateStage: handleUpdate,
    isUpdating,
    error,
  };
};
