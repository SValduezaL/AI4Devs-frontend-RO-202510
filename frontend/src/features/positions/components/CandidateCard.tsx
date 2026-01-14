import React from 'react';
import { Card } from 'react-bootstrap';
import { useDraggable } from '@dnd-kit/core';
import { Candidate } from '../../../domain/types/position.types';

interface CandidateCardProps {
  candidate: Candidate;
  isDisabled?: boolean;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, isDisabled = false }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: candidate.id.toString(),
    disabled: isDisabled,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : {
        opacity: isDragging ? 0.5 : 1,
      };

  return (
    <Card
      ref={setNodeRef}
      style={{ ...style, cursor: isDragging ? 'grabbing' : 'grab' }}
      className="mb-2 shadow-sm"
      {...listeners}
      {...attributes}
      aria-label={`Candidato ${candidate.fullName}, puntuación ${candidate.averageScore.toFixed(1)}. Arrastra para mover entre etapas.`}
      tabIndex={isDisabled ? -1 : 0}
    >
      <Card.Body className="p-3">
        <Card.Title className="h6 mb-2">{candidate.fullName}</Card.Title>
        <Card.Text className="mb-0">
          <small className="text-muted">
            Puntuación: <strong>{candidate.averageScore.toFixed(1)}</strong>
          </small>
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default CandidateCard;
