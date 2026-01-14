# Project Brief

## Qué es el producto

**LTI - Sistema de Seguimiento de Talento** es una aplicación full-stack para la gestión de procesos de reclutamiento y seguimiento de candidatos. Permite a los reclutadores gestionar candidatos, posiciones de trabajo, flujos de entrevistas y aplicaciones.

## Objetivo de negocio / Problema que resuelve

-   **Gestión centralizada de candidatos**: Almacenamiento y seguimiento de información completa de candidatos (datos personales, educación, experiencia laboral, CVs).
-   **Gestión de posiciones**: Creación y administración de ofertas de trabajo con flujos de entrevistas personalizados.
-   **Seguimiento de procesos**: Tracking del progreso de candidatos a través de diferentes etapas de entrevistas.
-   **Automatización de flujos**: Definición de flujos de entrevistas reutilizables por tipo de posición.

## Alcance dentro del repo

### Incluye:

-   Backend API REST (Express + TypeScript)
-   Frontend React (TypeScript/JavaScript)
-   Base de datos PostgreSQL con Prisma ORM
-   Sistema de subida de archivos (CVs en PDF/DOCX)
-   Modelos de dominio siguiendo DDD (Domain-Driven Design)
-   Tests unitarios en backend
-   Docker Compose para base de datos

### Excluye:

-   Sistema de autenticación/autorización (no detectado en código)
-   Sistema de notificaciones
-   Integraciones con sistemas externos (ATS, LinkedIn, etc.)
-   Dashboard analítico avanzado
-   Sistema de reportes

## Stakeholders / Tipos de usuarios

**Reclutadores** (usuarios principales detectados):

-   Añadir nuevos candidatos
-   Ver y gestionar posiciones
-   Seguir el progreso de candidatos en procesos de selección
-   Subir CVs de candidatos

**Candidatos**: No hay interfaz detectada para candidatos (solo backend API).

## Requisitos no funcionales detectados

### Seguridad

-   CORS configurado para orígenes específicos (`CORS_ORIGIN`)
-   Validación de tipos de archivo (solo PDF y DOCX)
-   Límite de tamaño de archivo: 10MB
-   Validación de datos de entrada (regex patterns, length constraints)

### Rendimiento

-   Base de datos PostgreSQL con índices en campos únicos (email)
-   Prisma ORM para optimización de queries

### Compliance / Calidad

-   Validación estricta de datos (nombres, emails, teléfonos, fechas)
-   Manejo de errores estructurado
-   Tests unitarios para servicios y controladores

## Definition of Done para cambios típicos

Para considerar un cambio completo en este repo:

1. **Código**:

    - Implementado siguiendo arquitectura DDD (domain/application/infrastructure/presentation)
    - Validación de datos implementada
    - Manejo de errores apropiado

2. **Tests**:

    - Tests unitarios añadidos/actualizados (si aplica)
    - Tests pasando: `cd backend && npm test`

3. **Documentación**:

    - API actualizada en `backend/api-spec.yaml` (si afecta endpoints)
    - Memory Bank actualizado (si cambia arquitectura/patrones)

4. **Build**:

    - Backend compila sin errores: `cd backend && npm run build`
    - Frontend compila sin errores: `cd frontend && npm run build`

5. **Verificación manual**:
    - Funcionalidad probada localmente
    - Base de datos migrada si hay cambios en schema: `cd backend && npm run prisma:migrate`

## Preguntas al humano

-   ¿Existe un sistema de autenticación planeado o en desarrollo?
-   ¿Cuál es el roadmap de features pendientes?
-   ¿Hay ambientes de staging/producción configurados?
-   ¿Existen convenciones de commit messages o branch naming?
-   ¿Hay CI/CD configurado (no detectado en repo)?
