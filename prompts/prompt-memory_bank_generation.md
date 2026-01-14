# memory_bank_generation-prompt

# memory-bank-generation-spec.md

## Contexto / Rol

Eres Cursor (AI agent) actuando como **arquitecto de software** + **tech writer**. Tu memoria “entre sesiones” no es fiable, así que debes crear documentación persistente y estructurada para que cualquier IA (y humano) retome el proyecto sin contexto previo.

---

## Objetivo

Crear un Memory Bank dentro de este repositorio, con:

- Estructura estándar (core files requeridos)
- Contenido real extraído del código (no inventes)
- Reglas del proyecto para obligarte a leer y mantener el Memory Bank en cada tarea

Ejemplos concretos: diagramas, inventario de módulos, flujos, endpoints, decisiones técnicas, etc.

---

## 0) Reglas críticas (obligatorias)

- No inventes. Si algo no se puede inferir del repo, marca como `UNKNOWN` y crea una lista **“Preguntas al humano”**.
- Antes de escribir, escanea el repo:
    - Lenguajes, frameworks, estructura de carpetas
    - Entrypoints (apps), módulos, paquetes (monorepo?), servicios, infra
    - Config (env, docker, CI), scripts, herramientas
    - Tests (si existen), linters, conventions
- Escribe en Markdown claro y operativo.
- Prioriza lo que un agente necesita para trabajar: qué es, cómo corre, dónde tocar, riesgos, patrones, estado actual.

---

## 1) Output esperado: árbol de ficheros

Crea esta estructura (si ya existe, actualízala):

```
/memory-bank/
  projectbrief.md
  productContext.md
  systemPatterns.md
  techContext.md
  activeContext.md
  progress.md

  /architecture/
    overview.md
    diagrams.md

  /decisions/
    ADR-0001-template.md
    ADR-0002-<slug>.md   (solo si detectas decisiones claras)

  /domains/
    domain-model.md
    key-flows.md

  /interfaces/
    api.md              (si hay API)
    events-jobs.md      (si hay colas, cron, workers)

  /ops/
    local-dev.md
    deployment.md
    observability.md

  /quality/
    testing.md
    linting-format.md
```

Además:

Crea reglas en formato moderno si el repo lo soporta:

```
.cursor/rules/memory-bank.mdc
.cursor/rules/engineering-standards.mdc
```

Si el proyecto usa legado o el equipo lo pide, crea también `.cursorrules` (opcional), pero prioriza `.cursor/rules`.

---

## 2) Contenido mínimo requerido (core files)

### 2.1) memory-bank/projectbrief.md

Debe responder, con bullets y secciones:

- Qué es el producto (1–3 líneas)
- Objetivo de negocio / problema que resuelve
- Alcance dentro del repo (qué incluye/excluye)
- Stakeholders / tipos de usuarios (si se deduce)
- Requisitos no funcionales detectados (seguridad, rendimiento, compliance) si aparecen en código/docs
- “Definition of Done” para cambios típicos en este repo

### 2.2) memory-bank/productContext.md

- “Why”: por qué existe
- “What”: cómo debería funcionar a alto nivel
- UX/Flujos principales (si aplica)
- Casos borde / riesgos de producto

### 2.3) memory-bank/systemPatterns.md

- Arquitectura (monolito, microservicios, monorepo, etc.)
- Patrones repetidos en el código (ej. repository pattern, DI, CQRS, event-driven)
- Convenciones de carpetas y naming
- Relaciones entre componentes (quién llama a quién)
- Incluye diagrama Mermaid realista (aunque sea aproximado) y explica limitaciones

### 2.4) memory-bank/techContext.md

- Stack (lenguajes, runtime, frameworks)
- Dependencias clave (y para qué)
- Setup local exacto (comandos reales del repo)
- Config/env: lista de .env keys detectadas (sin secretos)
- Restricciones: versiones, compatibilidades, limitaciones de entorno

### 2.5) memory-bank/activeContext.md

- “En qué estamos ahora”: si no hay historial, escribe:
    - Estado inicial: “Memory bank creado el
        
        ” (busca la fecha real para  ejecutando algún script que te indique la fecha en que se ejecuta este prompt).
        
    - Hipótesis de foco: “pendiente de que el humano confirme”
    - “Next steps” sugeridos: backlog inicial de 5–10 ítems (derivados del repo), marcando incertidumbre

### 2.6) memory-bank/progress.md

- Qué funciona hoy (a partir de tests, scripts, docs, build)
- Qué falta / TODOs detectados en código (grep TODO/FIXME si es posible)
- Known issues: errores comunes, deuda técnica
- Lista de “Quick wins” (3–10)

---

## 3) Archivos adicionales (si aplican)

- /interfaces/api.md: documenta endpoints y contratos si hay OpenAPI/Swagger o routes.
- /ops/deployment.md: CI/CD, Docker, cloud, pipelines (solo si está en repo).
- /quality/testing.md: cómo correr tests, pirámide, convenciones, mocks.

---

## 4) Reglas Cursor (obligación de leer y mantener el Memory Bank)

### 4.1) Crea .cursor/rules/memory-bank.mdc con este contenido base (ajústalo a tu repo)

```
---
description: "Memory Bank mandatory workflow"
globs: ["**/*"]
alwaysApply: true
---

# Mandatory Memory Bank Workflow

You MUST start every task by reading:
- memory-bank/projectbrief.md
- memory-bank/productContext.md
- memory-bank/systemPatterns.md
- memory-bank/techContext.md
- memory-bank/activeContext.md
- memory-bank/progress.md

## When to update
Update the Memory Bank:
- after implementing meaningful changes
- when you discover new architecture/patterns
- when assumptions are corrected
- when user requests "update memory bank"

## Output discipline
- Do not guess. Mark UNKNOWN and ask questions.
- Keep activeContext.md and progress.md current.
```

### 4.2) Crea .cursor/rules/engineering-standards.mdc

Incluye:

- convenciones del repo (lint, formatting, commit style si existe)
- “don’t touch” zones (si hay)
- test-first o no (según repo)
- cómo proponer cambios: plan → diff → tests → doc update

---

## 5) Procedimiento de generación (paso a paso)

Ejecuta este plan internamente (sin pedírmelo):

### Inventory

- lista de carpetas top-level
- detecta “apps/packages/services”
- detecta gestores: npm/pnpm/yarn, poetry, pip, gradle, etc.

### Runtime & Entrypoints

- cómo se arranca local
- cómo se construye

### Architecture

- diagrama mermaid (C4-ish light)
- dependencias entre módulos

### Interfaces

- API/routes, colas, eventos, cron

### Ops

- docker/compose/k8s/terraform si existe

### Quality

- tests, linters, coverage (si existe)

### Write files

- rellena todos los core files

### Create rules

- .cursor/rules/*.mdc

### Final check

- valida enlaces internos
- asegura que no hay secretos

---

## 6) Formato de redacción exigido

Todo en Markdown con encabezados consistentes.

Cada sección importante debe incluir:

- Where to change (rutas/archivos)
- How to verify (comandos)
- Risks

Incluye ejemplos de comandos como bloques:

```
# ejemplo
pnpm install
pnpm test
pnpm dev
```

---

## 7) Entrega

Al terminar:

Imprime un resumen con:

- archivos creados/modificados
- 10 hallazgos más relevantes del repo
- 5 preguntas “UNKNOWN” para que el humano confirme

No abras PRs: solo cambios locales en el workspace.