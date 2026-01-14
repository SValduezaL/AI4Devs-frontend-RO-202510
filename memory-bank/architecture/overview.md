# Architecture Overview

## Visión general

El sistema LTI sigue una **arquitectura en capas** con separación clara entre frontend y backend. El backend implementa principios de **Domain-Driven Design (DDD)** con separación en capas de dominio, aplicación, infraestructura y presentación.

## Estilo arquitectónico

-   **Backend**: Monolito modular con capas DDD (Domain-Driven Design)
-   **Frontend**: SPA (Single Page Application) con React, arquitectura en capas (UI/Features/Domain/Infrastructure)
-   **Comunicación**: REST API (JSON over HTTP)
-   **Persistencia**: PostgreSQL con Prisma ORM
-   **Drag & Drop**: @dnd-kit (moderna, accesible, compatible con React 18)

## Componentes principales

### Backend

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (Controllers, Routes, Middleware)      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│       Application Layer                 │
│  (Services, Validators, Use Cases)     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Domain Layer                    │
│  (Models, Business Logic, Entities)    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Infrastructure Layer               │
│  (Prisma Client, File System)         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         PostgreSQL Database            │
└─────────────────────────────────────────┘
```

### Frontend

```
┌─────────────────────────────────────────┐
│         UI Layer (Presentación)         │
│  (Components Presentacionales)          │
│  - PositionHeader                       │
│  - CandidateCard                        │
│  - LoadingSkeleton                      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Features Layer (Casos de Uso)      │
│  (Containers, Hooks, Lógica Feature)   │
│  - PositionPage                         │
│  - PositionKanban                       │
│  - usePositionData                      │
│  - useUpdateCandidateStage              │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Domain Layer (Tipos/Entidades)     │
│  (Tipos compartidos, Validadores)      │
│  - position.types.ts                    │
│  - positionUtils.ts                     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   Infrastructure Layer (Acceso Datos)  │
│  (API Client, Servicios, Adapters)     │
│  - apiClient.ts                         │
│  - positionService.ts                  │
│  - candidateService.ts                  │
│  - position.dto.ts                      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         HTTP REST API                   │
│  (Express Backend)                     │
└─────────────────────────────────────────┘
```

## Flujo de datos típico

### Crear candidato

```
1. Usuario completa formulario en React
   ↓
2. AddCandidateForm llama candidateService.addCandidate()
   ↓
3. HTTP POST /candidates
   ↓
4. candidateRoutes → candidateController.addCandidate()
   ↓
5. candidateService.addCandidate()
   ↓
6. validator.validateCandidateData()
   ↓
7. new Candidate(data) → candidate.save()
   ↓
8. Prisma Client → PostgreSQL
   ↓
9. Response JSON → Frontend
   ↓
10. UI actualizada
```

### Obtener candidato

```
1. Usuario navega a detalle de candidato
   ↓
2. HTTP GET /candidates/:id
   ↓
3. candidateRoutes → candidateController.getCandidateById()
   ↓
4. candidateService.findCandidateById()
   ↓
5. Candidate.findOne(id)
   ↓
6. Prisma Client (con includes) → PostgreSQL
   ↓
7. Response JSON con relaciones
   ↓
8. UI renderiza datos
```

### Ver detalle de posición con Kanban

```
1. Usuario navega a /positions/:id
   ↓
2. PositionPage se monta → usePositionData hook
   ↓
3. Carga en paralelo:
   - fetchInterviewFlow() → GET /position/:id/interviewflow
   - fetchCandidates() → GET /position/:id/candidates
   ↓
4. Normalización de datos:
   - createStepMap() → mapea stepName → stepId
   - sortSteps() → ordena por orderIndex
   - groupCandidatesByStep() → agrupa por stepId
   ↓
5. PositionKanban renderiza:
   - Columnas (una por InterviewStep)
   - Candidatos en cada columna
   ↓
6. Usuario hace drag & drop:
   - handleDragEnd() detecta movimiento
   - Optimistic update (UI inmediata)
   - updateStage() → PUT /candidates/:id
   ↓
7. Backend actualiza:
   - candidateService.updateCandidateStage()
   - Actualiza Application.currentInterviewStep
   ↓
8. Si éxito: mantener optimistic
   Si error: rollback automático
```

## Separación de responsabilidades

### Presentation Layer

-   **Responsabilidad**: Manejo de HTTP (requests, responses, status codes)
-   **No debe**: Contener lógica de negocio
-   **Ubicación**: `backend/src/presentation/`

### Application Layer

-   **Responsabilidad**: Orquestación de casos de uso, validación, coordinación entre modelos
-   **No debe**: Acceder directamente a HTTP o base de datos
-   **Ubicación**: `backend/src/application/`

### Domain Layer

-   **Responsabilidad**: Lógica de negocio, reglas del dominio, entidades
-   **No debe**: Depender de frameworks o infraestructura
-   **Ubicación**: `backend/src/domain/`

### Infrastructure Layer

-   **Backend**: Acceso a datos, sistemas externos, archivos
    - **Nota**: Actualmente Prisma se usa en domain (debería estar aquí idealmente)
    - **Ubicación**: `backend/src/infrastructure/` (parcialmente implementado)
-   **Frontend**: Cliente API, servicios, adapters DTO ↔ Domain
    - **Ubicación**: `frontend/src/infrastructure/`
    - **Componentes**: `apiClient.ts`, `positionService.ts`, `candidateService.ts`, `dto/`

## Decisiones arquitectónicas

### DDD (Domain-Driven Design)

**Decisión**: Usar arquitectura DDD con capas separadas

**Razón**:

-   Separación clara de responsabilidades
-   Lógica de negocio centralizada en modelos de dominio
-   Facilita testing y mantenimiento

**Trade-offs**:

-   ✅ Más estructura y organización
-   ✅ Fácil de testear
-   ❌ Más archivos y capas
-   ❌ Curva de aprendizaje

### Prisma en Domain Layer

**Decisión actual**: Prisma Client usado directamente en modelos de dominio

**Ideal**: Prisma debería estar en Infrastructure Layer

**Razón actual**: Simplicidad y rapidez de desarrollo

**Riesgo**: Acoplamiento entre dominio e infraestructura

### Monolito vs Microservicios

**Decisión**: Monolito modular

**Razón**:

-   Proyecto de tamaño medio
-   No requiere escalado independiente de componentes
-   Menor complejidad operacional

**Cuándo considerar microservicios**: Si se necesita escalar componentes específicos o equipos grandes

## Extensiones futuras

### Posibles mejoras arquitectónicas

1. **Repository Pattern**: Abstraer Prisma detrás de interfaces (backend)
2. **Event Sourcing**: Para auditoría de cambios
3. **CQRS**: Separar comandos y consultas
4. **API Gateway**: Si se añaden más servicios
5. **Message Queue**: Para procesamiento asíncrono (emails, notificaciones)
6. **React Query/SWR**: Para mejor gestión de caché y revalidación en frontend
7. **State Management**: Redux/Zustand si se necesita estado global complejo
8. **Virtualización**: react-window para listas grandes de candidatos

## Preguntas al humano

-   ¿Hay planes de migrar a microservicios?
-   ¿Se considera añadir GraphQL además de REST?
-   ¿Hay requisitos de auditoría que requieran Event Sourcing?
-   ¿Se planea añadir cache (Redis, etc.)?
