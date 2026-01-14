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

### 3. Flujo: Actualizar etapa de entrevista

**Actor**: Reclutador

**Precondiciones**:

-   Candidato existe
-   Aplicación existe para candidato y posición
-   Nueva etapa existe en flujo de entrevistas

**Pasos**:

1. **Usuario selecciona candidato**

    - Desde lista de candidatos por posición
    - O desde detalle de candidato

2. **Usuario actualiza etapa**

    - Selecciona nueva etapa de dropdown/select
    - Click en "Actualizar"

3. **Frontend envía**

    - `PUT /candidates/:id`
    - Body: `{ applicationId, currentInterviewStep }`

4. **Backend procesa**

    - `candidateRoutes` recibe request
    - `candidateController.updateCandidateStage()` invocado
    - `candidateService.updateCandidateStage()` ejecuta:
        - Busca aplicación por `applicationId` y `candidateId`
        - Valida que etapa existe en flujo
        - Actualiza `currentInterviewStep`
        - Guarda aplicación

5. **Respuesta**

    - Backend retorna 200 con aplicación actualizada
    - Incluye entrevistas asociadas con fechas y puntuaciones

6. **Frontend actualiza**
    - UI refleja nueva etapa
    - Usuario ve confirmación

**Casos de error**:

-   Aplicación no encontrada → Error 404
-   Etapa inválida → Error 400
-   Error de DB → Error 500

**Archivos involucrados**:

-   `backend/src/routes/candidateRoutes.ts`
-   `backend/src/presentation/controllers/candidateController.ts`
-   `backend/src/application/services/candidateService.ts`
-   `backend/src/domain/models/Application.ts`

---

### 4. Flujo: Subir CV

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

### 5. Flujo: Crear posición (backend existe, frontend no)

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

### 7. Flujo: Registrar entrevista (backend existe, frontend no)

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
