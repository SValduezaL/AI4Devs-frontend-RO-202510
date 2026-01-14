import { InterviewStep, Candidate } from '../../../domain/types/position.types';
import { sortSteps, groupCandidatesByStep, createStepMap } from './positionUtils';

describe('positionUtils', () => {
  describe('createStepMap', () => {
    it('debe crear un mapa de nombre de step a ID', () => {
      const steps: InterviewStep[] = [
        { id: 1, name: 'Initial Screening', orderIndex: 0, interviewFlowId: 1, interviewTypeId: 1 },
        { id: 2, name: 'Technical Interview', orderIndex: 1, interviewFlowId: 1, interviewTypeId: 2 },
        { id: 3, name: 'Final Decision', orderIndex: 2, interviewFlowId: 1, interviewTypeId: 3 },
      ];

      const stepMap = createStepMap(steps);

      expect(stepMap.size).toBe(3);
      expect(stepMap.get('Initial Screening')).toBe(1);
      expect(stepMap.get('Technical Interview')).toBe(2);
      expect(stepMap.get('Final Decision')).toBe(3);
    });

    it('debe manejar un array vacío', () => {
      const steps: InterviewStep[] = [];
      const stepMap = createStepMap(steps);
      expect(stepMap.size).toBe(0);
    });

    it('debe sobrescribir si hay nombres duplicados (último gana)', () => {
      const steps: InterviewStep[] = [
        { id: 1, name: 'Duplicate', orderIndex: 0, interviewFlowId: 1, interviewTypeId: 1 },
        { id: 2, name: 'Duplicate', orderIndex: 1, interviewFlowId: 1, interviewTypeId: 2 },
      ];

      const stepMap = createStepMap(steps);
      expect(stepMap.size).toBe(1);
      expect(stepMap.get('Duplicate')).toBe(2); // Último gana
    });
  });

  describe('sortSteps', () => {
    it('debe ordenar steps por orderIndex ascendente', () => {
      const steps: InterviewStep[] = [
        { id: 3, name: 'Step C', orderIndex: 2, interviewFlowId: 1, interviewTypeId: 3 },
        { id: 1, name: 'Step A', orderIndex: 0, interviewFlowId: 1, interviewTypeId: 1 },
        { id: 2, name: 'Step B', orderIndex: 1, interviewFlowId: 1, interviewTypeId: 2 },
      ];

      const sorted = sortSteps(steps);

      expect(sorted[0].orderIndex).toBe(0);
      expect(sorted[1].orderIndex).toBe(1);
      expect(sorted[2].orderIndex).toBe(2);
    });

    it('debe usar ID como fallback cuando orderIndex es duplicado', () => {
      const steps: InterviewStep[] = [
        { id: 3, name: 'Step C', orderIndex: 1, interviewFlowId: 1, interviewTypeId: 3 },
        { id: 1, name: 'Step A', orderIndex: 1, interviewFlowId: 1, interviewTypeId: 1 },
        { id: 2, name: 'Step B', orderIndex: 0, interviewFlowId: 1, interviewTypeId: 2 },
      ];

      const sorted = sortSteps(steps);

      // Primero por orderIndex (0)
      expect(sorted[0].id).toBe(2);
      // Luego por ID cuando orderIndex es igual (1)
      expect(sorted[1].id).toBe(1);
      expect(sorted[2].id).toBe(3);
    });

    it('debe manejar un array vacío', () => {
      const steps: InterviewStep[] = [];
      const sorted = sortSteps(steps);
      expect(sorted).toEqual([]);
    });

    it('no debe mutar el array original', () => {
      const steps: InterviewStep[] = [
        { id: 2, name: 'Step B', orderIndex: 1, interviewFlowId: 1, interviewTypeId: 2 },
        { id: 1, name: 'Step A', orderIndex: 0, interviewFlowId: 1, interviewTypeId: 1 },
      ];

      const originalOrder = steps.map(s => s.id);
      sortSteps(steps);
      const afterSort = steps.map(s => s.id);

      expect(originalOrder).toEqual(afterSort);
    });
  });

  describe('groupCandidatesByStep', () => {
    it('debe agrupar candidatos por stepId correctamente', () => {
      const stepMap = new Map<string, number>([
        ['Initial Screening', 1],
        ['Technical Interview', 2],
        ['Final Decision', 3],
      ]);

      const candidates: Candidate[] = [
        { id: 1, applicationId: 1, fullName: 'John Doe', currentInterviewStep: 'Initial Screening', averageScore: 4.5 },
        { id: 2, applicationId: 2, fullName: 'Jane Smith', currentInterviewStep: 'Initial Screening', averageScore: 4.0 },
        { id: 3, applicationId: 3, fullName: 'Bob Johnson', currentInterviewStep: 'Technical Interview', averageScore: 5.0 },
        { id: 4, applicationId: 4, fullName: 'Alice Brown', currentInterviewStep: 'Final Decision', averageScore: 4.8 },
      ];

      const grouped = groupCandidatesByStep(candidates, stepMap);

      expect(grouped.size).toBe(3);
      expect(grouped.get(1)?.length).toBe(2);
      expect(grouped.get(2)?.length).toBe(1);
      expect(grouped.get(3)?.length).toBe(1);
      expect(grouped.get(1)?.map(c => c.id)).toEqual([1, 2]);
      expect(grouped.get(2)?.map(c => c.id)).toEqual([3]);
      expect(grouped.get(3)?.map(c => c.id)).toEqual([4]);
    });

    it('debe manejar candidatos sin etapa válida (edge case)', () => {
      const stepMap = new Map<string, number>([
        ['Initial Screening', 1],
      ]);

      const candidates: Candidate[] = [
        { id: 1, applicationId: 1, fullName: 'John Doe', currentInterviewStep: 'Initial Screening', averageScore: 4.5 },
        { id: 2, applicationId: 2, fullName: 'Jane Smith', currentInterviewStep: 'Unknown Step', averageScore: 4.0 },
      ];

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const grouped = groupCandidatesByStep(candidates, stepMap);

      expect(grouped.size).toBe(1);
      expect(grouped.get(1)?.length).toBe(1);
      expect(grouped.get(1)?.map(c => c.id)).toEqual([1]);
      expect(consoleSpy).toHaveBeenCalledWith('Step "Unknown Step" not found in flow');

      consoleSpy.mockRestore();
    });

    it('debe manejar un array vacío de candidatos', () => {
      const stepMap = new Map<string, number>([
        ['Initial Screening', 1],
      ]);

      const candidates: Candidate[] = [];
      const grouped = groupCandidatesByStep(candidates, stepMap);

      expect(grouped.size).toBe(0);
    });

    it('debe manejar un mapa vacío de steps', () => {
      const stepMap = new Map<string, number>();

      const candidates: Candidate[] = [
        { id: 1, applicationId: 1, fullName: 'John Doe', currentInterviewStep: 'Initial Screening', averageScore: 4.5 },
      ];

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const grouped = groupCandidatesByStep(candidates, stepMap);

      expect(grouped.size).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith('Step "Initial Screening" not found in flow');

      consoleSpy.mockRestore();
    });

    it('debe agrupar múltiples candidatos en la misma etapa', () => {
      const stepMap = new Map<string, number>([
        ['Initial Screening', 1],
      ]);

      const candidates: Candidate[] = [
        { id: 1, applicationId: 1, fullName: 'John Doe', currentInterviewStep: 'Initial Screening', averageScore: 4.5 },
        { id: 2, applicationId: 2, fullName: 'Jane Smith', currentInterviewStep: 'Initial Screening', averageScore: 4.0 },
        { id: 3, applicationId: 3, fullName: 'Bob Johnson', currentInterviewStep: 'Initial Screening', averageScore: 5.0 },
      ];

      const grouped = groupCandidatesByStep(candidates, stepMap);

      expect(grouped.get(1)?.length).toBe(3);
      expect(grouped.get(1)?.map(c => c.id)).toEqual([1, 2, 3]);
    });
  });
});
