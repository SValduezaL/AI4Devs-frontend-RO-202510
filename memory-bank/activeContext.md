# Active Context

## En qué estamos ahora

**Estado actual**: Tests de frontend implementados (2026-01-14)

**Commit**: `b84bec4` - "test: añadir tests unitarios e integración para página Position"

**Última actividad**: Implementación completa de tests para la página Position:

-   **Kanban interactivo** con drag & drop usando `@dnd-kit/core` y `@dnd-kit/sortable`
-   **Integración completa con API**:
    -   `GET /position/:id/interviewflow` → Carga flujo de entrevistas
    -   `GET /position/:id/candidates` → Carga candidatos por posición
    -   `PUT /candidates/:id` → Actualiza etapa de candidato
-   **Tests unitarios de utilidades** (positionUtils.test.ts)
-   12 tests para sortSteps, groupCandidatesByStep, createStepMap
-   Cobertura de casos normales y edge cases (arrays vacíos, duplicados, etc.)
-   **Tests de integración** (PositionPage.test.tsx)
-   14 tests para renderizado, navegación y edge cases
-   Mock de hooks (usePositionData, useUpdateCandidateStage) y servicios
-   Preparación para simulación de drag & drop
-   **Configuración de testing**
-   setupTests.ts configurado para jest-dom
-   Script de test actualizado en package.json para usar react-scripts

**Estado anterior**: Implementación completa de la página de detalle de posición (`/positions/:id`) con:

-   Kanban interactivo con drag & drop usando `@dnd-kit/core` y `@dnd-kit/sortable`
-   Integración completa con API (GET /position/:id/interviewflow, GET /position/:id/candidates, PUT /candidates/:id)
-   Optimistic UI con rollback automático en caso de error
-   Responsive design: Desktop (grid horizontal) y móvil (columnas verticales <768px)
-   Accesibilidad: ARIA labels, keyboard navigation, screen reader support
-   Estados UI: Loading skeleton, error banners, empty states
-   Arquitectura en capas: features/domain/infrastructure según `frontend_best_practices.md`
-   Cliente API centralizado: `apiClient.ts` con axios e interceptores
-   Normalización de datos: Mapeo string→id, agrupación por etapa, ordenamiento

Este Memory Bank fue generado mediante análisis automático del código fuente del repositorio. La información contenida se basa en:

-   Estructura de archivos y carpetas
-   Código fuente analizado (backend y frontend)
-   Archivos de configuración (package.json, tsconfig.json, docker-compose.yml)
-   Documentación existente (README.md, api-spec.yaml)

## Hipótesis de foco

**Pendiente de que el humano confirme**:

1. **Estado del proyecto**: ¿Es un proyecto en desarrollo activo, un ejercicio de aprendizaje, o un MVP en producción?
2. **Prioridades actuales**: ¿Cuál es la siguiente feature o mejora prioritaria?
3. **Deuda técnica**: ¿Hay áreas conocidas que requieren refactorización?
4. **Ambientes**: ¿Existen ambientes de staging/producción configurados?
5. **Equipo**: ¿Cuántos desarrolladores trabajan en el proyecto?

## Next steps sugeridos

### Backlog inicial (derivado del análisis del repo)

#### Alta prioridad (funcionalidad faltante)

1. **Sistema de autenticación/autorización**

    - Estado: No detectado en código
    - Impacto: Crítico para producción
    - Incertidumbre: Alta (no sabemos qué sistema usar)

2. **Interfaz para crear posiciones**

    - Estado: Backend existe, frontend no detectado
    - Impacto: Funcionalidad core incompleta
    - Incertidumbre: Media (backend sugiere que debería existir)

3. **Gestión de flujos de entrevistas**

    - Estado: Modelos existen, UI no detectada
    - Impacto: Funcionalidad core incompleta
    - Incertidumbre: Media

4. **Registro de entrevistas**
    - Estado: Modelo `Interview` existe, UI no detectada
    - Impacto: Funcionalidad core incompleta
    - Incertidumbre: Media

#### Media prioridad (mejoras de calidad)

5. **Paginación en listados**

    - Estado: No implementado
    - Impacto: Performance cuando hay muchos registros
    - Incertidumbre: Baja (requerimiento claro)

6. **Búsqueda y filtrado de candidatos**

    - Estado: No implementado
    - Impacto: UX cuando hay muchos candidatos
    - Incertidumbre: Baja

7. **Manejo de errores mejorado**

    - Estado: Básico implementado
    - Impacto: Mejor experiencia de usuario
    - Incertidumbre: Baja

8. ~~**Tests de frontend**~~ ✅ **Completado**
    - Estado: Implementados (26 tests: 12 unitarios + 14 integración)
    - Archivos: positionUtils.test.ts, PositionPage.test.tsx
    - Todos los tests pasando

#### Baja prioridad (deuda técnica)

9. **Unificar TypeScript/JavaScript en frontend**

    - Estado: Mezcla de .js y .tsx
    - Impacto: Consistencia y type safety
    - Incertidumbre: Baja

10. **Migrar Prisma a capa infrastructure**

-   Estado: Prisma usado directamente en domain
-   Impacto: Mejor separación de responsabilidades (DDD)
-   Incertidumbre: Media (puede ser decisión arquitectónica)

11. **Configurar monorepo tool (pnpm workspaces, etc.)**

-   Estado: No configurado
-   Impacto: Mejor gestión de dependencias
-   Incertidumbre: Baja

12. **Health check endpoints**

-   Estado: No implementado
-   Impacto: Monitoreo y deployment
-   Incertidumbre: Baja

13. **Logging estructurado**

-   Estado: console.log básico
-   Impacto: Debugging y monitoreo en producción
-   Incertidumbre: Baja

14. **CI/CD pipeline**

-   Estado: No detectado
-   Impacto: Automatización de deployment
-   Incertidumbre: Alta (no sabemos qué plataforma usar)

15. **Documentación de API con Swagger UI**

-   Estado: Swagger instalado pero no configurado en código
-   Impacto: Documentación interactiva
-   Incertidumbre: Baja (dependencias ya instaladas)

## Contexto de trabajo actual

**Última actividad detectada**:

-   Build de frontend presente en `frontend/build/`
-   Tests unitarios en backend presentes y estructurados
-   Estructura DDD implementada en backend

**Áreas de trabajo recientes**:

-   ✅ **Tests de frontend implementados**
    -   Tests unitarios: positionUtils.test.ts (12 tests)
    -   Tests de integración: PositionPage.test.tsx (14 tests)
    -   Configuración: setupTests.ts para jest-dom
    -   Todos los tests pasando (26 tests totales)
-   ✅ **Página Position completa** (`/positions/:id`)
    -   Componentes: PositionPage, PositionKanban, KanbanColumn, CandidateCard, PositionHeader
    -   Hooks: usePositionData, useUpdateCandidateStage
    -   Servicios: positionService, candidateService (extendido)
    -   Utilidades: normalización y agrupación de datos
-   ✅ **Arquitectura frontend mejorada**
    -   Estructura en capas: features/domain/infrastructure
    -   Cliente API centralizado (apiClient.ts)
    -   Tipos TypeScript: position.types, position.dto
-   ✅ **Integración drag & drop**
    -   Librería: @dnd-kit (moderna, accesible)
    -   Optimistic UI con rollback
    -   Bloqueo durante actualizaciones
-   ✅ **Documentación**
    -   GUIA_PRUEBAS_MANUALES.md (guía completa de testing)
    -   INICIAR_PROYECTO.md (quick start)
    -   NOTA_SOBRE_304.md (explicación de respuestas HTTP)
    -   Prompts de documentación generados (prompts/):
        -   prompts-frontend_tests.md (documentación de implementación de tests)
        -   prompts-guias_buenas_practicas.md (documentación de creación de guías)
        -   prompts-SVL.md (documentación de implementación de página Position)
        -   prompt-memory_bank_generation.md (documentación de generación del Memory Bank)
        -   prompt-optimize_env_configuration.md (documentación de optimización de configuración)

## Preguntas críticas para el humano

1. **¿Cuál es el objetivo inmediato del proyecto?** (MVP, producción, aprendizaje)
2. **¿Qué funcionalidades son críticas vs nice-to-have?**
3. **¿Hay deadlines o milestones definidos?**
4. **¿Existe documentación adicional fuera del repo?** (Confluence, Notion, etc.)
5. **¿Hay integraciones planeadas?** (calendarios, email, ATS, etc.)

## Notas para próximas sesiones

-   Revisar `memory-bank/activeContext.md` al inicio de cada tarea
-   Actualizar `progress.md` después de completar features
-   Mantener `systemPatterns.md` actualizado si cambia arquitectura
-   Documentar decisiones importantes en `decisions/` (ADRs)
