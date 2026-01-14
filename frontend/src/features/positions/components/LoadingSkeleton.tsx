import React from 'react';
import { Card, Container } from 'react-bootstrap';

const LoadingSkeleton: React.FC = () => {
  return (
    <Container className="mt-4">
      <div className="d-flex gap-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} style={{ width: '250px', minHeight: '400px' }}>
            <Card.Header>
              <div className="placeholder-glow">
                <span className="placeholder col-8"></span>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="placeholder-glow">
                <span className="placeholder col-12 mb-2"></span>
                <span className="placeholder col-10 mb-2"></span>
                <span className="placeholder col-11"></span>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>
    </Container>
  );
};

export default LoadingSkeleton;
