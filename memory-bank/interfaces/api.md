# API Documentation

## Base URL

**Desarrollo**: `http://localhost:3010`  
**Producción**: `UNKNOWN` (configurar via `REACT_APP_BACKEND_URL`)

## Autenticación

**Estado**: No implementada

Todas las rutas son públicas actualmente. Se requiere implementar autenticación para producción.

## Endpoints

### Candidatos

#### POST /candidates

Crea un nuevo candidato en el sistema.

**Request Body**:

```json
{
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan.perez@example.com",
    "phone": "612345678",
    "address": "Calle Ejemplo 123, Madrid",
    "educations": [
        {
            "institution": "Universidad Complutense",
            "title": "Ingeniería Informática",
            "startDate": "2015-09-01",
            "endDate": "2019-06-30"
        }
    ],
    "workExperiences": [
        {
            "company": "Tech Corp",
            "position": "Desarrollador Junior",
            "description": "Desarrollo de aplicaciones web",
            "startDate": "2019-07-01",
            "endDate": "2021-12-31"
        }
    ],
    "cv": {
        "filePath": "uploads/1234567890-cv.pdf",
        "fileType": "application/pdf"
    }
}
```

**Validaciones**:

-   `firstName`: 2-100 caracteres, solo letras y espacios
-   `lastName`: 2-100 caracteres, solo letras y espacios
-   `email`: Formato válido, único en sistema
-   `phone`: Formato español (6/7/9 seguido de 8 dígitos), opcional
-   `address`: Máximo 100 caracteres, opcional
-   `educations`: Array opcional, cada elemento requiere institution, title, startDate
-   `workExperiences`: Array opcional, cada elemento requiere company, position, startDate
-   `cv`: Objeto opcional con filePath y fileType

**Response 201**:

```json
{
  "id": 1,
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan.perez@example.com",
  "phone": "612345678",
  "address": "Calle Ejemplo 123, Madrid",
  "educations": [...],
  "workExperiences": [...],
  "resumes": [...]
}
```

**Response 400**:

```json
{
  "message": "Invalid email" | "The email already exists in the database" | "Invalid name"
}
```

**Response 500**:

```json
{
    "message": "An unexpected error occurred"
}
```

**Archivos**:

-   Route: `backend/src/routes/candidateRoutes.ts`
-   Controller: `backend/src/presentation/controllers/candidateController.ts`
-   Service: `backend/src/application/services/candidateService.ts`
-   Validator: `backend/src/application/validator.ts`

---

#### GET /candidates/:id

Obtiene un candidato por su ID con todas sus relaciones.

**Path Parameters**:

-   `id` (integer): ID del candidato

**Response 200**:

```json
{
  "id": 1,
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan.perez@example.com",
  "phone": "612345678",
  "address": "Calle Ejemplo 123, Madrid",
  "educations": [...],
  "workExperiences": [...],
  "resumes": [...],
  "applications": [
    {
      "id": 1,
      "position": {
        "id": 1,
        "title": "Desarrollador Senior"
      },
      "interviews": [
        {
          "interviewDate": "2024-01-15T10:00:00Z",
          "interviewStep": {
            "name": "Entrevista Técnica"
          },
          "score": 85,
          "notes": "Excelente conocimiento"
        }
      ]
    }
  ]
}
```

**Response 404**: Candidato no encontrado

**Archivos**:

-   Route: `backend/src/routes/candidateRoutes.ts`
-   Controller: `backend/src/presentation/controllers/candidateController.ts`
-   Service: `backend/src/application/services/candidateService.ts`

---

#### PUT /candidates/:id

Actualiza la etapa de entrevista de una aplicación específica de un candidato.

**Path Parameters**:

-   `id` (integer): ID del candidato

**Request Body**:

```json
{
    "applicationId": 1,
    "currentInterviewStep": 3
}
```

**Response 200**:

```json
{
    "message": "Candidate stage updated successfully",
    "data": {
        "id": 1,
        "positionId": 1,
        "candidateId": 1,
        "applicationDate": "2024-01-10T09:00:00Z",
        "currentInterviewStep": 3,
        "notes": null,
        "interviews": [
            {
                "interviewDate": "2024-01-15T10:00:00Z",
                "interviewStep": "Entrevista Técnica",
                "score": 85
            }
        ]
    }
}
```

**Response 400**: Datos inválidos  
**Response 404**: Candidato o aplicación no encontrada  
**Response 500**: Error interno

**Archivos**:

-   Route: `backend/src/routes/candidateRoutes.ts`
-   Controller: `backend/src/presentation/controllers/candidateController.ts`
-   Service: `backend/src/application/services/candidateService.ts`

---

### Posiciones

#### GET /position/:id/candidates

Obtiene todos los candidatos que aplicaron a una posición específica.

**Path Parameters**:

-   `id` (integer): ID de la posición

**Response 200**:

```json
[
    {
        "fullName": "Juan Pérez",
        "currentInterviewStep": "Entrevista Técnica",
        "averageScore": 85.5
    },
    {
        "fullName": "María García",
        "currentInterviewStep": "Entrevista Cultural",
        "averageScore": 92.0
    }
]
```

**Response 404**: Posición no encontrada  
**Response 500**: Error interno

**Archivos**:

-   Route: `backend/src/routes/positionRoutes.ts`
-   Controller: `backend/src/presentation/controllers/positionController.ts`

---

#### GET /position/:id/interviewflow

Obtiene el flujo de entrevistas asociado a una posición.

**Path Parameters**:

-   `id` (integer): ID de la posición

**Response 200**: `UNKNOWN` (endpoint detectado pero respuesta no analizada)

**Archivos**:

-   Route: `backend/src/routes/positionRoutes.ts`
-   Controller: `backend/src/presentation/controllers/positionController.ts`

---

### Archivos

#### POST /upload

Sube un archivo CV (PDF o DOCX) al servidor.

**Request**: `multipart/form-data`

**Form Data**:

-   `file` (file): Archivo PDF o DOCX, máximo 10MB

**Response 200**:

```json
{
    "filePath": "uploads/1234567890-cv.pdf",
    "fileType": "application/pdf"
}
```

**Response 400**:

```json
{
    "error": "Invalid file type, only PDF and DOCX are allowed!"
}
```

**Response 500**:

```json
{
    "error": "Error message"
}
```

**Validaciones**:

-   Tipo MIME: `application/pdf` o `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
-   Tamaño máximo: 10MB
-   Archivo guardado en: `../uploads/` (relativo al backend)

**Archivos**:

-   Route: `backend/src/index.ts` (línea 60)
-   Service: `backend/src/application/services/fileUploadService.ts`

---

## Especificación OpenAPI

**Ubicación**: `backend/api-spec.yaml`

Contiene especificación OpenAPI 3.0.0 con documentación detallada de endpoints.

**Nota**: Swagger UI está instalado pero no configurado en el código. Para habilitar:

1. Configurar swagger-jsdoc en `backend/src/index.ts`
2. Añadir ruta `/api-docs` para Swagger UI
3. Servir `api-spec.yaml` o generar desde código

## Códigos de estado HTTP

| Código | Significado           | Uso                                 |
| ------ | --------------------- | ----------------------------------- |
| 200    | OK                    | GET exitoso, PUT exitoso            |
| 201    | Created               | POST exitoso (candidato creado)     |
| 400    | Bad Request           | Validación fallida, datos inválidos |
| 404    | Not Found             | Recurso no encontrado               |
| 500    | Internal Server Error | Error del servidor                  |

## Manejo de errores

**Formato estándar**:

```json
{
    "message": "Descripción del error"
}
```

O:

```json
{
    "error": "Descripción del error"
}
```

**Inconsistencia detectada**: Algunos endpoints usan `message`, otros `error`.

## CORS

**Configuración**:

-   Orígenes permitidos: `CORS_ORIGIN` (variable de entorno)
-   Default: `http://localhost:3000`
-   Múltiples orígenes: Separados por coma
-   Credentials: Habilitado
-   Desarrollo: Permite requests sin origen

## Rate Limiting

**Estado**: No implementado

Se recomienda añadir rate limiting para producción.

## Versionado

**Estado**: No implementado

Todas las rutas están en la raíz (`/candidates`, `/upload`). Se recomienda versionar (`/api/v1/candidates`) para futuras versiones.

## Preguntas al humano

-   ¿Hay endpoints adicionales no documentados?
-   ¿Se requiere versionado de API?
-   ¿Qué estrategia de autenticación se planea usar?
-   ¿Hay límites de rate que se deben implementar?
-   ¿Se requiere documentación Swagger UI activa?
