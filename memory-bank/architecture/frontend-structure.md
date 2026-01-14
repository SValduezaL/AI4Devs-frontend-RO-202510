# Estructura Frontend - Página Position

## Estructura de Carpetas Implementada

```
frontend/src/
├── features/                    # Features organizadas por dominio
│   └── positions/
│       ├── components/          # Componentes específicos del feature
│       │   ├── CandidateCard.tsx          # Tarjeta draggable
│       │   ├── KanbanColumn.tsx           # Columna droppable
│       │   ├── LoadingSkeleton.tsx         # Skeleton loader
│       │   ├── PositionHeader.tsx         # Header con botón volver
│       │   └── PositionKanban.tsx         # Container del Kanban
│       ├── hooks/              # Hooks del feature
│       │   ├── usePositionData.ts         # Carga y normalización
│       │   └── useUpdateCandidateStage.ts # Actualización de etapa
│       ├── pages/              # Páginas del feature
│       │   └── PositionPage.tsx           # Página principal
│       └── utils/              # Utilidades del feature
│           └── positionUtils.ts           # Normalización, agrupación
│
├── domain/                     # Tipos y lógica de dominio compartida
│   └── types/
│       └── position.types.ts   # Tipos de dominio (sin dependencias API)
│
├── infrastructure/             # Acceso a datos y servicios externos
│   ├── api/
│   │   ├── apiClient.ts        # Cliente HTTP centralizado (axios)
│   │   └── dto/
│   │       └── position.dto.ts # DTOs exactos de la API
│   └── services/
│       ├── candidateService.ts # Servicio de candidatos (extendido)
│       └── positionService.ts  # Servicio de posiciones
│
├── components/                 # Componentes legacy (a migrar)
│   ├── Positions.tsx          # Lista de posiciones (modificado)
│   └── ...
│
└── config/
    └── api.ts                 # Configuración de endpoints
```

## Reglas de Importación

### ✅ Permitido

- `features/positions/` → `domain/`, `infrastructure/`, `ui/`
- `infrastructure/` → `domain/`
- `components/` (legacy) → `infrastructure/`, `domain/`

### ❌ Prohibido

- `domain/` → `infrastructure/` o `features/` o `ui/`
- `infrastructure/` → `features/` o `ui/`
- `ui/` → `features/` o `infrastructure/` (excepto hooks)

## Componentes y Responsabilidades

### PositionPage (Container)
- **Ubicación**: `features/positions/pages/PositionPage.tsx`
- **Responsabilidades**:
  - Obtener `positionId` de URL params
  - Orquestar carga de datos
  - Gestionar optimistic updates
  - Manejar errores de actualización

### PositionKanban (Container)
- **Ubicación**: `features/positions/components/PositionKanban.tsx`
- **Responsabilidades**:
  - Configurar `DndContext`
  - Renderizar columnas
  - Manejar `handleDragEnd`
  - Estados: loading, error, empty

### KanbanColumn (Presentational)
- **Ubicación**: `features/positions/components/KanbanColumn.tsx`
- **Responsabilidades**:
  - Renderizar columna con `useDroppable`
  - Mostrar candidatos o empty state
  - Feedback visual al hacer hover

### CandidateCard (Presentational)
- **Ubicación**: `features/positions/components/CandidateCard.tsx`
- **Responsabilidades**:
  - Renderizar tarjeta con `useDraggable`
  - Mostrar nombre y puntuación
  - Feedback visual al arrastrar

## Hooks Custom

### usePositionData
- **Ubicación**: `features/positions/hooks/usePositionData.ts`
- **Responsabilidades**:
  - Cargar `interviewFlow` y `candidates` en paralelo
  - Normalizar datos (mapeo string→id, agrupación)
  - Manejar estados loading/error
- **Retorna**: `{ steps, candidatesByStep, positionName, isLoading, error }`

### useUpdateCandidateStage
- **Ubicación**: `features/positions/hooks/useUpdateCandidateStage.ts`
- **Responsabilidades**:
  - Llamar API para actualizar etapa
  - Gestionar estado `isUpdating`
  - Manejar errores
- **Retorna**: `{ updateStage, isUpdating, error }`

## Servicios API

### positionService
- **Ubicación**: `infrastructure/services/positionService.ts`
- **Métodos**:
  - `fetchInterviewFlow(positionId)` → `PositionData`
  - `fetchCandidates(positionId)` → `Candidate[]`

### candidateService
- **Ubicación**: `infrastructure/services/candidateService.ts`
- **Métodos**:
  - `updateStage(candidateId, applicationId, stepId)` → Actualiza etapa

### apiClient
- **Ubicación**: `infrastructure/api/apiClient.ts`
- **Responsabilidades**:
  - Cliente axios centralizado
  - Interceptores de errores
  - Configuración base URL

## Utilidades

### positionUtils
- **Ubicación**: `features/positions/utils/positionUtils.ts`
- **Funciones**:
  - `createStepMap(steps)` → `Map<string, number>` (stepName → stepId)
  - `sortSteps(steps)` → Steps ordenados por `orderIndex` (fallback por `id`)
  - `groupCandidatesByStep(candidates, stepMap)` → `Map<number, Candidate[]>` (agrupados por stepId)

## Tipos TypeScript

### Domain Types
- **Ubicación**: `domain/types/position.types.ts`
- **Tipos**: `InterviewStep`, `Candidate`, `InterviewFlow`, `PositionData`
- **Sin dependencias** de API o infraestructura

### DTOs
- **Ubicación**: `infrastructure/api/dto/position.dto.ts`
- **Tipos**: `InterviewFlowResponse`, `CandidateResponse`, `UpdateStageRequest`
- **Estructura exacta** de la API

## Dependencias Añadidas

- `@dnd-kit/core` (^6.3.1) - Librería drag & drop
- `@dnd-kit/sortable` (^10.0.0) - Extensión sortable
- `axios` - Cliente HTTP (añadido para apiClient centralizado)

## Patrones Implementados

1. **Container/Presenter**: PositionPage (container) → PositionKanban (container) → KanbanColumn/CandidateCard (presentational)
2. **Custom Hooks**: Lógica reutilizable extraída a hooks
3. **Optimistic UI**: Actualización inmediata con rollback
4. **Normalización**: Transformación DTO → Domain
5. **Separación de capas**: UI/Features/Domain/Infrastructure
