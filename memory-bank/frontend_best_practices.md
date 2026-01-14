# Frontend Engineering Best Practices

> **Documento oficial de Buenas Prácticas de Frontend para LTI - Sistema de Seguimiento de Talento**
>
> Este documento define las convenciones, patrones y reglas que deben seguirse al desarrollar código frontend en este repositorio. Es la fuente de verdad para decisiones arquitectónicas, estructura de código, testing y calidad.

---

## 📌 Contexto del Frontend del Proyecto

### Qué hace el frontend

El frontend es una **SPA (Single Page Application)** construida con React que permite a los reclutadores:

-   Gestionar candidatos (añadir, ver, actualizar etapas de entrevista)
-   Ver y gestionar posiciones de trabajo
-   Subir CVs de candidatos (PDF/DOCX)
-   Seguir el progreso de candidatos en procesos de selección

**Usuarios**: Reclutadores (no hay interfaz para candidatos actualmente)

### Stack técnico real

-   **Framework**: React 18.3.1
-   **Lenguaje**: Mezcla de TypeScript 4.9.5 y JavaScript (inconsistencia detectada)
-   **Build tool**: Create React App (react-scripts 5.0.1)
-   **Routing**: React Router DOM 6.23.1
-   **UI Library**: Bootstrap 5.3.3 + React Bootstrap 2.10.2
-   **Icons**: React Bootstrap Icons 1.11.4
-   **Date picker**: React Datepicker 6.9.0
-   **HTTP Client**: Mezcla de `fetch` y `axios` (inconsistencia detectada)
-   **Testing**: Jest + React Testing Library (configurado pero sin tests implementados)

### Organización actual

```
frontend/src/
├── components/          # Componentes React (mezcla .js/.tsx)
│   ├── AddCandidateForm.js      # 447 líneas - VIOLACIÓN SRP
│   ├── FileUploader.js          # 68 líneas
│   ├── Positions.tsx            # 72 líneas (usa datos mock)
│   └── RecruiterDashboard.js    # 35 líneas
├── services/           # Servicios de API
│   └── candidateService.js      # Usa axios
├── config/             # Configuración
│   └── api.ts          # Configuración de endpoints
├── assets/            # Imágenes
├── App.js              # Router principal (App.tsx existe pero no se usa)
├── App.tsx             # Archivo no utilizado (template de CRA)
└── index.tsx           # Entry point
```

### Responsabilidades actuales (y problemas detectados)

**Estado actual**:

-   ❌ **Sin gestión de estado global**: Todo es estado local con `useState`
-   ❌ **Lógica de negocio en componentes**: Formateo de fechas, validación, transformación de datos dentro de componentes
-   ❌ **Componentes "god"**: `AddCandidateForm` tiene 447 líneas y múltiples responsabilidades
-   ❌ **Inconsistencia en HTTP clients**: `FileUploader` usa `fetch`, `candidateService` usa `axios`
-   ❌ **Datos mock en producción**: `Positions.tsx` usa datos hardcodeados
-   ❌ **Sin separación de capas**: UI, lógica de negocio y acceso a datos mezclados
-   ❌ **Sin tests**: No hay tests de componentes implementados
-   ❌ **Mezcla TypeScript/JavaScript**: Inconsistencia en type safety

---

## 🧭 Arquitectura Frontend y Límites de Responsabilidad

### Modelo arquitectónico objetivo

El frontend debe seguir una **arquitectura en capas** adaptada de Clean Architecture:

```
┌─────────────────────────────────────────┐
│         UI Layer (Presentación)          │
│  Componentes Presentacionales            │
│  - RecruiterDashboard                    │
│  - CandidateForm                         │
│  - PositionCard                          │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Features Layer (Casos de Uso)      │
│  Componentes Container / Hooks          │
│  - useCandidateForm                     │
│  - usePositions                         │
│  - useFileUpload                        │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Domain Layer (Tipos/Entidades)     │
│  - types/candidate.ts                   │
│  - types/position.ts                    │
│  - utils/validators.ts                  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│   Infrastructure Layer (Acceso Datos)  │
│  - services/apiClient.ts                │
│  - services/candidateService.ts         │
│  - adapters/candidateAdapter.ts         │
└─────────────────────────────────────────┘
```

### Estructura de carpetas recomendada

```
frontend/src/
├── ui/                          # Componentes presentacionales puros
│   ├── common/                  # Componentes reutilizables
│   │   ├── Button/
│   │   ├── Card/
│   │   └── Input/
│   └── layout/                  # Layout components
│       └── Container/
│
├── features/                     # Features organizadas por dominio
│   ├── candidates/
│   │   ├── components/          # Componentes específicos del feature
│   │   │   ├── CandidateForm/
│   │   │   └── CandidateCard/
│   │   ├── hooks/               # Hooks del feature
│   │   │   ├── useCandidateForm.ts
│   │   │   └── useCandidates.ts
│   │   └── types/               # Tipos específicos del feature
│   │       └── candidate.types.ts
│   │
│   └── positions/
│       ├── components/
│       ├── hooks/
│       └── types/
│
├── domain/                       # Tipos y lógica de dominio compartida
│   ├── types/                    # Tipos compartidos
│   │   ├── candidate.ts
│   │   └── position.ts
│   ├── validators/               # Validaciones de dominio
│   │   └── candidateValidators.ts
│   └── utils/                    # Utilidades de dominio
│       └── dateFormatters.ts
│
├── infrastructure/               # Acceso a datos y servicios externos
│   ├── api/                      # Cliente API
│   │   ├── apiClient.ts         # Cliente HTTP centralizado
│   │   ├── interceptors.ts      # Interceptores (auth, errors)
│   │   └── endpoints.ts         # Definición de endpoints
│   ├── services/                 # Servicios de API
│   │   ├── candidateService.ts
│   │   └── positionService.ts
│   └── adapters/                 # Adaptadores DTO ↔ Domain
│       ├── candidateAdapter.ts
│       └── positionAdapter.ts
│
├── config/                       # Configuración
│   ├── api.ts
│   └── constants.ts
│
└── App.tsx                       # Router y setup principal
```

### Reglas de importación y dependencias

**Regla fundamental**: Las dependencias solo pueden apuntar hacia abajo en las capas.

✅ **Permitido**:

-   `ui/` → `domain/` (para tipos)
-   `features/` → `domain/`, `infrastructure/`, `ui/`
-   `infrastructure/` → `domain/`

❌ **Prohibido**:

-   `domain/` → `infrastructure/` o `features/` o `ui/`
-   `infrastructure/` → `features/` o `ui/`
-   `ui/` → `features/` o `infrastructure/` (excepto hooks)

**Ejemplo de violación actual**:

```javascript
// ❌ AddCandidateForm.js - Importa directamente de config
import { API_CONFIG } from "../config/api";
// Luego usa fetch directamente en el componente
const res = await fetch(API_CONFIG.ENDPOINTS.CANDIDATES, {...});
```

**Cómo debería ser**:

```typescript
// ✅ AddCandidateForm.tsx - Usa hook que abstrae la lógica
import { useCandidateForm } from "../features/candidates/hooks/useCandidateForm";

const AddCandidateForm = () => {
    const { submitCandidate, isLoading, error } = useCandidateForm();
    // ...
};
```

---

## 🧩 Componentes: Diseño, Composición y Escalabilidad

### Componentes Presentacionales vs Container

**Presentacionales** (UI pura):

-   Reciben datos via props
-   Emiten eventos via callbacks
-   No conocen de dónde vienen los datos
-   Fáciles de testear
-   Reutilizables

**Container** (Lógica + UI):

-   Gestionan estado y side-effects
-   Llaman a servicios/hooks
-   Orquestan lógica de negocio
-   Conectan presentacionales con datos

**Regla**: Si un componente tiene más de 100 líneas o maneja estado complejo + llamadas a API, debe dividirse en Container + Presentacionales.

### Tamaño máximo y señales de "God Component"

**Límites recomendados**:

-   Componente presentacional: **< 100 líneas**
-   Componente container: **< 200 líneas**
-   Hook custom: **< 150 líneas**

**Señales de "God Component"** (refactorizar inmediatamente):

1. Más de 300 líneas
2. Más de 5 responsabilidades diferentes
3. Más de 10 estados locales (`useState`)
4. Maneja UI + lógica de negocio + llamadas API + validación
5. Imposible de testear unitariamente

**Ejemplo real de violación**:

```javascript
// ❌ AddCandidateForm.js - 447 líneas, múltiples responsabilidades
const AddCandidateForm = () => {
  // 1. Estado del formulario
  const [candidate, setCandidate] = useState({...});
  // 2. Estado de UI (error, success)
  const [error, setError] = useState("");
  // 3. Lógica de manejo de inputs
  const handleInputChange = (e, index, section) => {...};
  // 4. Lógica de fechas
  const handleDateChange = (date, index, section, field) => {...};
  // 5. Lógica de agregar/remover secciones
  const handleAddSection = (section) => {...};
  // 6. Lógica de formateo de datos
  // 7. Lógica de llamada a API
  const handleSubmit = async (e) => {...};
  // 8. Renderizado de UI complejo
  return (...447 líneas de JSX...);
};
```

**Refactorización recomendada**:

```typescript
// ✅ features/candidates/hooks/useCandidateForm.ts
export const useCandidateForm = () => {
    const [candidate, setCandidate] = useState<CandidateFormData>(initialState);
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const submitCandidate = async () => {
        // Lógica de envío
    };

    return { candidate, setCandidate, submitCandidate, error, isLoading };
};

// ✅ features/candidates/components/CandidateForm/CandidateForm.tsx
export const CandidateForm: React.FC<CandidateFormProps> = ({ onSubmit }) => {
    const form = useCandidateForm();
    // UI pura, delegando lógica al hook
};

// ✅ features/candidates/components/CandidateForm/EducationSection.tsx
export const EducationSection: React.FC<EducationSectionProps> = ({
    educations,
    onAdd,
    onRemove,
    onChange,
}) => {
    // Componente presentacional pequeño y reutilizable
};
```

### Convenciones de props, naming y eventos

**Props naming**:

-   Props de datos: sustantivos (`candidate`, `positions`)
-   Props de callbacks: prefijo `on` + verbo (`onSubmit`, `onChange`, `onDelete`)
-   Props booleanas: prefijo `is`/`has`/`should` (`isLoading`, `hasError`, `shouldValidate`)
-   Props de configuración: sustantivos descriptivos (`maxLength`, `placeholder`)

**Tipado de props (TypeScript)**:

```typescript
// ✅ Bien tipado
interface CandidateCardProps {
  candidate: Candidate;
  onSelect: (id: string) => void;
  isLoading?: boolean;
  className?: string;
}

// ❌ Props sin tipo o con `any`
const CandidateCard = ({ candidate, onSelect }: any) => {...};
```

**Eventos**:

-   Usar eventos nativos cuando sea posible (`onClick`, `onChange`)
-   Para eventos custom, usar objetos de evento tipados
-   Evitar pasar múltiples parámetros; usar objetos cuando sea necesario

```typescript
// ✅ Bueno
onSubmit={(data: CandidateFormData) => {...}}

// ❌ Evitar
onSubmit={(firstName, lastName, email, ...) => {...}}
```

### Hooks custom: cuándo crear y cómo nombrarlos

**Cuándo crear un hook custom**:

1. Lógica reutilizable entre componentes
2. Lógica compleja de estado que merece abstracción
3. Side-effects que se repiten (fetch, subscriptions)
4. Lógica de formularios compleja

**Naming**: Siempre prefijo `use` + sustantivo descriptivo

```typescript
// ✅ Buenos nombres
useCandidateForm;
usePositions;
useFileUpload;
useApiError;

// ❌ Malos nombres
candidateForm; // Falta prefijo use
useFetch; // Demasiado genérico
useStuff; // No descriptivo
```

**Qué pueden importar los hooks**:

-   ✅ `domain/` (tipos, validadores, utils)
-   ✅ `infrastructure/` (servicios, adapters)
-   ✅ Otros hooks de `features/`
-   ❌ NO deben importar componentes directamente

**Ejemplo de hook bien estructurado**:

```typescript
// ✅ features/candidates/hooks/useCandidates.ts
import { useState, useEffect } from "react";
import { Candidate } from "@/domain/types/candidate";
import { candidateService } from "@/infrastructure/services/candidateService";
import { candidateAdapter } from "@/infrastructure/adapters/candidateAdapter";

export const useCandidates = (positionId?: string) => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCandidates = async () => {
            setIsLoading(true);
            try {
                const data = await candidateService.getByPosition(positionId);
                setCandidates(data.map(candidateAdapter.toDomain));
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Error desconocido"
                );
            } finally {
                setIsLoading(false);
            }
        };

        if (positionId) {
            fetchCandidates();
        }
    }, [positionId]);

    return { candidates, isLoading, error };
};
```

---

## 🧠 Estado y Side Effects (State Management)

### Estado actual: Sin gestión global

**Estado actual detectado**:

-   Todo es estado local con `useState`
-   No hay Context API
-   No hay Redux/Zustand/Jotai
-   Estado duplicado entre componentes (ej: `Positions` y `RecruiterDashboard`)

### Estrategia recomendada

**Para este proyecto (escala pequeña-media)**:

1. **Estado local**: Para UI state (inputs, modales, toggles)
2. **Hooks custom**: Para lógica de datos compartida (fetch, cache básico)
3. **Context API (futuro)**: Solo si necesitamos estado global (auth, tema, preferencias)

**NO introducir Redux** a menos que:

-   Tengamos más de 10 features complejas
-   Necesitemos time-travel debugging
-   Tengamos estado compartido entre muchos componentes no relacionados

### Reglas para estado local vs global

**Estado local (`useState`)**:

-   Estado de formularios
-   Estado de UI (modales, dropdowns, toggles)
-   Estado temporal de componentes
-   Estado que no se comparte

**Estado "semi-global" (hooks custom)**:

-   Datos de API que se usan en varios componentes
-   Cache simple de datos
-   Estado de features específicas

**Estado global (Context API - futuro)**:

-   Autenticación (cuando se implemente)
-   Tema (si se añade dark mode)
-   Preferencias de usuario

### Caching y sincronización

**Problema actual**: Cada componente que necesita datos hace su propio fetch, sin cache.

**Solución recomendada**: Hooks custom con cache simple en memoria:

```typescript
// ✅ features/candidates/hooks/useCandidates.ts
// Cache simple en memoria (para MVP)
let candidatesCache: Candidate[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export const useCandidates = (positionId?: string, forceRefresh = false) => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const now = Date.now();
        const isCacheValid =
            !forceRefresh &&
            candidatesCache &&
            now - cacheTimestamp < CACHE_TTL;

        if (isCacheValid) {
            setCandidates(candidatesCache!);
            return;
        }

        // Fetch y actualizar cache
        // ...
        candidatesCache = fetchedCandidates;
        cacheTimestamp = now;
    }, [positionId, forceRefresh]);

    return { candidates, isLoading };
};
```

**Futuro (si escala)**: Considerar React Query o SWR para cache avanzado, invalidación, etc.

### Side-effects: fetch, subscriptions, websockets

**Regla**: Todos los side-effects deben estar en hooks custom o `useEffect`, nunca directamente en el cuerpo del componente.

**Estructura de `useEffect`**:

```typescript
// ✅ Estructura recomendada
useEffect(() => {
    // 1. Validación temprana
    if (!shouldFetch) return;

    // 2. Flag de loading
    setIsLoading(true);

    // 3. Función async
    const fetchData = async () => {
        try {
            const data = await service.getData();
            setData(data);
        } catch (error) {
            setError(handleError(error));
        } finally {
            setIsLoading(false);
        }
    };

    // 4. Ejecutar
    fetchData();

    // 5. Cleanup si aplica
    return () => {
        // Cancelar requests, limpiar subscriptions, etc.
    };
}, [dependencies]);
```

**Ejemplo de violación actual**:

```javascript
// ❌ AddCandidateForm.js - Fetch directamente en handler
const handleSubmit = async (e) => {
    e.preventDefault();
    // ... formateo de datos ...
    const res = await fetch(API_CONFIG.ENDPOINTS.CANDIDATES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(candidateData),
    });
    // ... manejo de respuesta ...
};
```

**Refactorización**:

```typescript
// ✅ Hook custom
export const useCandidateForm = () => {
    const submitCandidate = async (data: CandidateFormData) => {
        setIsLoading(true);
        try {
            const formatted = formatCandidateData(data);
            const candidate = await candidateService.create(formatted);
            return candidate;
        } catch (error) {
            throw new CandidateFormError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return { submitCandidate, isLoading };
};

// ✅ Componente usa el hook
const AddCandidateForm = () => {
    const { submitCandidate, isLoading } = useCandidateForm();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await submitCandidate(formData);
            // Success
        } catch (error) {
            // Error handling
        }
    };
};
```

### Manejo de loading/error

**Patrón estándar**:

```typescript
// ✅ Hook retorna estado completo
export const useCandidates = () => {
    const [state, setState] = useState<{
        data: Candidate[] | null;
        isLoading: boolean;
        error: string | null;
    }>({
        data: null,
        isLoading: false,
        error: null,
    });

    // ...

    return state;
};

// ✅ Componente consume estado
const CandidatesList = () => {
    const { data: candidates, isLoading, error } = useCandidates();

    if (isLoading) return <Spinner />;
    if (error) return <ErrorMessage message={error} />;
    if (!candidates) return <EmptyState />;

    return <CandidateList items={candidates} />;
};
```

**Evitar**:

-   ❌ Múltiples estados separados (`isLoading`, `error`, `data`) sin agrupar
-   ❌ Loading states inconsistentes entre componentes
-   ❌ Errores silenciados con `console.error` sin mostrar al usuario

---

## 🔌 Acceso a APIs, Adapters y Tipado

### Cliente API centralizado

**Problema actual**: Mezcla de `fetch` y `axios`, sin interceptor centralizado, sin manejo consistente de errores.

**Solución**: Cliente HTTP centralizado con interceptores.

```typescript
// ✅ infrastructure/api/apiClient.ts
import axios, { AxiosInstance, AxiosError } from "axios";
import { API_CONFIG } from "@/config/api";

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_CONFIG.BASE_URL,
            timeout: 10000,
            headers: {
                "Content-Type": "application/json",
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Request interceptor (ej: añadir token de auth)
        this.client.interceptors.request.use(
            (config) => {
                // const token = getAuthToken();
                // if (token) {
                //   config.headers.Authorization = `Bearer ${token}`;
                // }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor (manejo centralizado de errores)
        this.client.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                if (error.response) {
                    // Errores HTTP (4xx, 5xx)
                    const status = error.response.status;
                    const message = this.getErrorMessage(
                        status,
                        error.response.data
                    );
                    return Promise.reject(new ApiError(message, status));
                } else if (error.request) {
                    // Error de red
                    return Promise.reject(new ApiError("Error de conexión", 0));
                } else {
                    // Error de configuración
                    return Promise.reject(new ApiError("Error desconocido", 0));
                }
            }
        );
    }

    private getErrorMessage(status: number, data: any): string {
        // Lógica de mapeo de errores del backend
        if (data?.message) return data.message;
        switch (status) {
            case 400:
                return "Datos inválidos";
            case 401:
                return "No autorizado";
            case 404:
                return "Recurso no encontrado";
            case 500:
                return "Error del servidor";
            default:
                return "Error desconocido";
        }
    }

    async get<T>(url: string): Promise<T> {
        const response = await this.client.get<T>(url);
        return response.data;
    }

    async post<T>(url: string, data: any): Promise<T> {
        const response = await this.client.post<T>(url, data);
        return response.data;
    }

    async put<T>(url: string, data: any): Promise<T> {
        const response = await this.client.put<T>(url, data);
        return response.data;
    }

    async delete<T>(url: string): Promise<T> {
        const response = await this.client.delete<T>(url);
        return response.data;
    }

    // Para uploads
    async postFormData<T>(url: string, formData: FormData): Promise<T> {
        const response = await this.client.post<T>(url, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    }
}

export const apiClient = new ApiClient();
export class ApiError extends Error {
    constructor(message: string, public status: number) {
        super(message);
        this.name = "ApiError";
    }
}
```

### Servicios de API

**Estructura recomendada**:

```typescript
// ✅ infrastructure/services/candidateService.ts
import { apiClient } from "../api/apiClient";
import { CandidateDTO } from "../adapters/candidateAdapter";
import { Candidate } from "@/domain/types/candidate";

export const candidateService = {
    async create(data: CandidateDTO): Promise<Candidate> {
        return apiClient.post("/candidates", data);
    },

    async getById(id: string): Promise<Candidate> {
        return apiClient.get(`/candidates/${id}`);
    },

    async update(id: string, data: Partial<CandidateDTO>): Promise<Candidate> {
        return apiClient.put(`/candidates/${id}`, data);
    },

    async getByPosition(positionId: string): Promise<Candidate[]> {
        return apiClient.get(`/position/${positionId}/candidates`);
    },
};
```

### Adapters: DTO ↔ Domain

**Problema**: El backend devuelve DTOs que pueden no coincidir exactamente con nuestros tipos de dominio.

**Solución**: Adapters que transforman entre capas.

```typescript
// ✅ infrastructure/adapters/candidateAdapter.ts
import { Candidate } from "@/domain/types/candidate";

// DTO del backend (lo que realmente viene de la API)
export interface CandidateDTO {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    address: string | null;
    educations: EducationDTO[];
    workExperiences: WorkExperienceDTO[];
    cv: { filePath: string; fileType: string } | null;
}

// Adapter: DTO → Domain
export const candidateAdapter = {
    toDomain(dto: CandidateDTO): Candidate {
        return {
            id: String(dto.id), // Backend usa number, frontend usa string
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            phone: dto.phone ?? undefined,
            address: dto.address ?? undefined,
            educations: dto.educations.map(educationAdapter.toDomain),
            workExperiences: dto.workExperiences.map(
                workExperienceAdapter.toDomain
            ),
            cv: dto.cv
                ? {
                      filePath: dto.cv.filePath,
                      fileType: dto.cv.fileType,
                  }
                : undefined,
        };
    },

    toDTO(domain: Candidate): CandidateDTO {
        return {
            id: Number(domain.id),
            firstName: domain.firstName,
            lastName: domain.lastName,
            email: domain.email,
            phone: domain.phone ?? null,
            address: domain.address ?? null,
            educations: domain.educations.map(educationAdapter.toDTO),
            workExperiences: domain.workExperiences.map(
                workExperienceAdapter.toDTO
            ),
            cv: domain.cv
                ? {
                      filePath: domain.cv.filePath,
                      fileType: domain.cv.fileType,
                  }
                : null,
        };
    },
};
```

**Uso en servicios**:

```typescript
// ✅ Servicio usa adapter
export const candidateService = {
    async getById(id: string): Promise<Candidate> {
        const dto = await apiClient.get<CandidateDTO>(`/candidates/${id}`);
        return candidateAdapter.toDomain(dto);
    },

    async create(candidate: Candidate): Promise<Candidate> {
        const dto = candidateAdapter.toDTO(candidate);
        const response = await apiClient.post<CandidateDTO>("/candidates", dto);
        return candidateAdapter.toDomain(response);
    },
};
```

### Tipado TypeScript: DTOs vs Domain

**Regla**: Nunca usar tipos del backend directamente en componentes. Siempre usar tipos de dominio.

```typescript
// ✅ domain/types/candidate.ts
export interface Candidate {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    educations: Education[];
    workExperiences: WorkExperience[];
    cv?: {
        filePath: string;
        fileType: string;
    };
}

// ❌ NO hacer esto en componentes
import { CandidateDTO } from "@/infrastructure/adapters/candidateAdapter";
// Usar CandidateDTO directamente en UI
```

### Seguridad: tokens, almacenamiento, SSR/CSR

**Estado actual**: No hay autenticación implementada.

**Recomendaciones para cuando se implemente**:

1. **Tokens**: Almacenar en `httpOnly` cookies (mejor) o `localStorage` (alternativa)
2. **Interceptor**: Añadir token automáticamente en cada request
3. **Refresh token**: Implementar refresh automático antes de expiración
4. **Logout**: Limpiar tokens y redirigir

**Ejemplo de interceptor con auth (futuro)**:

```typescript
// ✅ infrastructure/api/apiClient.ts (futuro)
this.client.interceptors.request.use((config) => {
    const token = getAuthToken(); // Desde cookie o localStorage
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

this.client.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expirado, intentar refresh
            const refreshed = await refreshToken();
            if (refreshed) {
                // Reintentar request original
                return this.client.request(error.config);
            } else {
                // Refresh falló, logout
                logout();
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);
```

---

## 🎨 Estilos, Design System y Consistencia Visual

### Sistema de estilos actual

-   **Bootstrap 5.3.3**: Framework CSS base
-   **React Bootstrap 2.10.2**: Componentes React de Bootstrap
-   **CSS personalizado**: `App.css`, `index.css` (mínimo)
-   **Sin CSS Modules**: No detectado
-   **Sin Tailwind**: No detectado
-   **Sin styled-components**: No detectado

### Reglas de consistencia

**1. Usar componentes de React Bootstrap cuando existan**:

```typescript
// ✅ Usar componente de React Bootstrap
import { Button, Card, Container } from 'react-bootstrap';

<Button variant="primary">Enviar</Button>

// ❌ Evitar HTML nativo cuando hay equivalente
<button className="btn btn-primary">Enviar</button>
```

**2. Clases de Bootstrap para spacing y layout**:

```typescript
// ✅ Usar utilidades de Bootstrap
<Container className="mt-5">
    <Row>
        <Col md={6} className="mb-4">
            <Card className="shadow p-4">{/* ... */}</Card>
        </Col>
    </Row>
</Container>
```

**3. CSS personalizado solo para estilos específicos del proyecto**:

```css
/* ✅ App.css - Estilos específicos del proyecto */
.candidate-card {
    transition: transform 0.2s;
}

.candidate-card:hover {
    transform: translateY(-2px);
}

/* ❌ NO duplicar estilos que Bootstrap ya provee */
.btn-primary {
    background-color: blue; /* Bootstrap ya lo tiene */
}
```

**4. Variables CSS para tokens de diseño (futuro)**:

```css
/* ✅ index.css - Variables de diseño */
:root {
    --primary-color: #0d6efd;
    --secondary-color: #6c757d;
    --spacing-unit: 0.5rem;
    --border-radius: 0.375rem;
    --shadow-sm: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

/* Usar en componentes */
.custom-component {
    background-color: var(--primary-color);
    padding: var(--spacing-unit);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-sm);
}
```

### Accesibilidad (WCAG)

**Reglas obligatorias**:

1. **Labels en formularios**:

```typescript
// ✅ Siempre asociar label con input
<Form.Group>
  <Form.Label htmlFor="email">Correo Electrónico</Form.Label>
  <Form.Control id="email" type="email" />
</Form.Group>

// ❌ NO hacer esto
<Form.Control type="email" placeholder="Email" />
```

2. **Focus states visibles**:

```css
/* ✅ Asegurar que focus sea visible */
.btn:focus,
.form-control:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}
```

3. **Contraste de colores**: Mínimo 4.5:1 para texto normal, 3:1 para texto grande
4. **Navegación por teclado**: Todos los elementos interactivos deben ser accesibles con Tab
5. **ARIA labels cuando sea necesario**:

```typescript
// ✅ Para iconos sin texto
<Button aria-label="Eliminar candidato">
    <Trash />
</Button>
```

6. **Alt text en imágenes**:

```typescript
// ✅ Siempre incluir alt
<img src={logo} alt="LTI Logo" />

// ❌ NO hacer esto
<img src={logo} />
```

### Responsive design

**Usar sistema de grid de Bootstrap**:

```typescript
// ✅ Responsive con Bootstrap
<Row>
    <Col xs={12} md={6} lg={4}>
        {/* Se apila en móvil, 2 columnas en tablet, 3 en desktop */}
    </Col>
</Row>
```

**Breakpoints de Bootstrap**:

-   `xs`: < 576px (móvil)
-   `sm`: ≥ 576px (móvil grande)
-   `md`: ≥ 768px (tablet)
-   `lg`: ≥ 992px (desktop)
-   `xl`: ≥ 1200px (desktop grande)

---

## ⚡ Performance y Calidad (Core Web Vitals / UX)

### Hotspots típicos en este repo

**Problemas detectados**:

1. **Componente grande sin memoización**: `AddCandidateForm` se re-renderiza completamente en cada cambio
2. **Sin lazy loading**: Todos los componentes se cargan al inicio
3. **Sin code splitting**: Bundle único grande
4. **Datos mock en producción**: `Positions.tsx` no hace fetch real
5. **Sin virtualización**: Si hay listas largas, renderizarán todos los items

### Lazy loading y code splitting

**Implementar lazy loading de rutas**:

```typescript
// ✅ App.tsx - Lazy loading de rutas
import { lazy, Suspense } from "react";
import { Spinner } from "react-bootstrap";

const RecruiterDashboard = lazy(
    () => import("./features/dashboard/components/RecruiterDashboard")
);
const AddCandidateForm = lazy(
    () => import("./features/candidates/components/AddCandidateForm")
);
const Positions = lazy(
    () => import("./features/positions/components/Positions")
);

const App = () => {
    return (
        <BrowserRouter>
            <Suspense fallback={<Spinner animation="border" />}>
                <Routes>
                    <Route path="/" element={<RecruiterDashboard />} />
                    <Route
                        path="/add-candidate"
                        element={<AddCandidateForm />}
                    />
                    <Route path="/positions" element={<Positions />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
};
```

**Lazy loading de componentes pesados**:

```typescript
// ✅ Cargar DatePicker solo cuando se necesita
const DatePicker = lazy(() => import("react-datepicker"));

// En el componente
<Suspense fallback={<input type="date" />}>
    <DatePicker {...props} />
</Suspense>;
```

### Memoization

**Usar `React.memo` para componentes presentacionales**:

```typescript
// ✅ Componente memoizado
export const CandidateCard = React.memo<CandidateCardProps>(
    ({ candidate, onSelect }) => {
        return <Card onClick={() => onSelect(candidate.id)}>{/* ... */}</Card>;
    },
    (prevProps, nextProps) => {
        // Comparación custom si es necesario
        return prevProps.candidate.id === nextProps.candidate.id;
    }
);
```

**Usar `useMemo` para cálculos costosos**:

```typescript
// ✅ Memoizar lista filtrada
const filteredCandidates = useMemo(() => {
    return candidates.filter((c) =>
        c.firstName.toLowerCase().includes(searchTerm.toLowerCase())
    );
}, [candidates, searchTerm]);
```

**Usar `useCallback` para funciones pasadas como props**:

```typescript
// ✅ Memoizar callback
const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
}, []); // Dependencias vacías si no cambia

<CandidateCard candidate={c} onSelect={handleSelect} />;
```

### Virtualization para listas largas

**Si hay listas de más de 50 items, usar virtualización**:

```typescript
// ✅ Usar react-window o react-virtual
import { FixedSizeList } from "react-window";

const CandidateList = ({ candidates }) => {
    const Row = ({ index, style }) => (
        <div style={style}>
            <CandidateCard candidate={candidates[index]} />
        </div>
    );

    return (
        <FixedSizeList
            height={600}
            itemCount={candidates.length}
            itemSize={100}
            width="100%"
        >
            {Row}
        </FixedSizeList>
    );
};
```

### Bundle hygiene

**Reglas**:

1. **No importar librerías completas si solo necesitas una función**:

```typescript
// ❌ Importar toda la librería
import _ from 'lodash';
const filtered = _.filter(items, ...);

// ✅ Importar solo lo necesario
import filter from 'lodash/filter';
const filtered = filter(items, ...);
```

2. **Evitar dependencias pesadas innecesarias**:

    - Revisar `package.json` regularmente
    - Usar `npm audit` para detectar vulnerabilidades
    - Considerar alternativas más ligeras

3. **Tree shaking**: Asegurar que el bundler pueda hacer tree shaking:

```typescript
// ✅ Exportaciones nombradas (mejor para tree shaking)
export { candidateService } from "./candidateService";

// ⚠️ Exportaciones default (pueden impedir tree shaking)
export default candidateService;
```

### Imágenes y assets

**Optimización**:

1. **Comprimir imágenes antes de commit**
2. **Usar formatos modernos** (WebP cuando sea posible)
3. **Lazy loading de imágenes**:

```typescript
// ✅ Lazy loading nativo
<img src={logo} alt="Logo" loading="lazy" />
```

4. **Usar `srcset` para responsive images** (si aplica)

### Observabilidad en Frontend

**Error boundaries**:

```typescript
// ✅ Error boundary para capturar errores de React
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Enviar a servicio de logging (Sentry, etc.)
        console.error("Error capturado:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <ErrorMessage />;
        }
        return this.props.children;
    }
}

// Usar en App.tsx
<ErrorBoundary>
    <Routes>...</Routes>
</ErrorBoundary>;
```

**Logging estructurado** (futuro):

```typescript
// ✅ Logger centralizado
const logger = {
    error: (message: string, error?: Error, context?: object) => {
        console.error(message, { error, context, timestamp: new Date() });
        // Enviar a servicio de logging en producción
    },
    warn: (message: string, context?: object) => {
        console.warn(message, { context, timestamp: new Date() });
    },
    info: (message: string, context?: object) => {
        if (process.env.NODE_ENV === "development") {
            console.log(message, context);
        }
    },
};
```

---

## 🧪 Testing Strategy

### Estado actual

-   ✅ **Jest configurado**: Via Create React App
-   ✅ **React Testing Library instalado**: `@testing-library/react`, `@testing-library/user-event`
-   ❌ **Sin tests implementados**: No hay archivos `.test.js` o `.test.tsx` en el frontend

### Estrategia de testing (Pirámide)

```
        ┌─────────┐
        │   E2E   │  Pocos, críticos
        │  Tests  │
        ├─────────┤
       ╱│Integration│╲  Algunos, features
      ╱ │   Tests   │ ╲
     ╱  └───────────┘  ╲
    ╱                   ╲
   ╱  ┌─────────────────┐ ╲
  ╱   │  Unit Tests     │  ╲  Muchos, componentes/hooks
 ╱    │  (Components)   │   ╲
╱     └─────────────────┘    ╲
```

**Distribución recomendada**:

-   **70% Unit tests**: Componentes, hooks, utils
-   **20% Integration tests**: Flujos de features (formularios, listas)
-   **10% E2E tests**: Flujos críticos end-to-end

### Convenciones de testing

**Naming**:

-   Archivos: `*.test.tsx` o `*.test.js` (mismo nombre que el archivo testado)
-   Ubicación: Mismo directorio que el archivo testado
-   Describe blocks: Nombre del componente/hook
-   Test cases: `it('should ...')` o `test('...')`

**Estructura AAA (Arrange-Act-Assert)**:

```typescript
// ✅ Estructura AAA
describe("CandidateCard", () => {
    it("should render candidate information", () => {
        // Arrange
        const candidate: Candidate = {
            id: "1",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
        };

        // Act
        render(<CandidateCard candidate={candidate} onSelect={jest.fn()} />);

        // Assert
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });
});
```

### Testing de componentes

**Testing Library philosophy**: Testear comportamiento, no implementación.

```typescript
// ✅ Testear comportamiento (qué ve el usuario)
it("should call onSelect when card is clicked", () => {
    const onSelect = jest.fn();
    render(<CandidateCard candidate={mockCandidate} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("button"));

    expect(onSelect).toHaveBeenCalledWith(mockCandidate.id);
});

// ❌ NO testear implementación
it("should have useState hook", () => {
    // NO hacer esto
});
```

**Queries recomendadas (en orden de preferencia)**:

1. `getByRole` (mejor, accesible)
2. `getByLabelText` (formularios)
3. `getByText` (contenido visible)
4. `getByTestId` (último recurso)

```typescript
// ✅ Usar getByRole
const button = screen.getByRole("button", { name: /enviar/i });

// ⚠️ Evitar getByTestId a menos que sea necesario
const element = screen.getByTestId("submit-button");
```

### Testing de hooks

**Usar `@testing-library/react-hooks` o `renderHook` de RTL v13+**:

```typescript
// ✅ Test de hook
import { renderHook, act } from "@testing-library/react";
import { useCandidateForm } from "./useCandidateForm";

describe("useCandidateForm", () => {
    it("should initialize with empty form", () => {
        const { result } = renderHook(() => useCandidateForm());

        expect(result.current.candidate.firstName).toBe("");
        expect(result.current.candidate.lastName).toBe("");
    });

    it("should update candidate data", () => {
        const { result } = renderHook(() => useCandidateForm());

        act(() => {
            result.current.setCandidate({
                ...result.current.candidate,
                firstName: "John",
            });
        });

        expect(result.current.candidate.firstName).toBe("John");
    });
});
```

### Testing de servicios/API

**Mockear llamadas a API**:

```typescript
// ✅ Mock de axios o fetch
import { apiClient } from "@/infrastructure/api/apiClient";
jest.mock("@/infrastructure/api/apiClient");

describe("candidateService", () => {
    it("should create candidate", async () => {
        const mockCandidate = { id: "1", firstName: "John" };
        (apiClient.post as jest.Mock).mockResolvedValue(mockCandidate);

        const result = await candidateService.create(mockCandidate);

        expect(result).toEqual(mockCandidate);
        expect(apiClient.post).toHaveBeenCalledWith(
            "/candidates",
            mockCandidate
        );
    });
});
```

### Fixtures y mocks

**Crear fixtures reutilizables**:

```typescript
// ✅ tests/fixtures/candidates.ts
export const mockCandidate: Candidate = {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+34600123456",
    address: "123 Main St",
    educations: [],
    workExperiences: [],
};

export const mockCandidates: Candidate[] = [
    mockCandidate,
    { ...mockCandidate, id: "2", firstName: "Jane" },
];
```

### Definition of Done para Frontend

**Un cambio de frontend está completo cuando**:

1. ✅ **Código compila sin errores**: `npm run build` pasa
2. ✅ **Tests pasan**: `npm test` pasa (o cobertura mínima si se define)
3. ✅ **Linting pasa**: `npm run lint` (si está configurado)
4. ✅ **Funcionalidad probada manualmente**: En desarrollo local
5. ✅ **Accesibilidad básica**: Labels, alt text, focus states
6. ✅ **Responsive**: Probado en móvil y desktop (al menos visualmente)
7. ✅ **Sin console.errors**: Limpiar console.logs de debug antes de commit

**Cobertura mínima recomendada** (cuando se implemente):

-   **Componentes críticos**: 80%+
-   **Hooks**: 80%+
-   **Servicios**: 90%+
-   **Utils**: 90%+

---

## 🧱 Principios SOLID adaptados a Frontend

### SRP (Single Responsibility Principle)

**Regla**: Cada componente, hook o función debe tener una única razón para cambiar.

**Violación real encontrada**:

```javascript
// ❌ AddCandidateForm.js - Múltiples responsabilidades
const AddCandidateForm = () => {
  // 1. Gestión de estado del formulario
  const [candidate, setCandidate] = useState({...});

  // 2. Lógica de validación (debería estar en domain/validators)
  const handleSubmit = async (e) => {
    // Validación inline...
  };

  // 3. Formateo de datos (debería estar en adapters)
  candidateData.educations = candidateData.educations.map((education) => ({
    ...education,
    startDate: education.startDate.toISOString().slice(0, 10),
  }));

  // 4. Llamada a API (debería estar en servicio)
  const res = await fetch(API_CONFIG.ENDPOINTS.CANDIDATES, {...});

  // 5. Manejo de errores (debería estar centralizado)
  if (res.status === 400) {
    const errorData = await res.json();
    throw new Error("Datos inválidos: " + errorData.message);
  }

  // 6. Renderizado de UI complejo (447 líneas de JSX)
  return (...);
};
```

**Refactorización**:

```typescript
// ✅ Separación de responsabilidades

// 1. Validación en domain/validators
// domain/validators/candidateValidators.ts
export const validateCandidate = (
    candidate: CandidateFormData
): ValidationResult => {
    const errors: string[] = [];
    if (!candidate.firstName) errors.push("Nombre requerido");
    if (!candidate.email || !isValidEmail(candidate.email)) {
        errors.push("Email inválido");
    }
    return { isValid: errors.length === 0, errors };
};

// 2. Formateo en adapters
// infrastructure/adapters/candidateAdapter.ts
export const formatCandidateForAPI = (
    candidate: CandidateFormData
): CandidateDTO => {
    return {
        ...candidate,
        educations: candidate.educations.map(formatEducation),
        workExperiences: candidate.workExperiences.map(formatWorkExperience),
    };
};

// 3. Llamada a API en servicio
// infrastructure/services/candidateService.ts
export const candidateService = {
    async create(data: CandidateFormData): Promise<Candidate> {
        const validated = validateCandidate(data);
        if (!validated.isValid) {
            throw new ValidationError(validated.errors);
        }
        const dto = formatCandidateForAPI(data);
        return apiClient.post("/candidates", dto);
    },
};

// 4. Lógica de formulario en hook
// features/candidates/hooks/useCandidateForm.ts
export const useCandidateForm = () => {
    const [formData, setFormData] = useState<CandidateFormData>(initialState);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const submit = async () => {
        setIsLoading(true);
        try {
            await candidateService.create(formData);
            // Success
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setIsLoading(false);
        }
    };

    return { formData, setFormData, submit, error, isLoading };
};

// 5. UI pura en componente
// features/candidates/components/CandidateForm/CandidateForm.tsx
export const CandidateForm: React.FC = () => {
    const { formData, setFormData, submit, error, isLoading } =
        useCandidateForm();

    return (
        <Form onSubmit={submit}>{/* UI pura, sin lógica de negocio */}</Form>
    );
};
```

### OCP (Open/Closed Principle)

**Regla**: Abierto para extensión, cerrado para modificación.

**Ejemplo**: Componente de botón extensible.

```typescript
// ✅ Componente base extensible
interface ButtonProps {
    variant?: "primary" | "secondary" | "danger";
    size?: "sm" | "md" | "lg";
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
    variant = "primary",
    size = "md",
    children,
    className,
    onClick,
    ...rest
}) => {
    return (
        <button
            className={`btn btn-${variant} btn-${size} ${className || ""}`}
            onClick={onClick}
            {...rest}
        >
            {children}
        </button>
    );
};

// ✅ Extensión sin modificar el componente base
export const IconButton: React.FC<ButtonProps & { icon: React.ReactNode }> = ({
    icon,
    children,
    ...props
}) => {
    return (
        <Button {...props}>
            {icon}
            {children}
        </Button>
    );
};
```

### LSP (Liskov Substitution Principle)

**Regla**: Los componentes que implementan la misma interfaz deben ser intercambiables.

**Ejemplo**: Diferentes implementaciones de `FileUploader`:

```typescript
// ✅ Interfaz común
interface FileUploaderProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  maxSize?: number;
}

// ✅ Implementación básica
export const BasicFileUploader: React.FC<FileUploaderProps> = ({ onUpload, accept, maxSize }) => {
  // Implementación simple
};

// ✅ Implementación con drag & drop
export const DragDropFileUploader: React.FC<FileUploaderProps> = ({ onUpload, accept, maxSize }) => {
  // Implementación con drag & drop
};

// ✅ Ambas son intercambiables
<BasicFileUploader onUpload={handleUpload} />
<DragDropFileUploader onUpload={handleUpload} />
```

### ISP (Interface Segregation Principle)

**Regla**: No forzar a los componentes a depender de interfaces que no usan.

**Violación**:

```typescript
// ❌ Interfaz "gorda" que fuerza a implementar todo
interface FormComponentProps {
    onSubmit: () => void;
    onCancel: () => void;
    onReset: () => void;
    onValidate: () => boolean;
    onSave: () => void;
    onLoad: () => void;
    // ... muchas más
}

// Componente simple que solo necesita onSubmit
const SimpleForm: React.FC<FormComponentProps> = ({ onSubmit }) => {
    // Tiene que implementar todas las props aunque no las use
};
```

**Solución**:

```typescript
// ✅ Interfaces segregadas
interface FormSubmitProps {
    onSubmit: () => void;
}

interface FormCancelProps {
    onCancel: () => void;
}

interface FormResetProps {
    onReset: () => void;
}

// Componente solo depende de lo que necesita
const SimpleForm: React.FC<FormSubmitProps> = ({ onSubmit }) => {
    // Solo implementa lo necesario
};

// Componente complejo puede usar múltiples interfaces
const ComplexForm: React.FC<
    FormSubmitProps & FormCancelProps & FormResetProps
> = ({ onSubmit, onCancel, onReset }) => {
    // Implementa lo que necesita
};
```

### DIP (Dependency Inversion Principle)

**Regla**: Depender de abstracciones (interfaces), no de implementaciones concretas.

**Violación**:

```typescript
// ❌ Dependencia directa de implementación concreta
import { candidateService } from "@/infrastructure/services/candidateService";

const useCandidates = () => {
    const [candidates, setCandidates] = useState([]);

    useEffect(() => {
        candidateService.getAll().then(setCandidates); // Depende directamente de candidateService
    }, []);

    return { candidates };
};
```

**Solución**:

```typescript
// ✅ Depender de abstracción (interfaz)
interface CandidateRepository {
    getAll(): Promise<Candidate[]>;
    getById(id: string): Promise<Candidate>;
    create(candidate: Candidate): Promise<Candidate>;
}

// Hook depende de la interfaz, no de la implementación
const useCandidates = (repository: CandidateRepository) => {
    const [candidates, setCandidates] = useState([]);

    useEffect(() => {
        repository.getAll().then(setCandidates);
    }, [repository]);

    return { candidates };
};

// Inyección de dependencia
const candidateRepository: CandidateRepository = candidateService;
const { candidates } = useCandidates(candidateRepository);

// Fácil de testear con mock
const mockRepository: CandidateRepository = {
    getAll: jest.fn().mockResolvedValue([]),
};
const { candidates } = useCandidates(mockRepository);
```

---

## ♻ DRY y Reutilización

### Duplicaciones reales detectadas

**1. Manejo de errores duplicado**:

```javascript
// ❌ Duplicado en AddCandidateForm.js y FileUploader.js
catch (error) {
  const errorMessage = error.response?.data
    ? `Error: ${JSON.stringify(error.response.data)}`
    : `Error: ${error.message || 'Error desconocido'}`;
  throw new Error(errorMessage);
}
```

**Solución**:

```typescript
// ✅ infrastructure/utils/errorHandler.ts
export const handleApiError = (error: unknown): string => {
    if (error instanceof ApiError) {
        return error.message;
    }
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || "Error de conexión";
    }
    if (error instanceof Error) {
        return error.message;
    }
    return "Error desconocido";
};
```

**2. Formateo de fechas duplicado**:

```javascript
// ❌ Duplicado en AddCandidateForm.js
startDate: education.startDate.toISOString().slice(0, 10);
```

**Solución**:

```typescript
// ✅ domain/utils/dateFormatters.ts
export const formatDateForAPI = (date: Date | string): string => {
    if (typeof date === "string") return date;
    return date.toISOString().slice(0, 10);
};
```

**3. Lógica de loading/error duplicada**:

```typescript
// ❌ Patrón repetido en múltiples componentes
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
    setIsLoading(true);
    try {
        const data = await fetchData();
        setData(data);
    } catch (err) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
}, []);
```

**Solución**:

```typescript
// ✅ Hook genérico reutilizable
export const useAsync = <T>(
    asyncFunction: () => Promise<T>,
    dependencies: any[] = []
) => {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        asyncFunction()
            .then(setData)
            .catch((err) =>
                setError(
                    err instanceof Error ? err.message : "Error desconocido"
                )
            )
            .finally(() => setIsLoading(false));
    }, dependencies);

    return { data, isLoading, error };
};

// Uso
const {
    data: candidates,
    isLoading,
    error,
} = useAsync(() => candidateService.getAll(), []);
```

### Qué abstraer y qué no (YAGNI)

**Abstraer cuando**:

-   ✅ Se repite 3+ veces
-   ✅ La lógica es compleja y merece abstracción
-   ✅ Facilita testing
-   ✅ Reduce bugs por inconsistencia

**NO abstraer cuando**:

-   ❌ Solo se usa una vez (YAGNI)
-   ❌ La abstracción es más compleja que la duplicación
-   ❌ La "duplicación" es accidental (coincidencia, no verdadera duplicación)

**Ejemplo de sobre-abstracción**:

```typescript
// ❌ Abstracción innecesaria para un solo caso
const useFormField = <T>(initialValue: T) => {
    const [value, setValue] = useState(initialValue);
    return {
        value,
        setValue,
        onChange: (e: ChangeEvent<HTMLInputElement>) =>
            setValue(e.target.value),
    };
};

// ✅ Mejor usar useState directamente si solo se usa una vez
const [firstName, setFirstName] = useState("");
```

---

## 🧰 Patrones de Diseño en UI

### Patrones ya presentes (aunque mal implementados)

**1. Container/Presenter (parcialmente)**:

-   `AddCandidateForm` intenta ser container pero mezcla responsabilidades
-   `RecruiterDashboard` es presentacional puro (✅ bien)

**Refactorización recomendada**: Separar claramente en Container + Presenter.

**2. Adapter (implícito, no explícito)**:

-   Hay transformación de datos (fechas, estructura) pero no está centralizada
-   Debería estar en `infrastructure/adapters/`

### Patrones que deberían introducirse

**1. Factory Pattern (para crear componentes dinámicamente)**:

```typescript
// ✅ Factory para crear inputs según tipo
interface InputFactory {
    createInput(type: string, props: InputProps): React.ReactElement;
}

export const inputFactory: InputFactory = {
    createInput(type, props) {
        switch (type) {
            case "text":
                return <Form.Control type="text" {...props} />;
            case "email":
                return <Form.Control type="email" {...props} />;
            case "date":
                return <DatePicker {...props} />;
            default:
                return <Form.Control {...props} />;
        }
    },
};
```

**2. Strategy Pattern (para diferentes estrategias de validación)**:

```typescript
// ✅ Estrategias de validación
interface ValidationStrategy {
    validate(value: string): ValidationResult;
}

export const emailValidation: ValidationStrategy = {
    validate(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return {
            isValid: emailRegex.test(value),
            error: emailRegex.test(value) ? null : "Email inválido",
        };
    },
};

export const phoneValidation: ValidationStrategy = {
    validate(value) {
        const phoneRegex = /^[679]\d{8}$/;
        return {
            isValid: phoneRegex.test(value),
            error: phoneRegex.test(value) ? null : "Teléfono inválido",
        };
    },
};

// Uso
const validator = emailValidation;
const result = validator.validate(email);
```

**3. State Machine (para flujos complejos de UI)**:

```typescript
// ✅ State machine para formulario multi-paso
type FormState =
    | "idle"
    | "filling"
    | "validating"
    | "submitting"
    | "success"
    | "error";

interface FormStateMachine {
    state: FormState;
    transition(
        action: "start" | "validate" | "submit" | "success" | "error"
    ): void;
}

export const useFormStateMachine = (): FormStateMachine => {
    const [state, setState] = useState<FormState>("idle");

    const transition = (action: string) => {
        switch (state) {
            case "idle":
                if (action === "start") setState("filling");
                break;
            case "filling":
                if (action === "validate") setState("validating");
                break;
            case "validating":
                if (action === "submit") setState("submitting");
                break;
            // ... más transiciones
        }
    };

    return { state, transition };
};
```

**4. Compound Components (para componentes complejos)**:

```typescript
// ✅ Compound component para formulario de candidato
interface CandidateFormContextValue {
    formData: CandidateFormData;
    updateField: (field: string, value: any) => void;
}

const CandidateFormContext = createContext<CandidateFormContextValue | null>(
    null
);

export const CandidateForm: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [formData, setFormData] = useState<CandidateFormData>(initialState);

    const updateField = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <CandidateFormContext.Provider value={{ formData, updateField }}>
            {children}
        </CandidateFormContext.Provider>
    );
};

export const CandidateFormField: React.FC<{ name: string; label: string }> = ({
    name,
    label,
}) => {
    const { formData, updateField } = useContext(CandidateFormContext)!;

    return (
        <Form.Group>
            <Form.Label>{label}</Form.Label>
            <Form.Control
                value={formData[name]}
                onChange={(e) => updateField(name, e.target.value)}
            />
        </Form.Group>
    );
};

// Uso
<CandidateForm>
    <CandidateFormField name="firstName" label="Nombre" />
    <CandidateFormField name="lastName" label="Apellido" />
</CandidateForm>;
```

---

## 📋 Plantillas Before / After

### Ejemplo 1 – Violación de SRP en Componente

#### ❌ Antes

**Archivo**: `frontend/src/components/AddCandidateForm.js` (líneas 76-136)

```javascript
const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const candidateData = {
            ...candidate,
            cv: candidate.cv
                ? {
                      filePath: candidate.cv.filePath,
                      fileType: candidate.cv.fileType,
                  }
                : null,
        };

        // Formateo de fechas inline
        candidateData.educations = candidateData.educations.map(
            (education) => ({
                ...education,
                startDate: education.startDate
                    ? education.startDate.toISOString().slice(0, 10)
                    : "",
                endDate: education.endDate
                    ? education.endDate.toISOString().slice(0, 10)
                    : "",
            })
        );
        candidateData.workExperiences = candidateData.workExperiences.map(
            (experience) => ({
                ...experience,
                startDate: experience.startDate
                    ? experience.startDate.toISOString().slice(0, 10)
                    : "",
                endDate: experience.endDate
                    ? experience.endDate.toISOString().slice(0, 10)
                    : "",
            })
        );

        // Llamada a API directamente en componente
        const res = await fetch(API_CONFIG.ENDPOINTS.CANDIDATES, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(candidateData),
        });

        // Manejo de errores inline
        if (res.status === 201) {
            setSuccessMessage("Candidato añadido con éxito");
            setError("");
        } else if (res.status === 400) {
            const errorData = await res.json();
            throw new Error("Datos inválidos: " + errorData.message);
        } else if (res.status === 500) {
            throw new Error("Error interno del servidor");
        } else {
            throw new Error("Error al enviar datos del candidato");
        }
    } catch (error) {
        setError("Error al añadir candidato: " + error.message);
        setSuccessMessage("");
    }
};
```

#### ✅ Después

**Archivo**: `frontend/src/domain/utils/dateFormatters.ts`

```typescript
export const formatDateForAPI = (date: Date | string | null): string => {
    if (!date) return "";
    if (typeof date === "string") return date;
    return date.toISOString().slice(0, 10);
};
```

**Archivo**: `frontend/src/infrastructure/adapters/candidateAdapter.ts`

```typescript
import { formatDateForAPI } from "@/domain/utils/dateFormatters";
import { CandidateFormData, CandidateDTO } from "@/domain/types/candidate";

export const formatCandidateForAPI = (
    candidate: CandidateFormData
): CandidateDTO => {
    return {
        ...candidate,
        educations: candidate.educations.map((education) => ({
            ...education,
            startDate: formatDateForAPI(education.startDate),
            endDate: formatDateForAPI(education.endDate),
        })),
        workExperiences: candidate.workExperiences.map((experience) => ({
            ...experience,
            startDate: formatDateForAPI(experience.startDate),
            endDate: formatDateForAPI(experience.endDate),
        })),
        cv: candidate.cv
            ? {
                  filePath: candidate.cv.filePath,
                  fileType: candidate.cv.fileType,
              }
            : null,
    };
};
```

**Archivo**: `frontend/src/infrastructure/services/candidateService.ts`

```typescript
import { apiClient } from "../api/apiClient";
import { formatCandidateForAPI } from "../adapters/candidateAdapter";
import { CandidateFormData, Candidate } from "@/domain/types/candidate";

export const candidateService = {
    async create(data: CandidateFormData): Promise<Candidate> {
        const dto = formatCandidateForAPI(data);
        return apiClient.post<Candidate>("/candidates", dto);
    },
};
```

**Archivo**: `frontend/src/features/candidates/hooks/useCandidateForm.ts`

```typescript
import { useState } from "react";
import { candidateService } from "@/infrastructure/services/candidateService";
import { CandidateFormData } from "@/domain/types/candidate";

export const useCandidateForm = () => {
    const [formData, setFormData] = useState<CandidateFormData>(initialState);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const submit = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await candidateService.create(formData);
            setSuccessMessage("Candidato añadido con éxito");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Error al añadir candidato"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return { formData, setFormData, submit, error, successMessage, isLoading };
};
```

**Archivo**: `frontend/src/features/candidates/components/CandidateForm/CandidateForm.tsx`

```typescript
import { useCandidateForm } from "../../hooks/useCandidateForm";

export const CandidateForm: React.FC = () => {
    const { formData, setFormData, submit, error, successMessage, isLoading } =
        useCandidateForm();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await submit();
    };

    return (
        <Form onSubmit={handleSubmit}>
            {/* UI pura, sin lógica de negocio */}
            {error && <Alert variant="danger">{error}</Alert>}
            {successMessage && (
                <Alert variant="success">{successMessage}</Alert>
            )}
            {/* ... campos del formulario ... */}
            <Button type="submit" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Enviar"}
            </Button>
        </Form>
    );
};
```

#### Por qué esto es mejor

1. **Separación de responsabilidades**: Cada archivo tiene una única responsabilidad
2. **Testeable**: Cada función puede testearse de forma aislada
3. **Reutilizable**: `formatDateForAPI` puede usarse en otros lugares
4. **Mantenible**: Cambios en formato de fecha solo afectan un archivo
5. **Type-safe**: TypeScript previene errores en tiempo de compilación
6. **Consistente**: Manejo de errores centralizado en `apiClient`

---

### Ejemplo 2 – Inconsistencia en HTTP Client

#### ❌ Antes

**Archivo**: `frontend/src/components/FileUploader.js` (líneas 17-42)

```javascript
const handleFileUpload = async () => {
    if (file) {
        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            // Usa fetch directamente
            const res = await fetch(API_CONFIG.ENDPOINTS.UPLOAD, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                throw new Error("Error al subir archivo");
            }

            const fileData = await res.json();
            setFileData(fileData);
            onUpload(fileData);
        } catch (error) {
            console.error("Error al subir archivo:", error);
        } finally {
            setLoading(false);
        }
    }
};
```

**Archivo**: `frontend/src/services/candidateService.js` (líneas 4-25)

```javascript
import axios from "axios";

export const uploadCV = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
        // Usa axios
        const response = await axios.post(
            API_CONFIG.ENDPOINTS.UPLOAD,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data
            ? `Error al subir el archivo: ${JSON.stringify(
                  error.response.data
              )}`
            : `Error al subir el archivo: ${
                  error.message || "Error desconocido"
              }`;
        throw new Error(errorMessage);
    }
};
```

#### ✅ Después

**Archivo**: `frontend/src/infrastructure/api/apiClient.ts`

```typescript
class ApiClient {
    // ... (ver sección de API Client más arriba)

    async postFormData<T>(url: string, formData: FormData): Promise<T> {
        const response = await this.client.post<T>(url, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    }
}
```

**Archivo**: `frontend/src/infrastructure/services/fileService.ts`

```typescript
import { apiClient } from "../api/apiClient";

export interface FileUploadResult {
    filePath: string;
    fileType: string;
}

export const fileService = {
    async upload(file: File): Promise<FileUploadResult> {
        const formData = new FormData();
        formData.append("file", file);
        return apiClient.postFormData<FileUploadResult>("/upload", formData);
    },
};
```

**Archivo**: `frontend/src/features/candidates/hooks/useFileUpload.ts`

```typescript
import { useState } from "react";
import { fileService } from "@/infrastructure/services/fileService";

export const useFileUpload = () => {
    const [file, setFile] = useState<File | null>(null);
    const [fileData, setFileData] = useState<FileUploadResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const upload = async () => {
        if (!file) return;

        setIsLoading(true);
        setError(null);
        try {
            const result = await fileService.upload(file);
            setFileData(result);
            return result;
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Error al subir archivo";
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { file, setFile, upload, fileData, isLoading, error };
};
```

**Archivo**: `frontend/src/ui/common/FileUploader/FileUploader.tsx`

```typescript
import { useFileUpload } from "@/features/candidates/hooks/useFileUpload";

interface FileUploaderProps {
    onUpload: (fileData: FileUploadResult) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUpload }) => {
    const { file, setFile, upload, fileData, isLoading, error } =
        useFileUpload();

    const handleUpload = async () => {
        try {
            const result = await upload();
            if (result) onUpload(result);
        } catch {
            // Error ya manejado en el hook
        }
    };

    return (
        <div>
            <InputGroup>
                <FormControl
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <Button onClick={handleUpload} disabled={isLoading || !file}>
                    {isLoading ? <Spinner size="sm" /> : "Subir Archivo"}
                </Button>
            </InputGroup>
            {error && <Alert variant="danger">{error}</Alert>}
            {fileData && (
                <Alert variant="success">Archivo subido con éxito</Alert>
            )}
        </div>
    );
};
```

#### Por qué esto es mejor

1. **Consistencia**: Un solo cliente HTTP (`apiClient`) para todas las llamadas
2. **Manejo de errores centralizado**: Interceptores manejan errores de forma consistente
3. **Reutilizable**: `fileService` puede usarse desde cualquier componente
4. **Testeable**: Fácil de mockear `apiClient` en tests
5. **Type-safe**: TypeScript previene errores
6. **Mantenible**: Cambios en la API solo afectan `apiClient`

---

### Ejemplo 3 – Datos Mock en Producción

#### ❌ Antes

**Archivo**: `frontend/src/components/Positions.tsx` (líneas 11-15, 47)

```typescript
const mockPositions: Position[] = [
    {
        title: "Senior Backend Engineer",
        manager: "John Doe",
        deadline: "2024-12-31",
        status: "Abierto",
    },
    {
        title: "Junior Android Engineer",
        manager: "Jane Smith",
        deadline: "2024-11-15",
        status: "Contratado",
    },
    {
        title: "Product Manager",
        manager: "Alex Jones",
        deadline: "2024-07-31",
        status: "Borrador",
    },
];

const Positions: React.FC = () => {
    return (
        <Container className="mt-5">
            {/* ... */}
            {mockPositions.map((position, index) => (
                <Col md={4} key={index} className="mb-4">
                    {/* Renderiza datos mock */}
                </Col>
            ))}
        </Container>
    );
};
```

#### ✅ Después

**Archivo**: `frontend/src/infrastructure/services/positionService.ts`

```typescript
import { apiClient } from "../api/apiClient";
import { Position } from "@/domain/types/position";

export const positionService = {
    async getAll(): Promise<Position[]> {
        return apiClient.get<Position[]>("/positions");
    },

    async getById(id: string): Promise<Position> {
        return apiClient.get<Position>(`/positions/${id}`);
    },
};
```

**Archivo**: `frontend/src/features/positions/hooks/usePositions.ts`

```typescript
import { useState, useEffect } from "react";
import { positionService } from "@/infrastructure/services/positionService";
import { Position } from "@/domain/types/position";

export const usePositions = () => {
    const [positions, setPositions] = useState<Position[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPositions = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await positionService.getAll();
                setPositions(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Error al cargar posiciones"
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchPositions();
    }, []);

    return { positions, isLoading, error };
};
```

**Archivo**: `frontend/src/features/positions/components/Positions/Positions.tsx`

```typescript
import { usePositions } from "../../hooks/usePositions";
import { PositionCard } from "./PositionCard";
import { Spinner, Alert } from "react-bootstrap";

export const Positions: React.FC = () => {
    const { positions, isLoading, error } = usePositions();

    if (isLoading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" />
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    if (positions.length === 0) {
        return (
            <Container className="mt-5">
                <Alert variant="info">No hay posiciones disponibles</Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <h2 className="text-center mb-4">Posiciones</h2>
            <Row>
                {positions.map((position) => (
                    <Col md={4} key={position.id} className="mb-4">
                        <PositionCard position={position} />
                    </Col>
                ))}
            </Row>
        </Container>
    );
};
```

#### Por qué esto es mejor

1. **Datos reales**: La aplicación muestra datos reales del backend
2. **Estados de carga**: Maneja loading, error y empty states apropiadamente
3. **Reutilizable**: `usePositions` puede usarse en otros componentes
4. **Testeable**: Fácil de testear con mocks de `positionService`
5. **Mantenible**: Cambios en la API solo afectan el servicio

---

## 📚 Referencias y Recursos

### Documentación oficial

-   [React Documentation](https://react.dev/)
-   [React Testing Library](https://testing-library.com/react)
-   [TypeScript Handbook](https://www.typescriptlang.org/docs/)
-   [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.3/)
-   [React Bootstrap](https://react-bootstrap.github.io/)

### Patrones y arquitectura

-   [Clean Architecture (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
-   [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
-   [React Patterns](https://reactpatterns.com/)

### Performance

-   [React Performance Optimization](https://react.dev/learn/render-and-commit)
-   [Web Vitals](https://web.dev/vitals/)

### Accesibilidad

-   [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
-   [React A11y](https://github.com/evcohen/eslint-plugin-jsx-a11y)

---

## 🔄 Mantenimiento de este Documento

Este documento debe actualizarse cuando:

1. Se introducen nuevos patrones o convenciones
2. Se cambia el stack técnico (nuevas librerías, frameworks)
3. Se refactoriza arquitectura significativamente
4. Se descubren nuevas violaciones o problemas
5. Se establecen nuevas reglas del equipo

**Última actualización**: 2026-01-14  
**Mantenido por**: Equipo de Frontend  
**Revisión recomendada**: Cada 3 meses o después de cambios arquitectónicos significativos
