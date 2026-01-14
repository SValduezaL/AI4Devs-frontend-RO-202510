# Architecture Overview

## Visión general

El sistema LTI sigue una **arquitectura en capas** con separación clara entre frontend y backend. El backend implementa principios de **Domain-Driven Design (DDD)** con separación en capas de dominio, aplicación, infraestructura y presentación.

## Estilo arquitectónico

-   **Backend**: Monolito modular con capas DDD
-   **Frontend**: SPA (Single Page Application) con React
-   **Comunicación**: REST API (JSON over HTTP)
-   **Persistencia**: PostgreSQL con Prisma ORM

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
│         React Components                │
│  (UI, Forms, Dashboards)               │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Services Layer                  │
│  (API Calls, Data Fetching)            │
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

-   **Responsabilidad**: Acceso a datos, sistemas externos, archivos
-   **Nota**: Actualmente Prisma se usa en domain (debería estar aquí idealmente)
-   **Ubicación**: `backend/src/infrastructure/` (parcialmente implementado)

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

1. **Repository Pattern**: Abstraer Prisma detrás de interfaces
2. **Event Sourcing**: Para auditoría de cambios
3. **CQRS**: Separar comandos y consultas
4. **API Gateway**: Si se añaden más servicios
5. **Message Queue**: Para procesamiento asíncrono (emails, notificaciones)

## Preguntas al humano

-   ¿Hay planes de migrar a microservicios?
-   ¿Se considera añadir GraphQL además de REST?
-   ¿Hay requisitos de auditoría que requieran Event Sourcing?
-   ¿Se planea añadir cache (Redis, etc.)?
