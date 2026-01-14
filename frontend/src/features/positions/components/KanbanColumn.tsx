import React from 'react';
import { Card } from 'react-bootstrap';
import { useDroppable } from '@dnd-kit/core';
import { InterviewStep, Candidate } from '../../../domain/types/position.types';
import CandidateCard from './CandidateCard';

interface KanbanColumnProps {
  step: InterviewStep;
  candidates: Candidate[];
  isUpdating?: boolean;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ step, candidates, isUpdating = false }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: step.id.toString(),
  });

  return (
    <Card 
      className="h-100 kanban-column" 
      style={{ 
        minWidth: '250px', 
        maxWidth: '300px',
        border: isOver ? '2px solid #0d6efd' : undefined,
        backgroundColor: isOver ? '#f0f8ff' : undefined,
      }}
    >
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">{step.name}</h5>
        <small className="text-white-50">
          {candidates.length} candidato{candidates.length !== 1 ? 's' : ''}
        </small>
      </Card.Header>
      <Card.Body 
        ref={setNodeRef}
        className="p-3" 
        style={{ minHeight: '200px', maxHeight: '600px', overflowY: 'auto' }}
        role="region"
        aria-label={`Columna: ${step.name}. ${candidates.length} candidato${candidates.length !== 1 ? 's' : ''}`}
        aria-describedby={`step-${step.id}-description`}
      >
        <div id={`step-${step.id}-description`} className="visually-hidden">
          Zona donde puedes soltar candidatos para moverlos a la etapa {step.name}
        </div>
        {candidates.length === 0 ? (
          <div className="text-center text-muted py-4">
            <small>No hay candidatos en esta etapa</small>
          </div>
        ) : (
          candidates.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} isDisabled={isUpdating} />
          ))
        )}
      </Card.Body>
      <style>{`
        @media (max-width: 767px) {
          .kanban-column {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 100% !important;
          }
        }
      `}</style>
    </Card>
  );
};

export default KanbanColumn;
