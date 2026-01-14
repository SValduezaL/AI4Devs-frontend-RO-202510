import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Alert } from 'react-bootstrap';
import PositionHeader from '../components/PositionHeader';
import PositionKanban from '../components/PositionKanban';
import { usePositionData } from '../hooks/usePositionData';
import { useUpdateCandidateStage } from '../hooks/useUpdateCandidateStage';
import { Candidate } from '../../../domain/types/position.types';

const PositionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { steps, candidatesByStep: initialCandidatesByStep, positionName, isLoading, error } = usePositionData(id);
  const { updateStage, isUpdating } = useUpdateCandidateStage();
  
  // Estado local para optimistic updates
  const [candidatesByStep, setCandidatesByStep] = useState<Map<number, Candidate[]>>(initialCandidatesByStep);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Sincronizar cuando cambian los datos iniciales
  React.useEffect(() => {
    setCandidatesByStep(initialCandidatesByStep);
  }, [initialCandidatesByStep]);

  const handleBack = () => {
    navigate('/positions');
  };

  const handleMoveCandidate = useCallback(async (candidateId: number, newStepId: number) => {
    // Evitar múltiples actualizaciones simultáneas
    if (isUpdating) {
      return;
    }

    // Encontrar el candidato y su etapa actual
    let candidate: Candidate | undefined;
    let oldStepId: number | undefined;

    for (const [stepId, candidates] of Array.from(candidatesByStep.entries())) {
      const found = candidates.find((c: Candidate) => c.id === candidateId);
      if (found) {
        candidate = found;
        oldStepId = stepId;
        break;
      }
    }

    if (!candidate || oldStepId === undefined) {
      console.error('Candidato no encontrado');
      setUpdateError('Candidato no encontrado');
      return;
    }

    // Validar que la nueva etapa existe
    const stepExists = steps.some(step => step.id === newStepId);
    if (!stepExists) {
      console.error('Etapa no válida');
      setUpdateError('Etapa no válida');
      return;
    }

    // No hacer nada si ya está en la misma etapa
    if (oldStepId === newStepId) {
      return;
    }

    // Guardar estado anterior para rollback
    const previousState = new Map(candidatesByStep);

    // Optimistic update: actualizar UI inmediatamente
    const updated = new Map(candidatesByStep);
    
    // Remover de columna antigua
    const oldColumn = updated.get(oldStepId) || [];
    const filteredOld = oldColumn.filter(c => c.id !== candidateId);
    updated.set(oldStepId, filteredOld);
    
    // Añadir a columna nueva
    const newColumn = updated.get(newStepId) || [];
    updated.set(newStepId, [...newColumn, candidate]);
    
    setCandidatesByStep(updated);
    setUpdateError(null);

    try {
      // Llamar API
      await updateStage(candidate.id, candidate.applicationId, newStepId);
      // Si éxito, mantener optimistic update (ya está actualizado)
    } catch (err) {
      // Rollback en caso de error
      setCandidatesByStep(previousState);
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar la etapa';
      setUpdateError(errorMessage);
      console.error('Error updating candidate stage:', err);
    }
  }, [candidatesByStep, updateStage]);

  return (
    <Container className="mt-4">
      <PositionHeader
        positionName={positionName || 'Cargando...'}
        onBack={handleBack}
      />
      {updateError && (
        <Alert variant="danger" dismissible onClose={() => setUpdateError(null)} className="mb-3">
          {updateError}
        </Alert>
      )}
      <PositionKanban
        steps={steps}
        candidatesByStep={candidatesByStep}
        isLoading={isLoading}
        error={error}
        onMoveCandidate={handleMoveCandidate}
        isUpdating={isUpdating}
      />
    </Container>
  );
};

export default PositionPage;
