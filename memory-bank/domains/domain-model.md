# Domain Model

## Entidades principales

### Candidate (Candidato)

**Descripción**: Representa a una persona que puede aplicar a posiciones.

**Atributos**:

-   `id`: Identificador único (autoincrement)
-   `firstName`: Nombre (VarChar(100), requerido)
-   `lastName`: Apellido (VarChar(100), requerido)
-   `email`: Email (VarChar(255), único, requerido)
-   `phone`: Teléfono (VarChar(15), opcional)
-   `address`: Dirección (VarChar(100), opcional)

**Relaciones**:

-   `educations`: Lista de `Education` (uno a muchos)
-   `workExperiences`: Lista de `WorkExperience` (uno a muchos)
-   `resumes`: Lista de `Resume` (uno a muchos)
-   `applications`: Lista de `Application` (uno a muchos)

**Reglas de negocio**:

-   Email debe ser único en el sistema
-   Email debe tener formato válido (validado con regex)
-   Nombre y apellido: 2-100 caracteres, solo letras y espacios

**Ubicación**: `backend/src/domain/models/Candidate.ts`

### Position (Posición)

**Descripción**: Representa una oferta de trabajo.

**Atributos**:

-   `id`: Identificador único
-   `companyId`: ID de la empresa (FK)
-   `interviewFlowId`: ID del flujo de entrevistas (FK)
-   `title`: Título de la posición
-   `description`: Descripción breve
-   `status`: Estado (default: "Draft")
-   `isVisible`: Visible públicamente (default: false)
-   `location`: Ubicación
-   `jobDescription`: Descripción completa del trabajo
-   `requirements`: Requisitos (opcional)
-   `responsibilities`: Responsabilidades (opcional)
-   `salaryMin`: Salario mínimo (opcional)
-   `salaryMax`: Salario máximo (opcional)
-   `employmentType`: Tipo de empleo (opcional)
-   `benefits`: Beneficios (opcional)
-   `companyDescription`: Descripción de la empresa (opcional)
-   `applicationDeadline`: Fecha límite de aplicación (opcional)
-   `contactInfo`: Información de contacto (opcional)

**Relaciones**:

-   `company`: `Company` (muchos a uno)
-   `interviewFlow`: `InterviewFlow` (muchos a uno)
-   `applications`: Lista de `Application` (uno a muchos)

**Reglas de negocio**:

-   Debe pertenecer a una empresa
-   Debe tener un flujo de entrevistas asociado
-   Estado puede ser: "Draft", "Published", "Closed" (inferido, no validado)

**Ubicación**: `backend/src/domain/models/Position.ts`

### Application (Aplicación)

**Descripción**: Representa la aplicación de un candidato a una posición.

**Atributos**:

-   `id`: Identificador único
-   `positionId`: ID de la posición (FK)
-   `candidateId`: ID del candidato (FK)
-   `applicationDate`: Fecha de aplicación
-   `currentInterviewStep`: ID de la etapa actual (FK)
-   `notes`: Notas adicionales (opcional)

**Relaciones**:

-   `position`: `Position` (muchos a uno)
-   `candidate`: `Candidate` (muchos a uno)
-   `interviewStep`: `InterviewStep` (muchos a uno)
-   `interviews`: Lista de `Interview` (uno a muchos)

**Reglas de negocio**:

-   Un candidato puede aplicar a múltiples posiciones
-   Debe tener una etapa de entrevista actual
-   `applicationDate` se establece automáticamente al crear

**Ubicación**: `backend/src/domain/models/Application.ts`

### Interview (Entrevista)

**Descripción**: Representa una entrevista realizada a un candidato.

**Atributos**:

-   `id`: Identificador único
-   `applicationId`: ID de la aplicación (FK)
-   `interviewStepId`: ID de la etapa de entrevista (FK)
-   `employeeId`: ID del empleado que realiza la entrevista (FK)
-   `interviewDate`: Fecha de la entrevista
-   `result`: Resultado (opcional)
-   `score`: Puntuación (opcional, 0-100 probablemente)
-   `notes`: Notas de la entrevista (opcional)

**Relaciones**:

-   `application`: `Application` (muchos a uno)
-   `interviewStep`: `InterviewStep` (muchos a uno)
-   `employee`: `Employee` (muchos a uno)

**Reglas de negocio**:

-   Debe estar asociada a una aplicación
-   Debe estar en una etapa específica del flujo
-   Debe tener un empleado asignado

**Ubicación**: `backend/src/domain/models/Interview.ts`

## Entidades de soporte

### Education (Educación)

**Descripción**: Educación formal de un candidato.

**Atributos**:

-   `id`: Identificador único
-   `candidateId`: ID del candidato (FK)
-   `institution`: Institución (VarChar(100))
-   `title`: Título obtenido (VarChar(250))
-   `startDate`: Fecha de inicio
-   `endDate`: Fecha de fin (opcional)

**Ubicación**: `backend/src/domain/models/Education.ts`

### WorkExperience (Experiencia Laboral)

**Descripción**: Experiencia laboral de un candidato.

**Atributos**:

-   `id`: Identificador único
-   `candidateId`: ID del candidato (FK)
-   `company`: Nombre de la empresa (VarChar(100))
-   `position`: Posición ocupada (VarChar(100))
-   `description`: Descripción (VarChar(200), opcional)
-   `startDate`: Fecha de inicio
-   `endDate`: Fecha de fin (opcional)

**Ubicación**: `backend/src/domain/models/WorkExperience.ts`

### Resume (CV)

**Descripción**: Archivo CV de un candidato.

**Atributos**:

-   `id`: Identificador único
-   `candidateId`: ID del candidato (FK)
-   `filePath`: Ruta del archivo (VarChar(500))
-   `fileType`: Tipo MIME (VarChar(50))
-   `uploadDate`: Fecha de subida

**Reglas de negocio**:

-   Solo PDF y DOCX permitidos
-   Máximo 10MB

**Ubicación**: `backend/src/domain/models/Resume.ts`

### Company (Empresa)

**Descripción**: Empresa que ofrece posiciones.

**Atributos**:

-   `id`: Identificador único
-   `name`: Nombre (único)

**Relaciones**:

-   `employees`: Lista de `Employee` (uno a muchos)
-   `positions`: Lista de `Position` (uno a muchos)

**Ubicación**: `backend/src/domain/models/Company.ts`

### Employee (Empleado)

**Descripción**: Empleado de una empresa que puede realizar entrevistas.

**Atributos**:

-   `id`: Identificador único
-   `companyId`: ID de la empresa (FK)
-   `name`: Nombre
-   `email`: Email (único)
-   `role`: Rol
-   `isActive`: Activo (default: true)

**Relaciones**:

-   `company`: `Company` (muchos a uno)
-   `interviews`: Lista de `Interview` (uno a muchos)

**Ubicación**: `backend/src/domain/models/Employee.ts`

### InterviewFlow (Flujo de Entrevistas)

**Descripción**: Flujo de entrevistas reutilizable para posiciones.

**Atributos**:

-   `id`: Identificador único
-   `description`: Descripción (opcional)

**Relaciones**:

-   `interviewSteps`: Lista de `InterviewStep` (uno a muchos)
-   `positions`: Lista de `Position` (uno a muchos)

**Ubicación**: `backend/src/domain/models/InterviewFlow.ts`

### InterviewStep (Etapa de Entrevista)

**Descripción**: Etapa específica dentro de un flujo de entrevistas.

**Atributos**:

-   `id`: Identificador único
-   `interviewFlowId`: ID del flujo (FK)
-   `interviewTypeId`: ID del tipo de entrevista (FK)
-   `name`: Nombre de la etapa
-   `orderIndex`: Orden en el flujo

**Relaciones**:

-   `interviewFlow`: `InterviewFlow` (muchos a uno)
-   `interviewType`: `InterviewType` (muchos a uno)
-   `applications`: Lista de `Application` (uno a muchos)
-   `interviews`: Lista de `Interview` (uno a muchos)

**Reglas de negocio**:

-   `orderIndex` determina el orden de las etapas

**Ubicación**: `backend/src/domain/models/InterviewStep.ts`

### InterviewType (Tipo de Entrevista)

**Descripción**: Tipo de entrevista (técnica, cultural, etc.).

**Atributos**:

-   `id`: Identificador único
-   `name`: Nombre del tipo
-   `description`: Descripción (opcional)

**Relaciones**:

-   `interviewSteps`: Lista de `InterviewStep` (uno a muchos)

**Ubicación**: `backend/src/domain/models/InterviewType.ts`

## Agregados (Aggregates)

### Candidate Aggregate

**Root**: `Candidate`

**Entidades incluidas**:

-   Candidate (root)
-   Education
-   WorkExperience
-   Resume

**Reglas de consistencia**:

-   Education, WorkExperience y Resume no pueden existir sin Candidate
-   Al eliminar Candidate, se eliminan sus entidades relacionadas (cascade)

### Application Aggregate

**Root**: `Application`

**Entidades incluidas**:

-   Application (root)
-   Interview

**Reglas de consistencia**:

-   Interview no puede existir sin Application
-   Application debe tener un `currentInterviewStep` válido

## Value Objects (si aplican)

No se detectaron Value Objects explícitos en el código actual. Posibles candidatos:

-   `Email`: Validación y normalización
-   `PhoneNumber`: Formato y validación
-   `DateRange`: Para Education y WorkExperience

## Servicios de dominio

No se detectaron servicios de dominio explícitos. Posibles candidatos:

-   `CandidateEmailService`: Validar unicidad de email
-   `InterviewFlowService`: Validar orden de etapas
-   `ApplicationProgressService`: Calcular progreso de aplicación

## Preguntas al humano

-   ¿Hay reglas de negocio adicionales que no están implementadas?
-   ¿Se requiere soft delete (eliminación lógica) en lugar de hard delete?
-   ¿Hay campos calculados que deberían ser parte del modelo?
-   ¿Se requiere auditoría de cambios (created_at, updated_at, created_by)?
