# Testing

## Estado actual

### Backend

✅ **Tests implementados**

**Framework**: Jest 29.7.0 + ts-jest 29.1.2

**Archivos de test detectados**:

-   `backend/src/application/services/candidateService.test.ts`
-   `backend/src/application/services/positionService.test.ts`
-   `backend/src/presentation/controllers/candidateController.test.ts`
-   `backend/src/presentation/controllers/positionController.test.ts`

### Frontend

❌ **Tests no detectados**

React Testing Library está instalado pero no se encontraron archivos de test en `frontend/src/`.

## Ejecutar tests

### Backend

```bash
cd backend
npm test
```

**Configuración**: Probablemente en `jest.config.js` o `package.json` (no analizado en detalle)

### Frontend

```bash
cd frontend
npm test
```

**Estado**: No hay tests para ejecutar actualmente

## Estructura de tests

### Backend

**Ubicación**: Tests junto al código fuente (mismo directorio)

**Convención**: `*.test.ts`

**Ejemplo de estructura**:

```
backend/src/
├── application/
│   └── services/
│       ├── candidateService.ts
│       └── candidateService.test.ts
└── presentation/
    └── controllers/
        ├── candidateController.ts
        └── candidateController.test.ts
```

### Frontend

**Recomendado**: Crear tests junto a componentes o en carpeta `__tests__`

**Convención**: `*.test.js`, `*.test.tsx`, o `*.spec.js`

## Tipos de tests

### Unit Tests

**Backend**: ✅ Implementados

-   Tests de servicios
-   Tests de controladores

**Frontend**: ❌ No implementados

-   Tests de componentes
-   Tests de servicios

### Integration Tests

**Estado**: No detectados

**Recomendado**: Tests de endpoints completos (request → response)

### E2E Tests

**Estado**: No detectados

**Recomendado**: Cypress, Playwright, o similar para flujos completos

## Cobertura

**Estado**: Desconocido

**Recomendado**: Configurar Jest con `--coverage`:

```bash
cd backend
npm test -- --coverage
```

**Objetivo sugerido**: 80%+ para código crítico

## Mocks y stubs

### Backend

**Prisma**: Probablemente mockeado en tests (no analizado en detalle)

**Recomendado**: Mock de Prisma Client para tests aislados

### Frontend

**API calls**: Mockear servicios de API en tests de componentes

**Ejemplo sugerido**:

```javascript
// Mock de candidateService
jest.mock('../services/candidateService', () => ({
  addCandidate: jest.fn(() => Promise.resolve({ id: 1, ... }))
}));
```

## Testing best practices

### Backend

1. **Aislar tests**: Cada test debe ser independiente
2. **Mock external dependencies**: Prisma, file system, etc.
3. **Test edge cases**: Validaciones, errores, casos límite
4. **Test business logic**: Lógica en modelos de dominio
5. **Test error handling**: Manejo de errores en servicios y controladores

### Frontend

1. **Test user interactions**: Clicks, inputs, navegación
2. **Test rendering**: Componentes se renderizan correctamente
3. **Test state changes**: Estado se actualiza correctamente
4. **Test API integration**: Servicios llaman API correctamente
5. **Test error states**: Manejo de errores en UI

## Ejemplos de tests

### Backend (inferido)

```typescript
// candidateService.test.ts (ejemplo)
describe('CandidateService', () => {
  it('should create a candidate with valid data', async () => {
    // Arrange
    const candidateData = { ... };

    // Act
    const result = await addCandidate(candidateData);

    // Assert
    expect(result).toHaveProperty('id');
    expect(result.email).toBe(candidateData.email);
  });

  it('should throw error for duplicate email', async () => {
    // Test duplicate email
  });
});
```

### Frontend (sugerido)

```typescript
// AddCandidateForm.test.tsx (ejemplo)
import { render, screen, fireEvent } from "@testing-library/react";
import AddCandidateForm from "./AddCandidateForm";

describe("AddCandidateForm", () => {
    it("should render form fields", () => {
        render(<AddCandidateForm />);
        expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    });

    it("should submit form with valid data", async () => {
        // Test form submission
    });
});
```

## Test data

### Backend

**Seed data**: `backend/prisma/seed.ts` contiene datos de ejemplo

**Uso en tests**: Crear datos de test específicos o usar factories

### Frontend

**Mock data**: Crear datos de ejemplo para tests de componentes

## Continuous Integration

**Estado**: No detectado

**Recomendado**: Ejecutar tests en CI/CD pipeline antes de merge

**Ejemplo (GitHub Actions)**:

```yaml
- name: Run tests
  run: |
      cd backend && npm test
      cd ../frontend && npm test
```

## Debugging tests

### Backend

```bash
cd backend
npm test -- --verbose
npm test -- candidateService  # Ejecutar test específico
```

### Frontend

```bash
cd frontend
npm test -- --watch  # Modo watch
npm test -- AddCandidateForm  # Test específico
```

## Preguntas al humano

-   ¿Cuál es la cobertura de tests actual?
-   ¿Hay tests de integración o E2E planeados?
-   ¿Se requiere mantener cierta cobertura mínima?
-   ¿Hay herramientas de testing adicionales que se usan?
-   ¿Se ejecutan tests automáticamente en CI/CD?
