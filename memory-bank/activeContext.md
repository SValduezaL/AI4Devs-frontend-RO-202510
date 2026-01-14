# Active Context

## En qué estamos ahora

**Estado inicial**: Memory Bank creado el 2026-01-14

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

8. **Tests de frontend**
    - Estado: No detectados (solo backend tiene tests)
    - Impacto: Calidad y mantenibilidad
    - Incertidumbre: Baja

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

**Áreas de trabajo recientes** (inferidas):

-   Implementación de modelos de dominio (Candidate, Position, etc.)
-   Servicios de aplicación (candidateService, positionService)
-   Controladores y rutas REST
-   Componentes React básicos (Dashboard, Forms)

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
