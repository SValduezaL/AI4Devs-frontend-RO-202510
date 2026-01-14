# Backend Engineering Best Practices

> **Documento oficial de Buenas Prácticas de Backend para LTI - Sistema de Seguimiento de Talento**
>
> Este documento define las convenciones, patrones y reglas que deben seguirse al desarrollar código backend en este repositorio. Es la fuente de verdad para decisiones arquitectónicas, modelado de dominio, APIs, testing y seguridad.

---

## 📌 Contexto del Backend del Proyecto

### Qué hace el sistema

El backend es una **API REST** construida con Express y TypeScript que gestiona:

-   **Candidatos**: Creación, consulta y actualización de candidatos con sus datos personales, educación, experiencia laboral y CVs
-   **Posiciones**: Gestión de ofertas de trabajo y sus flujos de entrevistas
-   **Aplicaciones**: Relación entre candidatos y posiciones, seguimiento de etapas de entrevista
-   **Entrevistas**: Registro de resultados de entrevistas y puntuaciones
-   **Archivos**: Subida y gestión de CVs (PDF/DOCX)

**Dominio**: Sistema de reclutamiento y seguimiento de talento (ATS - Applicant Tracking System)

### Stack técnico real

-   **Runtime**: Node.js
-   **Lenguaje**: TypeScript 5.4.5
-   **Framework**: Express 4.19.2
-   **ORM**: Prisma 5.13.0
-   **Base de datos**: PostgreSQL (Docker)
-   **File upload**: Multer 1.4.5-lts.1
-   **Testing**: Jest 29.7.0 + ts-jest
-   **Linting**: ESLint 9.2.0 + Prettier 3.2.5

### Arquitectura actual detectada

**Estructura existente**:

```
backend/src/
├── domain/
│   └── models/          # Entidades de dominio (10 modelos)
│       ├── Candidate.ts
│       ├── Position.ts
│       ├── Education.ts
│       └── ...
├── application/
│   ├── services/        # Servicios de aplicación
│   │   ├── candidateService.ts
│   │   ├── positionService.ts
│   │   └── fileUploadService.ts
│   └── validator.ts     # Validación centralizada
├── presentation/
│   └── controllers/     # Controladores HTTP
│       ├── candidateController.ts
│       └── positionController.ts
├── routes/              # Definición de rutas Express
│   ├── candidateRoutes.ts
│   └── positionRoutes.ts
└── index.ts             # Entry point (Express app setup)
```

**Estilo arquitectónico**: DDD (Domain-Driven Design) parcialmente implementado

### Responsabilidades actuales (y problemas detectados)

**Estado actual**:

-   ✅ **Separación en capas**: Existe estructura domain/application/presentation
-   ❌ **Violación de DIP**: Modelos de dominio usan `PrismaClient` directamente
-   ❌ **Violación de SRP**: Servicios de aplicación tienen múltiples responsabilidades
-   ❌ **Sin transacciones**: Operaciones multi-entidad no son atómicas
-   ❌ **Inconsistencia**: Algunos servicios usan modelos, otros usan Prisma directo
-   ❌ **Validación mezclada**: Validación en `application/` pero llamada desde servicios
-   ❌ **Manejo de errores inconsistente**: Mezcla de `Error`, códigos HTTP y mensajes genéricos
-   ❌ **Acoplamiento fuerte**: `fileUploadService` acoplado a Express y rutas hardcodeadas
-   ❌ **Rutas duplican lógica**: Manejo de errores duplicado entre rutas y controllers
-   ❌ **Tests incompletos**: Solo tests unitarios parciales, sin tests de integración

---

## 🧭 Arquitectura Backend y Límites de Capas

### Modelo arquitectónico objetivo

El backend debe seguir **Clean Architecture / Hexagonal Architecture** con DDD:

```
┌─────────────────────────────────────────┐
│      Presentation Layer (Interfaces)     │
│  Controllers, DTOs, Request/Response      │
│  - candidateController.ts                 │
│  - positionController.ts                 │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│     Application Layer (Use Cases)         │
│  Services, Validators, Orchestration      │
│  - candidateService.ts                   │
│  - positionService.ts                    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│        Domain Layer (Business Logic)      │
│  Entities, Value Objects, Domain Services │
│  - Candidate.ts (Entity)                   │
│  - Position.ts (Entity)                   │
│  - CandidateRepository (Port/Interface)    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│   Infrastructure Layer (Adapters)        │
│  Prisma, Repositories, External APIs     │
│  - PrismaCandidateRepository.ts          │
│  - FileStorageAdapter.ts                 │
└─────────────────────────────────────────┘
```

### Estructura de carpetas recomendada

```
backend/src/
├── domain/                          # Capa de dominio (DDD)
│   ├── entities/                    # Entidades de dominio
│   │   ├── Candidate.ts
│   │   ├── Position.ts
│   │   └── ...
│   ├── value-objects/                # Value Objects
│   │   ├── Email.ts
│   │   └── Phone.ts
│   ├── repositories/                 # Interfaces (puertos)
│   │   ├── ICandidateRepository.ts
│   │   └── IPositionRepository.ts
│   ├── services/                     # Domain Services
│   │   └── CandidateDomainService.ts
│   └── exceptions/                   # Excepciones de dominio
│       ├── DomainException.ts
│       └── CandidateNotFoundException.ts
│
├── application/                      # Capa de aplicación
│   ├── use-cases/                   # Casos de uso
│   │   ├── candidates/
│   │   │   ├── CreateCandidateUseCase.ts
│   │   │   ├── GetCandidateByIdUseCase.ts
│   │   │   └── UpdateCandidateStageUseCase.ts
│   │   └── positions/
│   │       └── GetCandidatesByPositionUseCase.ts
│   ├── validators/                   # Validadores de aplicación
│   │   └── candidateValidator.ts
│   └── dto/                          # Data Transfer Objects
│       ├── CreateCandidateDTO.ts
│       └── CandidateResponseDTO.ts
│
├── infrastructure/                   # Capa de infraestructura
│   ├── persistence/                  # Repositorios (adapters)
│   │   ├── prisma/
│   │   │   ├── PrismaCandidateRepository.ts
│   │   │   └── PrismaPositionRepository.ts
│   │   └── PrismaService.ts         # Cliente Prisma singleton
│   ├── storage/                      # Almacenamiento de archivos
│   │   ├── FileStorageAdapter.ts
│   │   └── LocalFileStorage.ts
│   └── config/                       # Configuración
│       └── database.ts
│
├── presentation/                     # Capa de presentación
│   ├── controllers/                  # Controladores HTTP
│   │   ├── candidateController.ts
│   │   └── positionController.ts
│   ├── dto/                          # DTOs de presentación
│   │   └── request/
│   └── middleware/                   # Middleware Express
│       ├── errorHandler.ts
│       └── validationMiddleware.ts
│
├── routes/                           # Definición de rutas
│   ├── candidateRoutes.ts
│   └── positionRoutes.ts
│
└── index.ts                          # Entry point
```

### Reglas de dependencias entre capas

**Regla fundamental**: Las dependencias solo pueden apuntar hacia adentro (hacia el dominio).

✅ **Permitido**:

-   `presentation/` → `application/`, `domain/`
-   `application/` → `domain/`
-   `infrastructure/` → `domain/` (implementa interfaces de domain)

❌ **Prohibido**:

-   `domain/` → `application/`, `infrastructure/`, `presentation/`
-   `application/` → `infrastructure/` (debe usar interfaces de domain)
-   `presentation/` → `infrastructure/` (debe pasar por application)

**Ejemplo de violación actual**:

```typescript
// ❌ domain/models/Candidate.ts - Importa Prisma directamente
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class Candidate {
    async save() {
        return await prisma.candidate.create({...}); // Depende de infraestructura
    }
}
```

**Cómo debería ser**:

```typescript
// ✅ domain/repositories/ICandidateRepository.ts - Interfaz en dominio
export interface ICandidateRepository {
    save(candidate: Candidate): Promise<Candidate>;
    findById(id: number): Promise<Candidate | null>;
}

// ✅ domain/entities/Candidate.ts - Entidad pura
export class Candidate {
    // Solo lógica de negocio, sin persistencia
}

// ✅ infrastructure/persistence/prisma/PrismaCandidateRepository.ts - Implementación
import { ICandidateRepository } from "@/domain/repositories/ICandidateRepository";
export class PrismaCandidateRepository implements ICandidateRepository {
    async save(candidate: Candidate): Promise<Candidate> {
        // Implementación con Prisma
    }
}
```

---

## 🧩 Domain-Driven Design (DDD)

### Entidades vs Value Objects

**Entidades**: Tienen identidad única (ID) y pueden cambiar de estado.

```typescript
// ✅ domain/entities/Candidate.ts - Entidad
export class Candidate {
    private readonly _id?: number;
    private _firstName: string;
    private _lastName: string;
    private _email: Email; // Value Object
    private _phone?: Phone; // Value Object

    constructor(
        id: number | undefined,
        firstName: string,
        lastName: string,
        email: Email
    ) {
        this._id = id;
        this._firstName = firstName;
        this._lastName = lastName;
        this._email = email;
    }

    // Getters
    get id(): number | undefined {
        return this._id;
    }
    get email(): Email {
        return this._email;
    }

    // Lógica de negocio
    updateEmail(newEmail: Email): void {
        if (this._email.equals(newEmail)) {
            throw new Error("New email must be different");
        }
        this._email = newEmail;
    }

    getFullName(): string {
        return `${this._firstName} ${this._lastName}`;
    }
}
```

**Value Objects**: Inmutables, definidos por sus valores, sin identidad.

```typescript
// ✅ domain/value-objects/Email.ts - Value Object
export class Email {
    private readonly _value: string;

    constructor(value: string) {
        if (!this.isValid(value)) {
            throw new Error("Invalid email format");
        }
        this._value = value.toLowerCase().trim();
    }

    get value(): string {
        return this._value;
    }

    private isValid(email: string): boolean {
        const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return EMAIL_REGEX.test(email);
    }

    equals(other: Email): boolean {
        return this._value === other._value;
    }

    toString(): string {
        return this._value;
    }
}
```

### Aggregates y Aggregate Roots

**Regla**: Un Aggregate es un cluster de entidades y value objects que se trata como una unidad.

**Aggregate Root**: La entidad principal que controla el acceso al aggregate.

```typescript
// ✅ Candidate es Aggregate Root
export class Candidate {
    private _educations: Education[] = [];
    private _workExperiences: WorkExperience[] = [];

    // Solo el Aggregate Root puede modificar sus entidades relacionadas
    addEducation(education: Education): void {
        // Validación de negocio
        if (this._educations.length >= 10) {
            throw new Error("Maximum 10 educations allowed");
        }
        this._educations.push(education);
    }

    removeEducation(educationId: number): void {
        const index = this._educations.findIndex((e) => e.id === educationId);
        if (index === -1) {
            throw new Error("Education not found");
        }
        this._educations.splice(index, 1);
    }
}
```

### Domain Services vs Application Services

**Domain Services**: Lógica de negocio que no pertenece a una entidad específica.

```typescript
// ✅ domain/services/CandidateDomainService.ts
export class CandidateDomainService {
    static canApplyToPosition(
        candidate: Candidate,
        position: Position
    ): boolean {
        // Lógica de negocio que involucra múltiples entidades
        if (position.status !== "Open") {
            return false;
        }
        if (candidate.hasActiveApplicationFor(position.id)) {
            return false;
        }
        return true;
    }
}
```

**Application Services**: Orquestan casos de uso, coordinan entre dominio e infraestructura.

```typescript
// ✅ application/use-cases/candidates/CreateCandidateUseCase.ts
export class CreateCandidateUseCase {
    constructor(
        private candidateRepository: ICandidateRepository,
        private validator: CandidateValidator
    ) {}

    async execute(dto: CreateCandidateDTO): Promise<Candidate> {
        // 1. Validar
        this.validator.validate(dto);

        // 2. Crear entidad de dominio
        const email = new Email(dto.email);
        const candidate = new Candidate(
            undefined,
            dto.firstName,
            dto.lastName,
            email
        );

        // 3. Persistir (delegar a repositorio)
        return await this.candidateRepository.save(candidate);
    }
}
```

### Repositories y Puertos

**Puerto (Interface)**: Definido en `domain/`, especifica qué necesita el dominio.

```typescript
// ✅ domain/repositories/ICandidateRepository.ts
export interface ICandidateRepository {
    save(candidate: Candidate): Promise<Candidate>;
    findById(id: number): Promise<Candidate | null>;
    findByEmail(email: Email): Promise<Candidate | null>;
    delete(id: number): Promise<void>;
}
```

**Adapter (Implementación)**: Implementado en `infrastructure/`, usa Prisma.

```typescript
// ✅ infrastructure/persistence/prisma/PrismaCandidateRepository.ts
import { ICandidateRepository } from "@/domain/repositories/ICandidateRepository";
import { Candidate } from "@/domain/entities/Candidate";
import { PrismaService } from "../PrismaService";

export class PrismaCandidateRepository implements ICandidateRepository {
    constructor(private prisma: PrismaService) {}

    async save(candidate: Candidate): Promise<Candidate> {
        const data = this.toPrismaData(candidate);
        const saved = await this.prisma.client.candidate.create({
            data,
            include: { educations: true, workExperiences: true },
        });
        return this.toDomainEntity(saved);
    }

    async findById(id: number): Promise<Candidate | null> {
        const data = await this.prisma.client.candidate.findUnique({
            where: { id },
            include: { educations: true, workExperiences: true },
        });
        return data ? this.toDomainEntity(data) : null;
    }

    private toPrismaData(candidate: Candidate): any {
        // Mapeo de entidad de dominio a modelo Prisma
    }

    private toDomainEntity(data: any): Candidate {
        // Mapeo de modelo Prisma a entidad de dominio
    }
}
```

### Límites de contexto

**Estado actual**: Un solo Bounded Context (Recruitment/Talent Management)

**Recomendación**: Mantener un solo contexto por ahora, pero preparar para futura separación si escala:

-   `RecruitmentContext`: Candidatos, Posiciones, Aplicaciones
-   `InterviewContext`: Entrevistas, Flujos, Evaluaciones (futuro)

---

## 🔁 Casos de Uso y Servicios de Aplicación

### Estructura de casos de uso

**Cada caso de uso debe**:

1. Tener una única responsabilidad
2. Recibir un DTO de entrada
3. Retornar un DTO de salida o entidad de dominio
4. Manejar transacciones si es necesario
5. Delegar validación a validadores
6. Delegar persistencia a repositorios

**Naming**: `{Action}{Entity}UseCase` (ej: `CreateCandidateUseCase`, `GetCandidateByIdUseCase`)

### Ejemplo de caso de uso bien estructurado

```typescript
// ✅ application/use-cases/candidates/CreateCandidateUseCase.ts
import { Candidate } from "@/domain/entities/Candidate";
import { Email } from "@/domain/value-objects/Email";
import { ICandidateRepository } from "@/domain/repositories/ICandidateRepository";
import { CandidateValidator } from "../../validators/candidateValidator";
import { CreateCandidateDTO } from "../../dto/CreateCandidateDTO";

export class CreateCandidateUseCase {
    constructor(
        private candidateRepository: ICandidateRepository,
        private validator: CandidateValidator
    ) {}

    async execute(dto: CreateCandidateDTO): Promise<Candidate> {
        // 1. Validar entrada
        this.validator.validate(dto);

        // 2. Verificar reglas de negocio
        const email = new Email(dto.email);
        const existingCandidate = await this.candidateRepository.findByEmail(
            email
        );
        if (existingCandidate) {
            throw new Error("Candidate with this email already exists");
        }

        // 3. Crear entidad de dominio
        const candidate = new Candidate(
            undefined,
            dto.firstName,
            dto.lastName,
            email
        );

        // 4. Persistir (el repositorio maneja transacciones si es necesario)
        return await this.candidateRepository.save(candidate);
    }
}
```

### Manejo de transacciones

**Problema actual**: `addCandidate` guarda múltiples entidades sin transacción.

**Solución**: Usar transacciones de Prisma en el repositorio o en el caso de uso.

```typescript
// ✅ application/use-cases/candidates/CreateCandidateWithRelationsUseCase.ts
export class CreateCandidateWithRelationsUseCase {
    constructor(
        private candidateRepository: ICandidateRepository,
        private prisma: PrismaService
    ) {}

    async execute(dto: CreateCandidateDTO): Promise<Candidate> {
        // Usar transacción de Prisma para operaciones múltiples
        return await this.prisma.client.$transaction(async (tx) => {
            // 1. Crear candidato
            const candidate = await this.candidateRepository.save(
                dto.candidate
            );

            // 2. Crear educaciones
            for (const educationDto of dto.educations) {
                await this.educationRepository.save({
                    ...educationDto,
                    candidateId: candidate.id,
                });
            }

            // 3. Crear experiencias
            for (const experienceDto of dto.workExperiences) {
                await this.workExperienceRepository.save({
                    ...experienceDto,
                    candidateId: candidate.id,
                });
            }

            return candidate;
        });
    }
}
```

### Orquestación vs Lógica de Dominio

**Regla**: La orquestación (coordinación entre múltiples entidades/repositorios) va en casos de uso. La lógica de negocio va en entidades o domain services.

```typescript
// ❌ Lógica de negocio en caso de uso (MAL)
export class CreateCandidateUseCase {
    async execute(dto: CreateCandidateDTO): Promise<Candidate> {
        // Lógica de negocio mezclada con orquestación
        if (dto.firstName.length < 2) {
            throw new Error('First name too short');
        }
        // ...
    }
}

// ✅ Lógica de negocio en entidad (BIEN)
export class Candidate {
    constructor(firstName: string, ...) {
        if (firstName.length < 2) {
            throw new Error('First name must be at least 2 characters');
        }
        this._firstName = firstName;
    }
}

// ✅ Orquestación en caso de uso (BIEN)
export class CreateCandidateUseCase {
    async execute(dto: CreateCandidateDTO): Promise<Candidate> {
        // Solo orquestación: validar, crear, persistir
        this.validator.validate(dto);
        const candidate = new Candidate(...);
        return await this.repository.save(candidate);
    }
}
```

---

## 🧪 Testing Strategy (Backend)

### Estado actual

-   ✅ **Jest configurado**: v29.7.0 con ts-jest
-   ✅ **Tests unitarios parciales**: `candidateService.test.ts`, `candidateController.test.ts`
-   ❌ **Sin tests de integración**: No hay tests que prueben flujos completos
-   ❌ **Sin tests de repositorios**: No se testean adapters de Prisma
-   ❌ **Cobertura desconocida**: No hay reportes de cobertura

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
  ╱   │  Unit Tests     │  ╲  Muchos, entidades/servicios
 ╱    │  (Domain)       │   ╲
╱     └─────────────────┘    ╲
```

**Distribución recomendada**:

-   **70% Unit tests**: Entidades, value objects, domain services, validators
-   **20% Integration tests**: Casos de uso, repositorios (con DB de test)
-   **10% E2E tests**: Flujos completos end-to-end (opcional para MVP)

### Convenciones de testing

**Naming**:

-   Archivos: `*.test.ts` (mismo directorio que el archivo testado)
-   Describe blocks: Nombre de la clase/función testada
-   Test cases: `it('should ...')` o `test('...')`

**Estructura AAA (Arrange-Act-Assert)**:

```typescript
// ✅ Estructura AAA
describe("Candidate", () => {
    describe("updateEmail", () => {
        it("should update email when new email is different", () => {
            // Arrange
            const email = new Email("old@example.com");
            const candidate = new Candidate(1, "John", "Doe", email);
            const newEmail = new Email("new@example.com");

            // Act
            candidate.updateEmail(newEmail);

            // Assert
            expect(candidate.email.value).toBe("new@example.com");
        });

        it("should throw error when new email is same as current", () => {
            // Arrange
            const email = new Email("test@example.com");
            const candidate = new Candidate(1, "John", "Doe", email);

            // Act & Assert
            expect(() => candidate.updateEmail(email)).toThrow(
                "New email must be different"
            );
        });
    });
});
```

### Testing de entidades de dominio

**Regla**: Las entidades deben ser testeables sin dependencias externas (sin DB, sin frameworks).

```typescript
// ✅ Test de entidad pura
describe("Candidate", () => {
    it("should create candidate with valid data", () => {
        const email = new Email("john@example.com");
        const candidate = new Candidate(1, "John", "Doe", email);

        expect(candidate.id).toBe(1);
        expect(candidate.getFullName()).toBe("John Doe");
        expect(candidate.email.value).toBe("john@example.com");
    });

    it("should throw error when email is invalid", () => {
        expect(() => {
            new Email("invalid-email");
        }).toThrow("Invalid email format");
    });
});
```

### Testing de casos de uso

**Mockear dependencias** (repositorios, validadores):

```typescript
// ✅ Test de caso de uso con mocks
describe("CreateCandidateUseCase", () => {
    let useCase: CreateCandidateUseCase;
    let mockRepository: jest.Mocked<ICandidateRepository>;
    let mockValidator: jest.Mocked<CandidateValidator>;

    beforeEach(() => {
        mockRepository = {
            save: jest.fn(),
            findByEmail: jest.fn(),
        } as any;
        mockValidator = {
            validate: jest.fn(),
        } as any;
        useCase = new CreateCandidateUseCase(mockRepository, mockValidator);
    });

    it("should create candidate when data is valid", async () => {
        // Arrange
        const dto: CreateCandidateDTO = {
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
        };
        const savedCandidate = new Candidate(
            1,
            "John",
            "Doe",
            new Email("john@example.com")
        );
        mockRepository.findByEmail.mockResolvedValue(null);
        mockRepository.save.mockResolvedValue(savedCandidate);

        // Act
        const result = await useCase.execute(dto);

        // Assert
        expect(mockValidator.validate).toHaveBeenCalledWith(dto);
        expect(mockRepository.findByEmail).toHaveBeenCalled();
        expect(mockRepository.save).toHaveBeenCalled();
        expect(result.id).toBe(1);
    });
});
```

### Testing de repositorios (Integration)

**Usar base de datos de test** (PostgreSQL en Docker o SQLite en memoria):

```typescript
// ✅ Test de integración de repositorio
describe("PrismaCandidateRepository", () => {
    let repository: PrismaCandidateRepository;
    let prisma: PrismaService;

    beforeAll(async () => {
        // Setup: Conectar a DB de test
        prisma = new PrismaService();
        await prisma.connect();
        repository = new PrismaCandidateRepository(prisma);
    });

    afterAll(async () => {
        // Cleanup: Desconectar
        await prisma.disconnect();
    });

    beforeEach(async () => {
        // Limpiar datos antes de cada test
        await prisma.client.candidate.deleteMany();
    });

    it("should save and retrieve candidate", async () => {
        // Arrange
        const candidate = new Candidate(
            undefined,
            "John",
            "Doe",
            new Email("john@example.com")
        );

        // Act
        const saved = await repository.save(candidate);
        const retrieved = await repository.findById(saved.id!);

        // Assert
        expect(saved.id).toBeDefined();
        expect(retrieved).not.toBeNull();
        expect(retrieved!.email.value).toBe("john@example.com");
    });
});
```

### Definition of Done para Backend

**Un cambio de backend está completo cuando**:

1. ✅ **Código compila**: `npm run build` pasa
2. ✅ **Tests pasan**: `npm test` pasa
3. ✅ **Linting pasa**: `npm run lint` (si está configurado)
4. ✅ **Tests de unidad**: Nuevas funcionalidades tienen tests unitarios
5. ✅ **Manejo de errores**: Errores manejados apropiadamente
6. ✅ **Validación**: Inputs validados
7. ✅ **Transacciones**: Operaciones multi-entidad usan transacciones
8. ✅ **Sin dependencias directas**: No hay imports de Prisma en domain

**Cobertura mínima recomendada**:

-   **Entidades de dominio**: 90%+
-   **Casos de uso**: 80%+
-   **Repositorios**: 70%+ (tests de integración)
-   **Controllers**: 70%+

---

## 🧱 Principios SOLID

### SRP (Single Responsibility Principle)

**Regla**: Cada clase debe tener una única razón para cambiar.

**Violación real encontrada**:

```typescript
// ❌ candidateService.ts - Múltiples responsabilidades
export const addCandidate = async (candidateData: any) => {
    // 1. Validación
    validateCandidateData(candidateData);

    // 2. Creación de entidad
    const candidate = new Candidate(candidateData);

    // 3. Persistencia de candidato
    const savedCandidate = await candidate.save();

    // 4. Persistencia de educaciones
    if (candidateData.educations) {
        for (const education of candidateData.educations) {
            const educationModel = new Education(education);
            educationModel.candidateId = candidateId;
            await educationModel.save();
        }
    }

    // 5. Persistencia de experiencias
    if (candidateData.workExperiences) {
        for (const experience of candidateData.workExperiences) {
            // ...
        }
    }

    // 6. Persistencia de CV
    if (candidateData.cv) {
        // ...
    }

    return savedCandidate;
};
```

**Refactorización**:

```typescript
// ✅ Separación de responsabilidades

// 1. Validación en validador
// application/validators/candidateValidator.ts
export class CandidateValidator {
    validate(dto: CreateCandidateDTO): void {
        if (!dto.firstName || dto.firstName.length < 2) {
            throw new ValidationError('First name must be at least 2 characters');
        }
        // ... más validaciones
    }
}

// 2. Creación de entidad en caso de uso
// application/use-cases/candidates/CreateCandidateUseCase.ts
export class CreateCandidateUseCase {
    constructor(
        private candidateRepository: ICandidateRepository,
        private validator: CandidateValidator
    ) {}

    async execute(dto: CreateCandidateDTO): Promise<Candidate> {
        this.validator.validate(dto);
        const candidate = new Candidate(...);
        return await this.candidateRepository.save(candidate);
    }
}

// 3. Persistencia en repositorio
// infrastructure/persistence/prisma/PrismaCandidateRepository.ts
export class PrismaCandidateRepository implements ICandidateRepository {
    async save(candidate: Candidate): Promise<Candidate> {
        // Solo responsabilidad de persistencia
        return await this.prisma.client.candidate.create({...});
    }
}
```

### OCP (Open/Closed Principle)

**Regla**: Abierto para extensión, cerrado para modificación.

**Ejemplo**: Sistema de notificaciones extensible.

```typescript
// ✅ Interfaz base (cerrada para modificación)
// domain/services/INotificationService.ts
export interface INotificationService {
    send(candidate: Candidate, message: string): Promise<void>;
}

// ✅ Implementaciones (abiertas para extensión)
// infrastructure/notifications/EmailNotificationService.ts
export class EmailNotificationService implements INotificationService {
    async send(candidate: Candidate, message: string): Promise<void> {
        // Enviar email
    }
}

// infrastructure/notifications/SMSNotificationService.ts
export class SMSNotificationService implements INotificationService {
    async send(candidate: Candidate, message: string): Promise<void> {
        // Enviar SMS
    }
}

// ✅ Caso de uso usa la interfaz (no necesita cambiar)
export class NotifyCandidateUseCase {
    constructor(private notificationService: INotificationService) {}

    async execute(candidate: Candidate, message: string): Promise<void> {
        await this.notificationService.send(candidate, message);
    }
}
```

### LSP (Liskov Substitution Principle)

**Regla**: Las implementaciones deben ser sustituibles por sus interfaces sin romper el comportamiento.

**Ejemplo**: Diferentes implementaciones de repositorio.

```typescript
// ✅ Interfaz base
export interface ICandidateRepository {
    findById(id: number): Promise<Candidate | null>;
}

// ✅ Implementación Prisma (sustituible)
export class PrismaCandidateRepository implements ICandidateRepository {
    async findById(id: number): Promise<Candidate | null> {
        // Implementación con Prisma
    }
}

// ✅ Implementación en memoria para tests (sustituible)
export class InMemoryCandidateRepository implements ICandidateRepository {
    private candidates: Map<number, Candidate> = new Map();

    async findById(id: number): Promise<Candidate | null> {
        return this.candidates.get(id) || null;
    }
}

// ✅ Cualquier implementación puede usarse sin cambiar el código
const repository: ICandidateRepository = new PrismaCandidateRepository(prisma);
// o
const repository: ICandidateRepository = new InMemoryCandidateRepository();
```

### ISP (Interface Segregation Principle)

**Regla**: No forzar a las clases a depender de interfaces que no usan.

**Violación**:

```typescript
// ❌ Interfaz "gorda" que fuerza a implementar todo
export interface IRepository {
    save(entity: any): Promise<any>;
    findById(id: number): Promise<any>;
    findAll(): Promise<any[]>;
    update(id: number, data: any): Promise<any>;
    delete(id: number): Promise<void>;
    findByEmail(email: string): Promise<any>;
    findByPhone(phone: string): Promise<any>;
    // ... muchas más
}
```

**Solución**:

```typescript
// ✅ Interfaces segregadas
export interface ISaveable<T> {
    save(entity: T): Promise<T>;
}

export interface IFindableById<T> {
    findById(id: number): Promise<T | null>;
}

export interface IFindableByEmail<T> {
    findByEmail(email: Email): Promise<T | null>;
}

// ✅ Repositorio implementa solo lo que necesita
export interface ICandidateRepository
    extends ISaveable<Candidate>,
        IFindableById<Candidate>,
        IFindableByEmail<Candidate> {
    // Solo métodos específicos de Candidate si los hay
}
```

### DIP (Dependency Inversion Principle)

**Regla**: Depender de abstracciones (interfaces), no de implementaciones concretas.

**Violación real encontrada**:

```typescript
// ❌ domain/models/Candidate.ts - Depende de implementación concreta
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class Candidate {
    async save() {
        return await prisma.candidate.create({...}); // Depende directamente de Prisma
    }
}
```

**Refactorización**:

```typescript
// ✅ domain/repositories/ICandidateRepository.ts - Abstracción en dominio
export interface ICandidateRepository {
    save(candidate: Candidate): Promise<Candidate>;
    findById(id: number): Promise<Candidate | null>;
}

// ✅ domain/entities/Candidate.ts - Entidad pura, sin dependencias
export class Candidate {
    // Solo lógica de negocio
    updateEmail(email: Email): void {
        // ...
    }
}

// ✅ infrastructure/persistence/prisma/PrismaCandidateRepository.ts - Implementación
export class PrismaCandidateRepository implements ICandidateRepository {
    constructor(private prisma: PrismaService) {}

    async save(candidate: Candidate): Promise<Candidate> {
        // Implementación con Prisma
    }
}

// ✅ application/use-cases/candidates/CreateCandidateUseCase.ts - Depende de abstracción
export class CreateCandidateUseCase {
    constructor(
        private candidateRepository: ICandidateRepository // Interfaz, no implementación
    ) {}

    async execute(dto: CreateCandidateDTO): Promise<Candidate> {
        const candidate = new Candidate(...);
        return await this.candidateRepository.save(candidate); // Usa interfaz
    }
}
```

---

## ♻ DRY y Reutilización

### Duplicaciones reales detectadas

**1. Manejo de errores de Prisma duplicado**:

```typescript
// ❌ Duplicado en Candidate.ts y otros modelos
try {
    return await prisma.candidate.create({...});
} catch (error: any) {
    if (error.code === 'P2002') {
        throw new Error('Email already exists');
    } else if (error.code === 'P2025') {
        throw new Error('Record not found');
    }
    throw error;
}
```

**Solución**:

```typescript
// ✅ infrastructure/persistence/prisma/PrismaErrorHandler.ts
export class PrismaErrorHandler {
    static handle(error: any): never {
        if (error.code === 'P2002') {
            throw new DomainException('Unique constraint violation');
        }
        if (error.code === 'P2025') {
            throw new NotFoundException('Record not found');
        }
        if (error instanceof Prisma.PrismaClientInitializationError) {
            throw new DatabaseConnectionException('Database connection failed');
        }
        throw error;
    }
}

// ✅ Uso en repositorio
export class PrismaCandidateRepository {
    async save(candidate: Candidate): Promise<Candidate> {
        try {
            return await this.prisma.client.candidate.create({...});
        } catch (error) {
            PrismaErrorHandler.handle(error);
        }
    }
}
```

**2. Validación de IDs duplicada**:

```typescript
// ❌ Duplicado en múltiples controllers
const id = parseInt(req.params.id);
if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid ID format" });
}
```

**Solución**:

```typescript
// ✅ presentation/middleware/validationMiddleware.ts
export const validateIdParam = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }
    req.params.id = id.toString(); // Normalizar
    next();
};

// ✅ Uso en rutas
router.get("/:id", validateIdParam, getCandidateById);
```

**3. Mapeo Prisma ↔ Domain duplicado**:

```typescript
// ❌ Lógica de mapeo repetida en cada repositorio
// PrismaCandidateRepository, PrismaPositionRepository, etc.
```

**Solución**:

```typescript
// ✅ infrastructure/persistence/prisma/mappers/CandidateMapper.ts
export class CandidateMapper {
    static toDomain(prismaData: any): Candidate {
        return new Candidate(
            prismaData.id,
            prismaData.firstName,
            prismaData.lastName,
            new Email(prismaData.email)
            // ...
        );
    }

    static toPrisma(candidate: Candidate): any {
        return {
            firstName: candidate.firstName,
            lastName: candidate.lastName,
            email: candidate.email.value,
            // ...
        };
    }
}
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

---

## 🧰 Patrones de Diseño

### Patrones ya presentes (aunque mal implementados)

**1. Repository Pattern (parcialmente)**:

-   Existe en modelos (`Candidate.save()`, `Candidate.findOne()`)
-   Problema: Acoplado a Prisma, no es una interfaz

**Refactorización recomendada**: Ver sección de DIP más arriba.

**2. Service Layer Pattern**:

-   Existe en `application/services/`
-   Problema: Mezcla orquestación con lógica de negocio

**Refactorización recomendada**: Separar en Use Cases (orquestación) y Domain Services (lógica de negocio).

### Patrones que deberían introducirse

**1. Factory Pattern (para crear entidades complejas)**:

```typescript
// ✅ domain/factories/CandidateFactory.ts
export class CandidateFactory {
    static create(dto: CreateCandidateDTO): Candidate {
        const email = new Email(dto.email);
        const phone = dto.phone ? new Phone(dto.phone) : undefined;

        const candidate = new Candidate(
            undefined,
            dto.firstName,
            dto.lastName,
            email,
            phone
        );

        // Añadir educaciones
        if (dto.educations) {
            dto.educations.forEach((eduDto) => {
                candidate.addEducation(EducationFactory.create(eduDto));
            });
        }

        return candidate;
    }
}
```

**2. Strategy Pattern (para diferentes estrategias de validación)**:

```typescript
// ✅ application/validators/strategies/ValidationStrategy.ts
export interface ValidationStrategy<T> {
    validate(data: T): ValidationResult;
}

export class EmailValidationStrategy implements ValidationStrategy<string> {
    validate(email: string): ValidationResult {
        const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return {
            isValid: EMAIL_REGEX.test(email),
            error: EMAIL_REGEX.test(email) ? null : "Invalid email format",
        };
    }
}

export class PhoneValidationStrategy implements ValidationStrategy<string> {
    validate(phone: string): ValidationResult {
        const PHONE_REGEX = /^(6|7|9)\d{8}$/;
        return {
            isValid: PHONE_REGEX.test(phone),
            error: PHONE_REGEX.test(phone) ? null : "Invalid phone format",
        };
    }
}
```

**3. Adapter Pattern (para sistemas externos)**:

```typescript
// ✅ domain/services/IEmailService.ts (puerto)
export interface IEmailService {
    send(to: Email, subject: string, body: string): Promise<void>;
}

// ✅ infrastructure/external/email/SendGridEmailAdapter.ts (adapter)
export class SendGridEmailAdapter implements IEmailService {
    constructor(private sendGridClient: SendGridClient) {}

    async send(to: Email, subject: string, body: string): Promise<void> {
        await this.sendGridClient.send({
            to: to.value,
            subject,
            html: body,
        });
    }
}
```

**4. Unit of Work Pattern (para transacciones)**:

```typescript
// ✅ infrastructure/persistence/UnitOfWork.ts
export class UnitOfWork {
    constructor(private prisma: PrismaService) {}

    async execute<T>(
        fn: (tx: Prisma.TransactionClient) => Promise<T>
    ): Promise<T> {
        return await this.prisma.client.$transaction(fn);
    }
}

// ✅ Uso en caso de uso
export class CreateCandidateWithRelationsUseCase {
    constructor(
        private unitOfWork: UnitOfWork,
        private candidateRepository: ICandidateRepository
    ) {}

    async execute(dto: CreateCandidateDTO): Promise<Candidate> {
        return await this.unitOfWork.execute(async (tx) => {
            const candidate = CandidateFactory.create(dto);
            return await this.candidateRepository.save(candidate, tx);
        });
    }
}
```

---

## 🔐 Seguridad y Robustez

### Autenticación y Autorización

**Estado actual**: ❌ No implementado

**Recomendaciones para cuando se implemente**:

1. **JWT Tokens**: Para autenticación stateless
2. **Middleware de autenticación**: Verificar token en cada request
3. **Middleware de autorización**: Verificar permisos según rol
4. **Refresh tokens**: Para renovar tokens expirados

```typescript
// ✅ presentation/middleware/authMiddleware.ts (futuro)
export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        req.user = decoded; // Añadir usuario al request
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
};

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden" });
        }
        next();
    };
};
```

### Manejo de secretos y configuración

**Reglas**:

1. **Nunca hardcodear secretos** en código
2. **Usar variables de entorno** para configuración sensible
3. **Validar variables de entorno** al iniciar la aplicación
4. **Usar `.env.example`** para documentar variables requeridas

```typescript
// ✅ infrastructure/config/environment.ts
export class Environment {
    static validate(): void {
        const required = ["DATABASE_URL", "JWT_SECRET", "CORS_ORIGIN"];
        const missing = required.filter((key) => !process.env[key]);

        if (missing.length > 0) {
            throw new Error(
                `Missing required environment variables: ${missing.join(", ")}`
            );
        }
    }

    static getDatabaseUrl(): string {
        return process.env.DATABASE_URL!;
    }

    static getJwtSecret(): string {
        return process.env.JWT_SECRET!;
    }
}

// ✅ Llamar en index.ts al inicio
Environment.validate();
```

### Validación de inputs

**Regla**: Validar TODOS los inputs de usuario, tanto en aplicación como en dominio.

```typescript
// ✅ application/validators/candidateValidator.ts
export class CandidateValidator {
    validate(dto: CreateCandidateDTO): void {
        const errors: string[] = [];

        if (!dto.firstName || dto.firstName.length < 2) {
            errors.push("First name must be at least 2 characters");
        }

        if (!dto.email || !this.isValidEmail(dto.email)) {
            errors.push("Invalid email format");
        }

        if (dto.phone && !this.isValidPhone(dto.phone)) {
            errors.push("Invalid phone format");
        }

        if (errors.length > 0) {
            throw new ValidationError(errors.join(", "));
        }
    }

    private isValidEmail(email: string): boolean {
        const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return EMAIL_REGEX.test(email);
    }

    private isValidPhone(phone: string): boolean {
        const PHONE_REGEX = /^(6|7|9)\d{8}$/;
        return PHONE_REGEX.test(phone);
    }
}
```

### Manejo de errores y excepciones

**Jerarquía de excepciones**:

```typescript
// ✅ domain/exceptions/DomainException.ts
export class DomainException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "DomainException";
    }
}

// ✅ domain/exceptions/NotFoundException.ts
export class NotFoundException extends DomainException {
    constructor(resource: string) {
        super(`${resource} not found`);
        this.name = "NotFoundException";
    }
}

// ✅ domain/exceptions/ValidationException.ts
export class ValidationException extends DomainException {
    constructor(message: string, public errors: string[] = []) {
        super(message);
        this.name = "ValidationException";
    }
}

// ✅ presentation/middleware/errorHandler.ts
export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (error instanceof ValidationException) {
        return res.status(400).json({
            error: error.message,
            errors: error.errors,
        });
    }

    if (error instanceof NotFoundException) {
        return res.status(404).json({
            error: error.message,
        });
    }

    if (error instanceof DomainException) {
        return res.status(400).json({
            error: error.message,
        });
    }

    // Error desconocido - no exponer detalles en producción
    console.error("Unexpected error:", error);
    return res.status(500).json({
        error:
            process.env.NODE_ENV === "production"
                ? "Internal server error"
                : error.message,
    });
};
```

**Uso en casos de uso**:

```typescript
// ✅ application/use-cases/candidates/GetCandidateByIdUseCase.ts
export class GetCandidateByIdUseCase {
    constructor(private candidateRepository: ICandidateRepository) {}

    async execute(id: number): Promise<Candidate> {
        const candidate = await this.candidateRepository.findById(id);

        if (!candidate) {
            throw new NotFoundException("Candidate"); // Lanzar excepción de dominio
        }

        return candidate;
    }
}
```

### Riesgos actuales detectados

1. **Sin autenticación**: Cualquiera puede acceder a la API
2. **Ruta de uploads hardcodeada**: `../uploads/` puede no existir en producción
3. **CORS permisivo en desarrollo**: Permite requests sin origen
4. **Errores exponen detalles**: Algunos errores devuelven stack traces
5. **Sin rate limiting**: API puede ser abusada
6. **Sin validación de tamaño de archivo en múltiples capas**: Solo en Multer

---

## 📈 Observabilidad y Operación

### Logging estructurado

**Problema actual**: `console.log` y `console.error` básicos

**Solución recomendada**: Logger estructurado (Winston o Pino)

```typescript
// ✅ infrastructure/logging/Logger.ts
import winston from "winston";

export class Logger {
    private logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || "info",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({
                    filename: "error.log",
                    level: "error",
                }),
                new winston.transports.File({ filename: "combined.log" }),
            ],
        });
    }

    info(message: string, meta?: object): void {
        this.logger.info(message, meta);
    }

    error(message: string, error?: Error, meta?: object): void {
        this.logger.error(message, { error: error?.stack, ...meta });
    }

    warn(message: string, meta?: object): void {
        this.logger.warn(message, meta);
    }
}

export const logger = new Logger();
```

**Uso en código**:

```typescript
// ✅ Reemplazar console.log
logger.info("Candidate created", { candidateId: candidate.id });
logger.error("Failed to create candidate", error, { dto });
```

### Manejo de errores en producción

**Reglas**:

1. **No exponer stack traces** en producción
2. **Loggear errores** con contexto completo
3. **Usar códigos de error estructurados** para debugging
4. **Notificar errores críticos** (Sentry, etc.)

```typescript
// ✅ presentation/middleware/errorHandler.ts
export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Loggear con contexto
    logger.error("Request failed", error, {
        method: req.method,
        path: req.path,
        body: req.body,
        params: req.params,
    });

    // Responder según tipo de error
    if (error instanceof ValidationException) {
        return res.status(400).json({ error: error.message });
    }

    // Error desconocido
    const errorId = generateErrorId(); // UUID para tracking
    logger.error("Unexpected error", error, { errorId });

    return res.status(500).json({
        error: "Internal server error",
        errorId: process.env.NODE_ENV === "production" ? errorId : undefined,
    });
};
```

### Health checks

**Implementar endpoint de health check**:

```typescript
// ✅ presentation/controllers/healthController.ts
export const healthCheck = async (req: Request, res: Response) => {
    try {
        // Verificar conexión a DB
        await prisma.$queryRaw`SELECT 1`;

        res.status(200).json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            database: "connected",
        });
    } catch (error) {
        res.status(503).json({
            status: "unhealthy",
            timestamp: new Date().toISOString(),
            database: "disconnected",
        });
    }
};

// ✅ Añadir ruta
app.get("/health", healthCheck);
```

### Métricas (futuro)

**Considerar añadir**:

-   Tiempo de respuesta de endpoints
-   Tasa de errores
-   Uso de recursos (CPU, memoria)
-   Métricas de negocio (candidatos creados, etc.)

**Herramientas recomendadas**: Prometheus + Grafana, o servicios como DataDog

---

## 📋 Plantillas Before / After

### Ejemplo 1 – Violación de DIP en Modelo de Dominio

#### ❌ Antes

**Archivo**: `backend/src/domain/models/Candidate.ts` (líneas 1-7, 34-127)

```typescript
import { PrismaClient } from "@prisma/client";
import { Education } from "./Education";
import { WorkExperience } from "./WorkExperience";
import { Resume } from "./Resume";

const prisma = new PrismaClient();

export class Candidate {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    // ...

    async save() {
        const candidateData: any = {
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            // ...
        };

        if (this.id) {
            // Actualizar
            return await prisma.candidate.update({
                where: { id: this.id },
                data: candidateData,
            });
        } else {
            // Crear
            return await prisma.candidate.create({
                data: candidateData,
            });
        }
    }

    static async findOne(id: number): Promise<Candidate | null> {
        const data = await prisma.candidate.findUnique({
            where: { id: id },
            include: {
                educations: true,
                workExperiences: true,
                resumes: true,
            },
        });
        if (!data) return null;
        return new Candidate(data);
    }
}
```

**Problemas**:

-   ❌ Depende directamente de `PrismaClient` (infraestructura)
-   ❌ Viola DIP: dominio depende de infraestructura
-   ❌ Imposible de testear sin base de datos
-   ❌ Imposible cambiar de ORM sin modificar dominio

#### ✅ Después

**Archivo**: `backend/src/domain/repositories/ICandidateRepository.ts`

```typescript
import { Candidate } from "../entities/Candidate";

export interface ICandidateRepository {
    save(candidate: Candidate): Promise<Candidate>;
    findById(id: number): Promise<Candidate | null>;
    findByEmail(email: Email): Promise<Candidate | null>;
    delete(id: number): Promise<void>;
}
```

**Archivo**: `backend/src/domain/entities/Candidate.ts`

```typescript
import { Email } from "../value-objects/Email";
import { Education } from "../entities/Education";
import { WorkExperience } from "../entities/WorkExperience";

export class Candidate {
    private readonly _id?: number;
    private _firstName: string;
    private _lastName: string;
    private _email: Email;
    private _educations: Education[] = [];
    private _workExperiences: WorkExperience[] = [];

    constructor(
        id: number | undefined,
        firstName: string,
        lastName: string,
        email: Email
    ) {
        if (firstName.length < 2) {
            throw new Error("First name must be at least 2 characters");
        }
        this._id = id;
        this._firstName = firstName;
        this._lastName = lastName;
        this._email = email;
    }

    get id(): number | undefined {
        return this._id;
    }
    get firstName(): string {
        return this._firstName;
    }
    get email(): Email {
        return this._email;
    }
    get educations(): Education[] {
        return [...this._educations];
    }

    addEducation(education: Education): void {
        if (this._educations.length >= 10) {
            throw new Error("Maximum 10 educations allowed");
        }
        this._educations.push(education);
    }

    getFullName(): string {
        return `${this._firstName} ${this._lastName}`;
    }
}
```

**Archivo**: `backend/src/infrastructure/persistence/prisma/PrismaCandidateRepository.ts`

```typescript
import { ICandidateRepository } from "@/domain/repositories/ICandidateRepository";
import { Candidate } from "@/domain/entities/Candidate";
import { Email } from "@/domain/value-objects/Email";
import { PrismaService } from "../PrismaService";
import { CandidateMapper } from "./mappers/CandidateMapper";

export class PrismaCandidateRepository implements ICandidateRepository {
    constructor(private prisma: PrismaService) {}

    async save(candidate: Candidate): Promise<Candidate> {
        const data = CandidateMapper.toPrisma(candidate);

        if (candidate.id) {
            const saved = await this.prisma.client.candidate.update({
                where: { id: candidate.id },
                data,
                include: { educations: true, workExperiences: true },
            });
            return CandidateMapper.toDomain(saved);
        } else {
            const saved = await this.prisma.client.candidate.create({
                data,
                include: { educations: true, workExperiences: true },
            });
            return CandidateMapper.toDomain(saved);
        }
    }

    async findById(id: number): Promise<Candidate | null> {
        const data = await this.prisma.client.candidate.findUnique({
            where: { id },
            include: { educations: true, workExperiences: true },
        });
        return data ? CandidateMapper.toDomain(data) : null;
    }

    async findByEmail(email: Email): Promise<Candidate | null> {
        const data = await this.prisma.client.candidate.findUnique({
            where: { email: email.value },
            include: { educations: true, workExperiences: true },
        });
        return data ? CandidateMapper.toDomain(data) : null;
    }

    async delete(id: number): Promise<void> {
        await this.prisma.client.candidate.delete({ where: { id } });
    }
}
```

**Archivo**: `backend/src/application/use-cases/candidates/CreateCandidateUseCase.ts`

```typescript
import { Candidate } from "@/domain/entities/Candidate";
import { Email } from "@/domain/value-objects/Email";
import { ICandidateRepository } from "@/domain/repositories/ICandidateRepository";
import { CandidateValidator } from "../../validators/candidateValidator";
import { CreateCandidateDTO } from "../../dto/CreateCandidateDTO";

export class CreateCandidateUseCase {
    constructor(
        private candidateRepository: ICandidateRepository,
        private validator: CandidateValidator
    ) {}

    async execute(dto: CreateCandidateDTO): Promise<Candidate> {
        // Validar
        this.validator.validate(dto);

        // Verificar email único
        const email = new Email(dto.email);
        const existing = await this.candidateRepository.findByEmail(email);
        if (existing) {
            throw new Error("Candidate with this email already exists");
        }

        // Crear entidad
        const candidate = new Candidate(
            undefined,
            dto.firstName,
            dto.lastName,
            email
        );

        // Persistir
        return await this.candidateRepository.save(candidate);
    }
}
```

#### Por qué esto es mejor

1. **DIP respetado**: Dominio no depende de infraestructura
2. **Testeable**: Entidades pueden testearse sin DB, repositorios pueden mockearse
3. **Intercambiable**: Puede cambiar de Prisma a TypeORM sin tocar dominio
4. **Separación clara**: Cada capa tiene su responsabilidad
5. **Mantenible**: Cambios en infraestructura no afectan lógica de negocio

---

### Ejemplo 2 – Violación de SRP en Servicio de Aplicación

#### ❌ Antes

**Archivo**: `backend/src/application/services/candidateService.ts` (líneas 8-56)

```typescript
export const addCandidate = async (candidateData: any) => {
    try {
        validateCandidateData(candidateData); // 1. Validación
    } catch (error: any) {
        throw new Error(error);
    }

    const candidate = new Candidate(candidateData); // 2. Creación de entidad
    try {
        const savedCandidate = await candidate.save(); // 3. Persistencia candidato
        const candidateId = savedCandidate.id;

        // 4. Persistencia de educaciones
        if (candidateData.educations) {
            for (const education of candidateData.educations) {
                const educationModel = new Education(education);
                educationModel.candidateId = candidateId;
                await educationModel.save();
                candidate.educations.push(educationModel);
            }
        }

        // 5. Persistencia de experiencias
        if (candidateData.workExperiences) {
            for (const experience of candidateData.workExperiences) {
                const experienceModel = new WorkExperience(experience);
                experienceModel.candidateId = candidateId;
                await experienceModel.save();
                candidate.workExperiences.push(experienceModel);
            }
        }

        // 6. Persistencia de CV
        if (candidateData.cv && Object.keys(candidateData.cv).length > 0) {
            const resumeModel = new Resume(candidateData.cv);
            resumeModel.candidateId = candidateId;
            await resumeModel.save();
            candidate.resumes.push(resumeModel);
        }
        return savedCandidate;
    } catch (error: any) {
        if (error.code === "P2002") {
            throw new Error("The email already exists in the database");
        } else {
            throw error;
        }
    }
};
```

**Problemas**:

-   ❌ Múltiples responsabilidades: validación, creación, persistencia múltiple
-   ❌ Sin transacciones: Si falla una operación, datos inconsistentes
-   ❌ Manejo de errores mezclado con lógica
-   ❌ Difícil de testear (muchas dependencias)

#### ✅ Después

**Archivo**: `backend/src/application/validators/candidateValidator.ts`

```typescript
import { CreateCandidateDTO } from "../dto/CreateCandidateDTO";
import { ValidationException } from "@/domain/exceptions/ValidationException";

export class CandidateValidator {
    validate(dto: CreateCandidateDTO): void {
        const errors: string[] = [];

        if (!dto.firstName || dto.firstName.length < 2) {
            errors.push("First name must be at least 2 characters");
        }

        if (!dto.email || !this.isValidEmail(dto.email)) {
            errors.push("Invalid email format");
        }

        if (dto.educations) {
            dto.educations.forEach((edu, index) => {
                if (!edu.institution) {
                    errors.push(
                        `Education ${index + 1}: institution is required`
                    );
                }
            });
        }

        if (errors.length > 0) {
            throw new ValidationException("Validation failed", errors);
        }
    }

    private isValidEmail(email: string): boolean {
        const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return EMAIL_REGEX.test(email);
    }
}
```

**Archivo**: `backend/src/application/use-cases/candidates/CreateCandidateWithRelationsUseCase.ts`

```typescript
import { Candidate } from "@/domain/entities/Candidate";
import { Email } from "@/domain/value-objects/Email";
import { ICandidateRepository } from "@/domain/repositories/ICandidateRepository";
import { IEducationRepository } from "@/domain/repositories/IEducationRepository";
import { IWorkExperienceRepository } from "@/domain/repositories/IWorkExperienceRepository";
import { IResumeRepository } from "@/domain/repositories/IResumeRepository";
import { CandidateValidator } from "../../validators/candidateValidator";
import { CreateCandidateDTO } from "../../dto/CreateCandidateDTO";
import { PrismaService } from "@/infrastructure/persistence/PrismaService";

export class CreateCandidateWithRelationsUseCase {
    constructor(
        private candidateRepository: ICandidateRepository,
        private educationRepository: IEducationRepository,
        private workExperienceRepository: IWorkExperienceRepository,
        private resumeRepository: IResumeRepository,
        private validator: CandidateValidator,
        private prisma: PrismaService
    ) {}

    async execute(dto: CreateCandidateDTO): Promise<Candidate> {
        // 1. Validar (responsabilidad única)
        this.validator.validate(dto);

        // 2. Verificar email único
        const email = new Email(dto.email);
        const existing = await this.candidateRepository.findByEmail(email);
        if (existing) {
            throw new Error("Candidate with this email already exists");
        }

        // 3. Crear entidad (responsabilidad única)
        const candidate = new Candidate(
            undefined,
            dto.firstName,
            dto.lastName,
            email
        );

        // 4. Persistir con transacción (responsabilidad única: orquestación)
        return await this.prisma.client.$transaction(async (tx) => {
            // Guardar candidato
            const savedCandidate = await this.candidateRepository.save(
                candidate
            );

            // Guardar educaciones
            if (dto.educations) {
                for (const eduDto of dto.educations) {
                    const education = EducationFactory.create(eduDto);
                    candidate.addEducation(education);
                    await this.educationRepository.save(education, tx);
                }
            }

            // Guardar experiencias
            if (dto.workExperiences) {
                for (const expDto of dto.workExperiences) {
                    const experience = WorkExperienceFactory.create(expDto);
                    candidate.addWorkExperience(experience);
                    await this.workExperienceRepository.save(experience, tx);
                }
            }

            // Guardar CV
            if (dto.cv) {
                const resume = ResumeFactory.create(dto.cv);
                candidate.addResume(resume);
                await this.resumeRepository.save(resume, tx);
            }

            return savedCandidate;
        });
    }
}
```

#### Por qué esto es mejor

1. **SRP respetado**: Cada clase tiene una única responsabilidad
2. **Transaccional**: Operaciones múltiples son atómicas
3. **Testeable**: Cada componente puede testearse de forma aislada
4. **Mantenible**: Cambios en validación no afectan persistencia
5. **Reutilizable**: Validator puede usarse en otros casos de uso

---

### Ejemplo 3 – Inconsistencia: Prisma Directo vs Modelos

#### ❌ Antes

**Archivo**: `backend/src/application/services/positionService.ts` (líneas 12-34)

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getCandidatesByPositionService = async (positionId: number) => {
    try {
        const applications = await prisma.application.findMany({
            where: { positionId },
            include: {
                candidate: true,
                interviews: true,
                interviewStep: true,
            },
        });

        return applications.map((app) => ({
            fullName: `${app.candidate.firstName} ${app.candidate.lastName}`,
            currentInterviewStep: app.interviewStep.name,
            averageScore: calculateAverageScore(app.interviews),
            id: app.candidate.id,
            applicationId: app.id,
        }));
    } catch (error) {
        console.error("Error retrieving candidates by position:", error);
        throw new Error("Error retrieving candidates by position");
    }
};
```

**Problemas**:

-   ❌ Usa Prisma directamente en lugar de modelos/repositorios
-   ❌ Inconsistente con `candidateService` que usa modelos
-   ❌ Lógica de negocio (calcular promedio) mezclada con acceso a datos
-   ❌ DTO de respuesta creado inline en lugar de clase dedicada

#### ✅ Después

**Archivo**: `backend/src/domain/repositories/IApplicationRepository.ts`

```typescript
import { Application } from "../entities/Application";

export interface IApplicationRepository {
    findByPositionId(positionId: number): Promise<Application[]>;
}
```

**Archivo**: `backend/src/application/use-cases/positions/GetCandidatesByPositionUseCase.ts`

```typescript
import { IApplicationRepository } from "@/domain/repositories/IApplicationRepository";
import { CandidatesByPositionDTO } from "../dto/CandidatesByPositionDTO";

export class GetCandidatesByPositionUseCase {
    constructor(private applicationRepository: IApplicationRepository) {}

    async execute(positionId: number): Promise<CandidatesByPositionDTO[]> {
        const applications = await this.applicationRepository.findByPositionId(
            positionId
        );

        return applications.map((app) => ({
            fullName: app.candidate.getFullName(),
            currentInterviewStep: app.interviewStep.name,
            averageScore: app.calculateAverageScore(),
            candidateId: app.candidate.id,
            applicationId: app.id,
        }));
    }
}
```

**Archivo**: `backend/src/domain/entities/Application.ts`

```typescript
import { Candidate } from "./Candidate";
import { Interview } from "./Interview";

export class Application {
    private _candidate: Candidate;
    private _interviews: Interview[] = [];
    private _interviewStep: InterviewStep;

    calculateAverageScore(): number {
        if (this._interviews.length === 0) return 0;
        const total = this._interviews.reduce(
            (sum, interview) => sum + interview.score,
            0
        );
        return total / this._interviews.length;
    }
}
```

#### Por qué esto es mejor

1. **Consistencia**: Todos los servicios usan el mismo patrón (repositorios)
2. **Lógica en dominio**: Cálculo de promedio está en la entidad
3. **Testeable**: Puede mockear el repositorio
4. **Mantenible**: Cambios en Prisma solo afectan el repositorio

---

## 📚 Referencias y Recursos

### Documentación oficial

-   [Express.js Documentation](https://expressjs.com/)
-   [Prisma Documentation](https://www.prisma.io/docs/)
-   [TypeScript Handbook](https://www.typescriptlang.org/docs/)
-   [Jest Documentation](https://jestjs.io/)

### Arquitectura y DDD

-   [Domain-Driven Design (Eric Evans)](https://www.domainlanguage.com/ddd/)
-   [Clean Architecture (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
-   [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)

### Testing

-   [Testing Strategies for Backend](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
-   [Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)

---

## 🔄 Mantenimiento de este Documento

Este documento debe actualizarse cuando:

1. Se introducen nuevos patrones o convenciones
2. Se cambia el stack técnico (nuevas librerías, frameworks)
3. Se refactoriza arquitectura significativamente
4. Se descubren nuevas violaciones o problemas
5. Se establecen nuevas reglas del equipo

**Última actualización**: 2026-01-14  
**Mantenido por**: Equipo de Backend  
**Revisión recomendada**: Cada 3 meses o después de cambios arquitectónicos significativos
