# Key Flows

## Flujos principales del sistema

### 1. Flujo: Añadir nuevo candidato

**Actor**: Reclutador

**Precondiciones**:

-   Backend y frontend corriendo
-   Base de datos accesible
-   Usuario en dashboard

**Pasos**:

1. **Usuario navega a formulario**

    - Click en "Añadir Nuevo Candidato" en dashboard
    - React Router navega a `/add-candidate`
    - `AddCandidateForm` se renderiza

2. **Usuario completa datos personales**

    - Nombre, apellido, email, teléfono, dirección
    - Validación en frontend (si implementada)

3. **Usuario añade educación**

    - Click en "Añadir Educación"
    - Completa: institución, título, fechas
    - Puede añadir múltiples entradas

4. **Usuario añade experiencia laboral**

    - Click en "Añadir Experiencia"
    - Completa: empresa, posición, descripción, fechas
    - Puede añadir múltiples entradas

5. **Usuario sube CV**

    - Click en "Subir CV"
    - `FileUploader` muestra selector de archivo
    - Selecciona PDF o DOCX (máx 10MB)
    - Archivo se sube a `/upload` endpoint
    - Recibe `filePath` y `fileType`

6. **Usuario envía formulario**

    - Click en "Guardar"
    - `AddCandidateForm` llama `candidateService.addCandidate()`
    - Datos se envían a `POST /candidates`

7. **Backend procesa**

    - `candidateRoutes` recibe request
    - `candidateController.addCandidate()` invocado
    - `candidateService.addCandidate()` ejecuta:
        - `validator.validateCandidateData()` valida todos los campos
        - `new Candidate(data)` crea instancia
        - `candidate.save()` persiste en DB
        - Si hay educación/experiencia/CV, se crean relaciones

8. **Respuesta**
    - Backend retorna 201 con candidato creado
    - Frontend muestra confirmación
    - Usuario puede ver candidato o añadir otro

**Casos de error**:

-   Email duplicado → Error 400: "The email already exists"
-   Archivo inválido → Error 400: "Invalid file type"
-   Validación falla → Error 400 con mensaje específico
-   Error de DB → Error 500

**Archivos involucrados**:

-   `frontend/src/components/AddCandidateForm.js`
-   `frontend/src/components/FileUploader.js`
-   `frontend/src/services/candidateService.js`
-   `backend/src/routes/candidateRoutes.ts`
-   `backend/src/presentation/controllers/candidateController.ts`
-   `backend/src/application/services/candidateService.ts`
-   `backend/src/application/validator.ts`
-   `backend/src/domain/models/Candidate.ts`

---

### 2. Flujo: Ver candidatos por posición

**Actor**: Reclutador

**Precondiciones**:

-   Posición existe en sistema
-   Candidatos han aplicado a la posición

**Pasos**:

1. **Usuario navega a posiciones**

    - Click en "Ir a Posiciones" en dashboard
    - React Router navega a `/positions`
    - `Positions` component se renderiza

2. **Sistema carga posiciones**

    - `Positions` llama API (endpoint no detectado, probablemente `GET /positions`)
    - Lista de posiciones se muestra

3. **Usuario selecciona posición**

    - Click en una posición
    - `Positions` llama `GET /position/:id/candidates`

4. **Backend procesa**

    - `positionRoutes` recibe request
    - `positionController.getCandidatesByPosition()` invocado
    - `positionService` (o similar) consulta:
        - Aplicaciones de la posición
        - Candidatos asociados
        - Etapa actual de cada aplicación
        - Puntuación promedio de entrevistas

5. **Respuesta**

    - Backend retorna lista con:
        - `fullName`: Nombre completo del candidato
        - `currentInterviewStep`: Nombre de la etapa actual
        - `averageScore`: Puntuación promedio

6. **Frontend muestra**
    - Lista de candidatos con su estado
    - Usuario puede ver detalles o actualizar etapa

**Archivos involucrados**:

-   `frontend/src/components/Positions.tsx`
-   `backend/src/routes/positionRoutes.ts`
-   `backend/src/presentation/controllers/positionController.ts`

---

### 3. Flujo: Ver detalle de posición con Kanban

**Actor**: Reclutador

**Precondiciones**:

-   Posición existe en sistema
-   Posición tiene `interviewFlow` configurado
-   Candidatos han aplicado a la posición

**Pasos**:

1. **Usuario navega a posiciones**

    - Click en "Ir a Posiciones" en dashboard
    - React Router navega a `/positions`
    - `Positions` component se renderiza

2. **Usuario selecciona posición**

    - Click en botón "Ver proceso" de una posición
    - React Router navega a `/positions/:id`
    - `PositionPage` se renderiza

3. **Sistema carga datos**

    - `usePositionData` hook se ejecuta
    - Carga en paralelo:
        - `GET /position/:id/interviewflow` → `fetchInterviewFlow()`
        - `GET /position/:id/candidates` → `fetchCandidates()`

4. **Normalización de datos**

    - `createStepMap()`: Crea mapa `stepName → stepId`
    - `sortSteps()`: Ordena steps por `orderIndex` (fallback por `id`)
    - `groupCandidatesByStep()`: Agrupa candidatos por `stepId`

5. **Renderizado del Kanban**

    - `PositionKanban` renderiza columnas (una por cada `InterviewStep`)
    - `KanbanColumn` renderiza candidatos en cada columna
    - `CandidateCard` muestra nombre y puntuación de cada candidato

6. **Usuario ve Kanban**
    - Columnas ordenadas por `orderIndex`
    - Candidatos agrupados en columnas correctas
    - Header muestra título de posición y botón "volver"

**Casos de error**:

-   Posición no encontrada → Error 404
-   Sin `interviewFlow` → Alert: "No hay etapas configuradas"
-   Error de red → Alert rojo con mensaje de error

**Archivos involucrados**:

-   `frontend/src/features/positions/pages/PositionPage.tsx`
-   `frontend/src/features/positions/components/PositionKanban.tsx`
-   `frontend/src/features/positions/components/KanbanColumn.tsx`
-   `frontend/src/features/positions/components/CandidateCard.tsx`
-   `frontend/src/features/positions/hooks/usePositionData.ts`
-   `frontend/src/infrastructure/services/positionService.ts`
-   `frontend/src/features/positions/utils/positionUtils.ts`
-   `backend/src/routes/positionRoutes.ts`
-   `backend/src/presentation/controllers/positionController.ts`

---

### 4. Flujo: Actualizar etapa de entrevista (Drag & Drop)

**Actor**: Reclutador

**Precondiciones**:

-   Usuario está en página Position (`/positions/:id`)
-   Kanban está cargado y visible
-   Candidato existe en una columna
-   Nueva etapa existe en flujo de entrevistas

**Pasos**:

1. **Usuario inicia drag**

    - Click y arrastra tarjeta de candidato (`CandidateCard`)
    - `@dnd-kit` detecta inicio de drag
    - Tarjeta se vuelve semi-transparente (opacity 0.5)
    - Cursor cambia a "grabbing"

2. **Usuario arrastra sobre otra columna**

    - Pasa tarjeta sobre `KanbanColumn` diferente
    - `useDroppable` detecta hover
    - Columna se resalta (borde azul, fondo claro)

3. **Usuario suelta tarjeta**

    - `handleDragEnd` se ejecuta en `PositionKanban`
    - Extrae `candidateId` y `newStepId` del evento

4. **Optimistic Update**

    - `handleMoveCandidate` en `PositionPage` se ejecuta
    - Guarda estado anterior para rollback
    - Actualiza `candidatesByStep` inmediatamente:
        - Remueve candidato de columna antigua
        - Añade candidato a columna nueva
    - UI se actualiza instantáneamente

5. **Llamada a API**

    - `useUpdateCandidateStage.updateStage()` se ejecuta
    - Envía `PUT /candidates/:id`
    - Body: `{ applicationId: number, currentInterviewStep: number }`
    - `currentInterviewStep` es el **ID numérico** del step (no el nombre)

6. **Backend procesa**

    - `candidateRoutes` recibe request
    - `candidateController.updateCandidateStageController()` invocado
    - `candidateService.updateCandidateStage()` ejecuta:
        - Busca aplicación por `applicationId` y `candidateId`
        - Valida que etapa existe en flujo
        - Actualiza `currentInterviewStep` (ID numérico)
        - Guarda aplicación

7. **Respuesta**

    - **Si éxito (200)**:
        - Optimistic update se mantiene (ya está actualizado)
        - No hay cambio visual adicional
    - **Si error (400/404/500)**:
        - Rollback automático: `candidatesByStep` vuelve a estado anterior
        - Alert rojo muestra mensaje de error
        - Candidato vuelve a columna original

8. **Bloqueo durante actualización**

    - Flag `isUpdating` bloquea nuevos drags
    - `CandidateCard` se deshabilita (`isDisabled={isUpdating}`)
    - Evita múltiples actualizaciones simultáneas

**Casos de error**:

-   Candidato no encontrado → Rollback + Error: "Candidato no encontrado"
-   Etapa no válida → Rollback + Error: "Etapa no válida"
-   Aplicación no encontrada → Rollback + Error 404
-   Error de red → Rollback + Error: "Error al actualizar la etapa"
-   Mover a misma columna → No se envía petición (early return)

**Archivos involucrados**:

-   `frontend/src/features/positions/pages/PositionPage.tsx`
-   `frontend/src/features/positions/components/PositionKanban.tsx`
-   `frontend/src/features/positions/components/KanbanColumn.tsx`
-   `frontend/src/features/positions/components/CandidateCard.tsx`
-   `frontend/src/features/positions/hooks/useUpdateCandidateStage.ts`
-   `frontend/src/infrastructure/services/candidateService.ts`
-   `backend/src/routes/candidateRoutes.ts`
-   `backend/src/presentation/controllers/candidateController.ts`
-   `backend/src/application/services/candidateService.ts`

---

### 5. Flujo: Subir CV

**Actor**: Reclutador

**Precondiciones**:

-   Formulario de candidato abierto
-   Archivo CV disponible

**Pasos**:

1. **Usuario selecciona archivo**

    - Click en "Subir CV" o selector de archivo
    - `FileUploader` muestra file picker

2. **Validación en frontend** (si implementada)

    - Tipo de archivo (PDF o DOCX)
    - Tamaño (máx 10MB)

3. **Frontend sube archivo**

    - `FileUploader` crea `FormData`
    - Envía `POST /upload` con archivo

4. **Backend procesa**

    - `fileUploadService.uploadFile()` ejecuta:
        - Multer valida tipo (PDF o DOCX)
        - Multer valida tamaño (10MB)
        - Guarda en `../uploads/` con nombre único
        - Retorna `{ filePath, fileType }`

5. **Frontend recibe**
    - `filePath` y `fileType` se almacenan en estado
    - Se incluyen en datos del candidato al guardar

**Casos de error**:

-   Tipo inválido → Error 400: "Invalid file type, only PDF and DOCX are allowed"
-   Tamaño excedido → Error 500 (Multer error)
-   Error de escritura → Error 500

**Archivos involucrados**:

-   `frontend/src/components/FileUploader.js`
-   `backend/src/index.ts` (ruta `/upload`)
-   `backend/src/application/services/fileUploadService.ts`

---

## Flujos no implementados (detectados en modelos)

### 6. Flujo: Crear posición (backend existe, frontend no)

**Estado**: Backend tiene modelos y probablemente servicios, pero no hay UI detectada.

**Flujo esperado**:

1. Reclutador completa formulario de posición
2. Selecciona empresa (o crea nueva)
3. Selecciona flujo de entrevistas (o crea nuevo)
4. Guarda posición
5. Posición disponible para recibir aplicaciones

### 6. Flujo: Crear flujo de entrevistas (backend existe, frontend no)

**Estado**: Modelos `InterviewFlow`, `InterviewStep`, `InterviewType` existen, pero no hay UI.

**Flujo esperado**:

1. Reclutador crea nuevo flujo
2. Añade etapas en orden
3. Selecciona tipo de entrevista para cada etapa
4. Guarda flujo
5. Flujo disponible para asignar a posiciones

### 8. Flujo: Registrar entrevista (backend existe, frontend no)

**Estado**: Modelo `Interview` existe, pero no hay UI para crear entrevistas.

**Flujo esperado**:

1. Reclutador selecciona aplicación
2. Selecciona etapa de entrevista
3. Selecciona empleado que realiza entrevista
4. Completa: fecha, resultado, puntuación, notas
5. Guarda entrevista
6. Sistema actualiza estadísticas de aplicación

## Preguntas al humano

-   ¿Cuál es el flujo completo esperado para publicar una posición?
-   ¿Los candidatos pueden aplicar directamente o solo reclutadores los añaden?
-   ¿Hay notificaciones por email cuando un candidato avanza de etapa?
-   ¿Se requiere integración con calendario para agendar entrevistas?
-   ¿Hay flujos de aprobación antes de publicar posiciones?
