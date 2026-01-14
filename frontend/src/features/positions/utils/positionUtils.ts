import { InterviewStep, Candidate } from '../../../domain/types/position.types';

/**
 * Crea un mapa de nombre de step → ID de step
 */
export function createStepMap(steps: InterviewStep[]): Map<string, number> {
  const map = new Map<string, number>();
  steps.forEach(step => {
    map.set(step.name, step.id);
  });
  return map;
}

/**
 * Ordena los steps por orderIndex, luego por ID si hay duplicados
 */
export function sortSteps(steps: InterviewStep[]): InterviewStep[] {
  return [...steps].sort((a, b) => {
    // Primero por orderIndex
    if (a.orderIndex !== b.orderIndex) {
      return a.orderIndex - b.orderIndex;
    }
    // Fallback: ordenar por ID si orderIndex duplicado
    return a.id - b.id;
  });
}

/**
 * Agrupa candidatos por stepId usando el mapa de nombres
 */
export function groupCandidatesByStep(
  candidates: Candidate[],
  stepMap: Map<string, number>
): Map<number, Candidate[]> {
  const grouped = new Map<number, Candidate[]>();
  
  candidates.forEach(candidate => {
    const stepId = stepMap.get(candidate.currentInterviewStep);
    if (stepId !== undefined) {
      if (!grouped.has(stepId)) {
        grouped.set(stepId, []);
      }
      grouped.get(stepId)!.push(candidate);
    } else {
      // Candidato en etapa no encontrada (edge case)
      console.warn(`Step "${candidate.currentInterviewStep}" not found in flow`);
    }
  });
  
  return grouped;
}
