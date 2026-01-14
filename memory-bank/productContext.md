# Product Context

## Why: Por qué existe

El sistema LTI existe para digitalizar y centralizar el proceso de reclutamiento, permitiendo a los equipos de RRHH:

-   Mantener un registro estructurado de todos los candidatos
-   Gestionar múltiples posiciones y sus flujos de entrevistas
-   Hacer seguimiento del progreso de cada candidato en tiempo real
-   Reducir la pérdida de información y mejorar la eficiencia del proceso de selección

## What: Cómo debería funcionar a alto nivel

### Flujo principal: Añadir candidato

1. **Reclutador accede al dashboard** (`/`)
2. **Navega a "Añadir Candidato"** (`/add-candidate`)
3. **Completa formulario** con:
    - Datos personales (nombre, apellido, email, teléfono, dirección)
    - Educación (múltiples entradas: institución, título, fechas)
    - Experiencia laboral (múltiples entradas: empresa, posición, descripción, fechas)
    - Subida de CV (PDF o DOCX, máx 10MB)
4. **Sistema valida** todos los campos según reglas de negocio
5. **Sistema guarda** candidato en base de datos con relaciones
6. **Sistema confirma** creación exitosa

### Flujo: Ver posiciones y candidatos

1. **Reclutador navega a "Posiciones"** (`/positions`)
2. **Sistema muestra** lista de posiciones disponibles
3. **Reclutador selecciona** una posición
4. **Sistema muestra**:
    - Detalles de la posición
    - Lista de candidatos que aplicaron
    - Estado actual de cada candidato (etapa de entrevista)
    - Puntuación promedio de entrevistas
5. **Reclutador puede actualizar** etapa de entrevista de un candidato

### Flujo: Actualizar etapa de candidato

1. **Reclutador selecciona** candidato en una posición
2. **Sistema muestra** información del candidato y aplicación
3. **Reclutador actualiza** `currentInterviewStep` de la aplicación
4. **Sistema valida** que la etapa existe en el flujo de entrevistas
5. **Sistema guarda** actualización
6. **Sistema confirma** cambio

## UX/Flujos principales

### Páginas/Componentes detectados

-   **`RecruiterDashboard`** (`/`): Dashboard principal con enlaces a funcionalidades
-   **`AddCandidateForm`** (`/add-candidate`): Formulario para añadir candidatos
-   **`Positions`** (`/positions`): Lista y gestión de posiciones
-   **`FileUploader`**: Componente para subir CVs

### Navegación

-   React Router detectado (`react-router-dom`)
-   Rutas principales:
    -   `/` → Dashboard
    -   `/add-candidate` → Formulario de candidato
    -   `/positions` → Lista de posiciones

### Estilos

-   **Bootstrap 5** + **React Bootstrap** para UI
-   **React Bootstrap Icons** para iconografía
-   CSS personalizado en `App.css` e `index.css`

## Casos borde / Riesgos de producto

### Validaciones críticas

1. **Email duplicado**: Sistema lanza error si se intenta crear candidato con email existente (constraint único en DB)
2. **Tipo de archivo**: Solo PDF y DOCX permitidos; otros tipos rechazados con error 400
3. **Tamaño de archivo**: Máximo 10MB; archivos mayores causan error
4. **Formato de teléfono**: Validación regex estricta (formato español: 6/7/9 seguido de 8 dígitos)
5. **Fechas**: Formato YYYY-MM-DD requerido; fechas inválidas rechazadas

### Riesgos detectados

1. **Sin autenticación**: Cualquiera puede acceder a la API si conoce la URL
2. **Ruta de uploads hardcodeada**: `../uploads/` puede no existir en producción
3. **CORS permisivo en desarrollo**: Permite requests sin origen en `NODE_ENV === 'development'`
4. **Manejo de errores genérico**: Algunos errores devuelven mensajes genéricos
5. **Sin paginación**: Listas de candidatos/posiciones pueden ser grandes sin límite

### Flujos incompletos detectados

-   **Creación de posiciones**: No hay interfaz detectada para crear posiciones (solo backend)
-   **Gestión de flujos de entrevistas**: No hay UI para crear/editar flujos
-   **Gestión de entrevistas**: No hay UI para registrar resultados de entrevistas
-   **Búsqueda/filtrado**: No hay funcionalidad de búsqueda de candidatos

## Preguntas al humano

-   ¿Cuál es el flujo completo esperado para publicar una nueva posición?
-   ¿Los candidatos pueden aplicar directamente o solo los reclutadores los añaden?
-   ¿Hay límites de negocio sobre cuántos candidatos pueden aplicar a una posición?
-   ¿Se requiere notificación por email cuando un candidato avanza de etapa?
-   ¿Hay integración planeada con sistemas de calendario para agendar entrevistas?
