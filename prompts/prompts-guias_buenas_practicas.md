# Prompts Guias Buenas Practicas — 2026-01-14

# RESUMEN GENERAL

## Trabajo realizado

El usuario ha trabajado en la creación de **documentos oficiales de Buenas Prácticas de Ingeniería** para un proyecto full-stack (LTI - Sistema de Seguimiento de Talento), específicamente:

1. **Frontend Best Practices** (`frontend_best_practices.md`)
2. **Backend Best Practices** (`backend_best_practices.md`)

## Objetivos principales

-   Generar documentos específicos y adaptados al repositorio real, no guías genéricas
-   Analizar el código existente para identificar problemas reales y violaciones de principios
-   Integrar los documentos con el sistema de Memory Bank y Cursor Rules para que se lean automáticamente
-   Proporcionar ejemplos Before/After con código real del proyecto

## Temas principales

### Frontend

-   Arquitectura en capas (UI/Features/Domain/Infrastructure)
-   Componentes presentacionales vs containers
-   Gestión de estado y side-effects
-   Acceso a APIs con adapters y tipado
-   Principios SOLID aplicados a Frontend
-   Testing strategy (unit, component, integration, e2e)
-   Performance y accesibilidad

### Backend

-   Domain-Driven Design (DDD) y Clean Architecture
-   Separación de capas (domain/application/infrastructure/presentation)
-   Entidades, Value Objects, Repositories y Puertos
-   Casos de uso y servicios de aplicación
-   Principios SOLID aplicados a Backend
-   Testing strategy (unit, integration, e2e)
-   Seguridad y observabilidad

## Resultados generados

### Documentos creados

1. `memory-bank/frontend_best_practices.md` - ~2700 líneas
2. `memory-bank/backend_best_practices.md` - ~3000 líneas

### Reglas de Cursor creadas/modificadas

1. `.cursor/rules/frontend-standards.mdc` - Regla específica para frontend
2. `.cursor/rules/backend-standards.mdc` - Regla específica para backend
3. `.cursor/rules/engineering-standards.mdc` - Referencias a ambos documentos

### Referencias en Memory Bank

-   `memory-bank/systemPatterns.md` - Añadidas referencias a ambos documentos

## Problemas identificados y documentados

### Frontend

-   Componente "god" (`AddCandidateForm.js` con 447 líneas)
-   Mezcla TypeScript/JavaScript
-   Inconsistencia en HTTP clients (fetch vs axios)
-   Datos mock en producción (`Positions.tsx`)
-   Sin separación de capas
-   Sin tests de frontend
-   Lógica de negocio en componentes

### Backend

-   Violación de DIP: Modelos usan `PrismaClient` directamente
-   Violación de SRP: Servicios con múltiples responsabilidades
-   Sin transacciones: Operaciones multi-entidad no son atómicas
-   Inconsistencia: Algunos servicios usan modelos, otros Prisma directo
-   Validación mezclada con lógica de negocio
-   Manejo de errores inconsistente
-   Acoplamiento fuerte con Express en servicios

## Impacto

Los documentos generados sirven como:

-   **Fuente de verdad oficial** para decisiones arquitectónicas
-   **Guía de referencia** para mantener consistencia en el código
-   **Base para refactorizaciones** con ejemplos concretos Before/After
-   **Integración automática** con el sistema de Memory Bank y Cursor Rules

Ambos documentos están ahora integrados en el flujo de trabajo del proyecto y se leerán automáticamente cuando se trabaje en código frontend o backend respectivamente.

# Prompts usados

## Prompt 1

**Prompt del usuario:**

````
Eres un **Frontend Staff Engineer / Tech Lead** con más de 20 años de experiencia, experto en:

- Arquitectura Frontend a escala (modularización, monorepos, shared libraries)
- Clean Architecture aplicada a UI (capas: UI / state / domain / infra)
- SOLID adaptado a Frontend (SRP en componentes, DIP via adapters, etc.)
- DRY / KISS / YAGNI
- Patrones de diseño en UI (Container/Presenter, Adapter, Factory, Strategy, State Machine)
- State management moderno (según el stack del repo: React/Next/Vue/Angular + store)
- Performance (Core Web Vitals, bundle splitting, memoization, virtualization)
- Accesibilidad (WCAG) e i18n
- Seguridad en Frontend (XSS, CSRF, manejo de tokens, SSR pitfalls)
- Testing (unit, integration, component, e2e; pirámide de tests)
- DX (linting, formatting, CI, storybook si existe)

Tu tarea es generar un **documento oficial de Buenas Prácticas de Frontend específico para ESTE repositorio**.

NO debes escribir una guía genérica.
Debes analizar el repositorio real:

- Estructura de carpetas del frontend (y si hay varios frontends)
- Framework y tooling real (React/Next/Vite/Vue/Angular, TS/JS, bundler, linters)
- Convenciones de componentes, páginas/rutas, hooks, utils, servicios, estilos
- Gestión de estado y side-effects (store, hooks, async, caching)
- Acceso a APIs / SDKs (clients, adapters, fetch/axios, interceptors)
- Manejo de autenticación/sesión (si aplica)
- Estilos (CSS Modules, Tailwind, styled-components, MUI, etc.)
- Tests existentes (estructura, tooling, cobertura real)
- Convenciones de naming y organización
- Dependencias entre capas (qué importa a qué) y acoplamientos actuales
- Problemas reales: duplicación, componentes "god", lógica de negocio en UI, etc.

A partir de ese análisis debes inferir:

- El estilo arquitectónico realmente utilizado (aunque esté mal aplicado)
- Dónde el código cumple o viola SOLID/DRY/clean architecture
- Qué patrones de diseño están implícitos (y si están bien usados)
- Qué *reglas operativas* deben seguirse para mantener consistencia en este repo

---

## 0️⃣ Requisito crítico de integración con Memory Bank y Cursor Rules

Este repositorio usa **Memory Bank** y **.cursor/rules**.
Debes asegurar que el documento sea **leído siempre** cuando se genere o edite código frontend.

Por tanto, además de crear el archivo `frontend_engineering_best_practices.md`:

1) Debes decidir **la ruta más apropiada** para guardarlo, priorizando:
   - Que quede dentro del "espacio" que el asistente lee como base (Memory Bank / docs)
   - Que sea coherente con la estructura actual del repo
   Ejemplos típicos (elige en función del repo):
   - `memory-bank/frontend_engineering_best_practices.md`
   - `docs/frontend/frontend_engineering_best_practices.md`
   - `engineering/frontend_engineering_best_practices.md`
   - `docs/engineering/frontend_engineering_best_practices.md`

2) Debes **actualizar o crear** (si no existen) reglas en `.cursor/rules` para que:
   - En cualquier tarea que afecte a frontend, el asistente **lea obligatoriamente** este documento
   - Se aplique como "source of truth" de convenciones, estructura, tests, performance y accesibilidad
   - Si el repo tiene un "Memory Bank index" (por ejemplo `memory-bank/README.md` o similar),
     debes añadir una referencia ahí también.

⚠️ NO inventes archivos si no existen: si no hay Memory Bank index, crea el mínimo necesario y explica por qué.
Si hay reglas existentes, **modifícalas** en vez de duplicarlas.

---

## 1️⃣ Requisitos del documento

Debes:

1. Generar un único archivo llamado exactamente:
   - `frontend_engineering_best_practices.md`

2. Guardarlo en la **carpeta más apropiada según la estructura del repo**
   (siguiendo el criterio del punto 0)

3. El documento debe estar en **Markdown** y ser "production-grade".

---

## 2️⃣ Contenido obligatorio (adaptado a ESTE repo)

El documento debe incluir estas secciones:

### 📌 Contexto del Frontend del Proyecto
Basado en el código real:
- Qué hace el frontend (y para quién)
- Framework/s y tooling reales
- Cómo se organiza hoy (rutas, componentes, capas)
- Dónde viven hoy responsabilidades (UI, dominio, datos)

---

### 🧭 Arquitectura Frontend y Límites de Responsabilidad
- Describe el modelo arquitectónico real que ves en el repo
- Define cómo DEBERÍA quedar (sin reescribir todo)
- Define reglas de importación y dependencias permitidas (ej. UI no importa infra directa)
- Define una guía de estructura de carpetas final recomendada, coherente con lo que ya existe

Incluye un mapa tipo:
- `ui/` (presentación)
- `features/` (casos de uso UI)
- `domain/` (tipos/entidades del dominio si existen en FE)
- `infra/` (clients, adapters, storage)
*(ajústalo al stack real)*

---

### 🧩 Componentes: diseño, composición y escalabilidad
Explica reglas concretas para ESTE repo:
- Qué es componente "presentational" vs "container"
- Tamaño máximo razonable y señales de "god component"
- Convenciones de props, naming, eventos, controlled/uncontrolled
- Hooks: cuándo crear hooks custom, cómo nombrarlos, qué pueden importar
- Patrones recomendados según el código actual (compound components, render props, etc.)

---

### 🧠 Estado y Side Effects (State Management)
Basado en el sistema real:
- Qué store existe (o no) y cómo se usa
- Reglas para:
  - estado local vs global
  - caching y sincronización (ej. react-query / swr / store)
  - side-effects (fetch, subscriptions, websockets)
  - manejo de loading/error
- Qué está mal actualmente (ejemplos reales del repo) y cómo corregir

---

### 🔌 Acceso a APIs, Adapters y Tipado
- Cómo debe llamarse y organizarse el API client
- Estrategia de tipado (TypeScript): DTOs vs modelos de dominio, mapeos
- Manejo de errores e interceptores (si aplica)
- Reglas de seguridad: tokens, almacenamiento, SSR/CSR, etc.
- Identifica acoplamientos reales actuales (UI llamando a fetch directo, etc.) y propón refactor

---

### 🎨 Estilos, Design System y Consistencia visual
Según lo usado en el repo:
- Sistema de estilos actual (Tailwind/MUI/CSS Modules/etc.)
- Reglas de consistencia (tokens, spacing, typography, colores, responsive)
- Accesibilidad: focus states, contrast, navegación teclado
- Si existe un design system, explica cómo contribuir

---

### ⚡ Performance y Calidad (Core Web Vitals / UX)
- Hotspots típicos en este repo (según lo que encuentres)
- Reglas de lazy loading, code splitting, memoization, virtualization
- Bundle hygiene (deps pesadas, imports)
- Imágenes y assets
- Observabilidad en FE (logging, error boundaries, Sentry si existe)

---

### 🧪 Testing Strategy (unit / component / integration / e2e)
Explica con el tooling real:
- Qué tests existen hoy y cómo se ejecutan
- Qué falta para una estrategia completa
- Convenciones:
  - naming
  - ubicación
  - fixtures
  - mocks
  - contract tests (si aplica)
- Define "Definition of Done" de frontend para este repo (mínimo de tests por cambio)

---

### 🧱 Principios SOLID adaptados a Frontend
Crear una subsección por principio:
- SRP
- OCP
- LSP (aplicado a componentes/contratos)
- ISP (props interfaces pequeñas, APIs de hooks)
- DIP (adapters, inversion via interfaces)

Para cada uno:
1. Explica cómo aplica a ESTE código
2. Muestra al menos **una violación real encontrada**
3. Muestra cómo debería quedar tras refactorizar

---

### ♻ DRY y Reutilización
- Duplicaciones reales actuales (helpers, UI patterns, lógica repetida)
- Qué abstracciones faltan y cuáles sobran
- Reglas para crear utilidades vs hooks vs componentes shared

---

### 🧰 Patrones de Diseño en UI
Identifica:
- Patrones ya presentes (aunque estén mal implementados)
- Patrones que deberían introducirse

Explica por qué, con referencias a código del repo.

---

## 3️⃣ Plantillas Before / After (obligatorio, con ejemplos reales)

El documento debe incluir plantillas reutilizables como:

```md
## Ejemplo – Violación de SRP en Componente

### ❌ Antes
(código real o reconstruido a partir del repo, referenciando archivos/rutas)

### ✅ Después
(versión refactorizada)

### Por qué esto es mejor
(explicación técnica aplicada al repo)
````

Estas plantillas deben usarse varias veces con **ejemplos reales del proyecto**, no código ficticio.

---

## 4️⃣ Estilo y nivel

-   Escribe como un Tech Lead guiando a un equipo real
-   Técnico, concreto y con criterio
-   Cero "explicaciones de libro"
-   Todo debe estar atado a este repositorio y su stack

---

## 5️⃣ Resultado final

Al final debes:

1. Mostrar el Markdown completo de `frontend_engineering_best_practices.md`

2. Indicar la **ruta exacta** donde lo has guardado

3. Mostrar los cambios realizados en:

    - `.cursor/rules/...` (archivos creados o modificados)
    - y en el índice del Memory Bank si existe (o el archivo que haga ese rol)

Este documento será la **referencia oficial de ingeniería Frontend** del proyecto.

```

**Resultado:**

La IA analizó el repositorio frontend, identificó problemas reales (componentes "god", mezcla TypeScript/JavaScript, inconsistencia fetch/axios, datos mock, etc.) y generó el documento `memory-bank/frontend_engineering_best_practices.md` (posteriormente renombrado a `frontend_best_practices.md`). El documento incluye:

- Análisis del estado actual del frontend
- Arquitectura recomendada en capas (UI/Features/Domain/Infrastructure)
- Convenciones de componentes, hooks y servicios
- Principios SOLID aplicados con ejemplos reales
- 3 ejemplos Before/After con código real del proyecto
- Estrategia de testing, performance y accesibilidad

Además, se crearon/modificaron:
- `.cursor/rules/frontend-standards.mdc` - Regla específica para frontend
- `.cursor/rules/engineering-standards.mdc` - Referencia al documento
- `memory-bank/systemPatterns.md` - Referencia al documento

---

## Prompt 2

**Prompt del usuario:**

```

Eres un **Backend Staff Engineer / Principal Engineer** con más de 20 años de experiencia, experto en:

-   Arquitectura de software backend a escala
-   Domain-Driven Design (DDD) táctico y estratégico
-   Clean Architecture / Hexagonal / Ports & Adapters
-   SOLID (SRP, OCP, LSP, ISP, DIP) aplicado a backend real
-   DRY, KISS, YAGNI
-   Diseño de APIs (REST, event-driven, async)
-   Modelado de dominio y persistencia
-   Integraciones con sistemas externos
-   Observabilidad (logs, métricas, trazas)
-   Seguridad backend (auth, authz, secrets, data protection)
-   Testing backend (unit, integration, contract, e2e)
-   DX y mantenibilidad a largo plazo

Tu tarea es generar un **documento oficial de Buenas Prácticas de Backend específico para ESTE repositorio**.

NO debes escribir una guía genérica.
Debes analizar el repositorio real:

-   Estructura de carpetas del backend (y si hay varios servicios)
-   Lenguaje y framework reales (ej. Python/FastAPI, Node/Nest, Java/Spring, etc.)
-   Capas existentes (domain, application, infra, adapters, controllers, etc.)
-   Modelo de dominio y entidades
-   Casos de uso / servicios de aplicación
-   Acceso a datos (ORM, repositorios, queries, migraciones)
-   Integraciones externas (APIs, colas, webhooks, servicios terceros)
-   Gestión de configuración y secretos
-   Manejo de errores y excepciones
-   Tests existentes (estructura, tipo y cobertura real)
-   Convenciones de nombres y packaging
-   Dependencias entre capas (qué importa a qué)
-   Problemas reales: lógica en controllers, dominios anémicos, infra acoplada, etc.

A partir de ese análisis debes inferir:

-   El estilo arquitectónico realmente utilizado (aunque esté mal aplicado)
-   Dónde el código cumple o viola DDD, SOLID, DRY y Clean Architecture
-   Qué patrones de diseño están implícitos (y si están bien usados)
-   Qué _reglas operativas_ deben seguirse para mantener coherencia en este repo

---

## 0️⃣ Requisito crítico de integración con Memory Bank y Cursor Rules

Este repositorio usa **Memory Bank** y **`.cursor/rules`**.
Debes asegurar que este documento sea **leído siempre** cuando el asistente genere o modifique código backend.

Por tanto, además de crear el archivo `backend_best_practices.md`:

1. Debes decidir **la ruta más apropiada** para guardarlo, priorizando:

    - Que forme parte del espacio de conocimiento persistente (Memory Bank / docs)
    - Que sea coherente con la estructura real del repo

    Ejemplos (elige el adecuado según el repo):

    - `memory-bank/backend_best_practices.md`
    - `docs/backend/backend_best_practices.md`
    - `engineering/backend_best_practices.md`
    - `docs/engineering/backend_best_practices.md`

2. Debes **crear o modificar** reglas en `.cursor/rules` para que:
    - En cualquier tarea que afecte a backend, el asistente **lea obligatoriamente** este documento
    - Se aplique como _source of truth_ para arquitectura, dominio, APIs, tests y seguridad
    - Si existe un índice del Memory Bank (ej. `memory-bank/README.md`), debes añadir ahí la referencia

⚠️ NO inventes archivos: si algo no existe, crea el mínimo necesario y explica por qué.
Si ya existen reglas, **modifícalas**, no las dupliques.

---

## 1️⃣ Requisitos del documento

Debes:

1. Generar un único archivo llamado exactamente:

    - `backend_best_practices.md`

2. Guardarlo en la **carpeta más apropiada según la estructura real del proyecto**

3. El documento debe estar en **Markdown** y tener calidad de producción

---

## 2️⃣ Contenido obligatorio (adaptado a ESTE repo)

El documento debe incluir las siguientes secciones:

### 📌 Contexto del Backend del Proyecto

Basado en el código real:

-   Qué hace el sistema
-   Qué dominio resuelve
-   Qué arquitectura backend usa realmente
-   Cómo se reparten hoy las responsabilidades entre capas

---

### 🧭 Arquitectura Backend y Límites de Capas

-   Describe la arquitectura real observada
-   Define cómo debería quedar sin reescribir todo
-   Reglas claras de dependencias permitidas
-   Qué capas existen y qué NO pueden hacer

Incluye un esquema tipo:

-   `domain/`
-   `application/`
-   `infrastructure/`
-   `interfaces` o `adapters/`
    (adáptalo al repo real)

---

### 🧩 Domain-Driven Design (DDD)

Explica cómo aplica DDD en ESTE proyecto:

-   Aggregates, Entities, Value Objects
-   Domain Services vs Application Services
-   Repositories y puertos
-   Límites de contexto
-   Qué está mal modelado o acoplado hoy

---

### 🔁 Casos de Uso y Servicios de Aplicación

-   Cómo deben definirse y nombrarse
-   Qué lógica va aquí y cuál no
-   Manejo de transacciones
-   Orquestación vs lógica de dominio
-   Violaciones reales encontradas y refactor propuesto

---

### 🧪 Testing Strategy (Backend)

Basado en el tooling real:

-   Tests existentes hoy
-   Qué falta para una estrategia sana
-   Convenciones de naming y ubicación
-   Unit vs integration vs contract
-   Qué debe cumplir un PR para considerarse "done"

---

### 🧱 Principios SOLID

Crear una subsección por principio:

-   SRP
-   OCP
-   LSP
-   ISP
-   DIP

Para cada uno:

1. Cómo aplica a ESTE backend
2. Al menos **una violación real encontrada**
3. Ejemplo de refactor correcto

---

### ♻ DRY y Reutilización

-   Duplicaciones reales actuales
-   Abstracciones inexistentes o excesivas
-   Helpers, servicios y librerías compartidas mal diseñadas

---

### 🧰 Patrones de Diseño

Identifica:

-   Patrones ya presentes (aunque mal implementados)
-   Patrones que deberían introducirse

Justifica cada caso con referencias al código real.

---

### 🔐 Seguridad y Robustez

-   Auth / AuthZ (si existe)
-   Manejo de secretos y configuración
-   Validación de inputs
-   Manejo de errores y excepciones
-   Riesgos actuales detectados en el repo

---

### 📈 Observabilidad y Operación

-   Logging estructurado
-   Manejo de errores en producción
-   Métricas y healthchecks (si aplica)
-   Qué debería añadirse para operar bien este backend

---

## 3️⃣ Plantillas Before / After (obligatorio)

El documento debe incluir plantillas reutilizables como:

```md
## Ejemplo – Violación de DIP en Servicio de Aplicación

### ❌ Antes

(código real o reconstruido a partir del repo, indicando archivo)

### ✅ Después

(refactor aplicando puertos/adapters)

### Por qué esto es mejor

(explicación técnica aplicada al proyecto)
```

Estas plantillas deben aparecer **varias veces**, con ejemplos reales del repo.

---

## 4️⃣ Estilo y nivel

-   Escribe como un Principal Engineer guiando a un equipo real
-   Técnico, directo y con criterio
-   Sin teoría genérica
-   Todas las recomendaciones deben estar ligadas a este repositorio

---

## 5️⃣ Resultado final

Al final debes:

1. Mostrar el Markdown completo de `backend_best_practices.md`

2. Indicar la **ruta exacta** donde lo has guardado

3. Mostrar los cambios realizados en:

    - `.cursor/rules` (archivos creados o modificados)
    - Índice del Memory Bank, si existe

Este documento será la **referencia oficial de ingeniería Backend** del proyecto.

```

### Consejo adicional (importante)
Cuando conviven frontend y backend en el mismo repo, es **muy recomendable** que:
- Ambos documentos (`frontend_best_practices.md` y `backend_best_practices.md`)
- Estén referenciados desde **un único índice del Memory Bank**
- Y que las rules de Cursor obliguen a leer **solo el que aplique** según el tipo de archivo tocado.

**Resultado:**

La IA analizó el repositorio backend, identificó problemas reales (violación de DIP con Prisma directo en modelos, violación de SRP en servicios, falta de transacciones, inconsistencia entre servicios, etc.) y generó el documento `memory-bank/backend_best_practices.md`. El documento incluye:

- Análisis del estado actual del backend
- Arquitectura DDD y Clean Architecture recomendada
- Convenciones de entidades, repositorios, casos de uso y controladores
- Principios SOLID aplicados con ejemplos reales
- 3 ejemplos Before/After con código real del proyecto
- Estrategia de testing, seguridad y observabilidad

Además, se crearon/modificaron:
- `.cursor/rules/backend-standards.mdc` - Regla específica para backend
- `.cursor/rules/engineering-standards.mdc` - Referencia al documento
- `memory-bank/systemPatterns.md` - Referencia al documento

---
```
