import React from 'react';
import { Container, Alert } from 'react-bootstrap';
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { InterviewStep, Candidate } from '../../../domain/types/position.types';
import KanbanColumn from './KanbanColumn';
import LoadingSkeleton from './LoadingSkeleton';

interface PositionKanbanProps {
  steps: InterviewStep[];
  candidatesByStep: Map<number, Candidate[]>;
  isLoading?: boolean;
  error?: string | null;
  onMoveCandidate?: (candidateId: number, newStepId: number) => void;
  isUpdating?: boolean;
}

const PositionKanban: React.FC<PositionKanbanProps> = ({
  steps,
  candidatesByStep,
  isLoading = false,
  error = null,
  onMoveCandidate,
  isUpdating = false,
}) => {
  // Configurar sensores para mouse y teclado
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !onMoveCandidate || isUpdating) {
      return;
    }

    const candidateId = parseInt(active.id as string, 10);
    const newStepId = parseInt(over.id as string, 10);

    if (!isNaN(candidateId) && !isNaN(newStepId)) {
      onMoveCandidate(candidateId, newStepId);
    }
  };
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <Alert.Heading>Error al cargar los datos</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  if (steps.length === 0) {
    return (
      <Container className="mt-4">
        <Alert variant="info">
          No hay etapas de entrevista configuradas para esta posición.
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
        <div
          className="kanban-container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
          }}
        >
          {steps.map((step) => {
            const candidates = candidatesByStep.get(step.id) || [];
            return (
              <KanbanColumn key={step.id} step={step} candidates={candidates} isUpdating={isUpdating} />
            );
          })}
        </div>
      </DndContext>
      <style>{`
        @media (max-width: 767px) {
          .kanban-container {
            display: flex !important;
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </Container>
  );
};

export default PositionKanban;
