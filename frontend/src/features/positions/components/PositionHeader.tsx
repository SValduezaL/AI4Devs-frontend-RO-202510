import React from 'react';
import { Button } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';

interface PositionHeaderProps {
  positionName: string;
  onBack: () => void;
}

const PositionHeader: React.FC<PositionHeaderProps> = ({ positionName, onBack }) => {
  return (
    <div className="d-flex align-items-center mb-4">
      <Button
        variant="link"
        onClick={onBack}
        className="p-0 me-3"
        aria-label="Volver a posiciones"
      >
        <ArrowLeft size={24} />
      </Button>
      <h2 className="mb-0">{positionName}</h2>
    </div>
  );
};

export default PositionHeader;
