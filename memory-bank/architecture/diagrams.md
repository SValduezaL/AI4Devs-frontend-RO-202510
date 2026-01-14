# Architecture Diagrams

## Diagrama de componentes (C4 Level 2)

```mermaid
graph TB
    subgraph "Usuario"
        User[Reclutador]
    end
    
    subgraph "Frontend - React SPA"
        UI[Componentes React]
        Router[React Router]
        Services[API Services]
    end
    
    subgraph "Backend - Express API"
        Routes[Express Routes]
        Controllers[Controllers]
        AppServices[Application Services]
        Domain[Domain Models]
        Validator[Validator]
    end
    
    subgraph "Infraestructura"
        DB[(PostgreSQL)]
        Prisma[Prisma ORM]
        Files[File System<br/>uploads/]
    end
    
    User -->|Interactúa| UI
    UI --> Router
    Router --> UI
    UI --> Services
    Services -->|HTTP REST| Routes
    Routes --> Controllers
    Controllers --> AppServices
    AppServices --> Validator
    AppServices --> Domain
    Domain --> Prisma
    Prisma --> DB
    Controllers -->|Multer| Files
    
    style Domain fill:#e1f5ff
    style AppServices fill:#fff4e1
    style Controllers fill:#ffe1f5
    style DB fill:#e1ffe1
    style User fill:#f0f0f0
```

## Diagrama de flujo de datos (Request Flow)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend React
    participant R as Express Routes
    participant C as Controller
    participant S as Service
    participant V as Validator
    participant D as Domain Model
    participant P as Prisma
    participant DB as PostgreSQL
    
    U->>F: Completa formulario
    F->>R: POST /candidates
    R->>C: addCandidate()
    C->>S: addCandidate(data)
    S->>V: validateCandidateData()
    V-->>S: OK / Error
    S->>D: new Candidate(data)
    D->>P: candidate.create()
    P->>DB: INSERT
    DB-->>P: Result
    P-->>D: Candidate
    D-->>S: savedCandidate
    S-->>C: Candidate
    C-->>R: Response 201
    R-->>F: JSON
    F-->>U: Confirmación
```

## Diagrama de modelo de datos (Entity Relationship)

```mermaid
erDiagram
    Candidate ||--o{ Education : has
    Candidate ||--o{ WorkExperience : has
    Candidate ||--o{ Resume : has
    Candidate ||--o{ Application : makes
    
    Company ||--o{ Employee : employs
    Company ||--o{ Position : offers
    
    Position }o--|| Company : belongs_to
    Position }o--|| InterviewFlow : uses
    Position ||--o{ Application : receives
    
    InterviewFlow ||--o{ InterviewStep : contains
    InterviewStep }o--|| InterviewType : is_type
    InterviewStep ||--o{ Application : tracks
    InterviewStep ||--o{ Interview : part_of
    
    Application }o--|| Candidate : made_by
    Application }o--|| Position : for
    Application }o--|| InterviewStep : at_step
    Application ||--o{ Interview : has
    
    Interview }o--|| Application : belongs_to
    Interview }o--|| InterviewStep : in_step
    Interview }o--|| Employee : conducted_by
    
    Candidate {
        int id PK
        string firstName
        string lastName
        string email UK
        string phone
        string address
    }
    
    Position {
        int id PK
        int companyId FK
        int interviewFlowId FK
        string title
        string description
        string status
        boolean isVisible
    }
    
    Application {
        int id PK
        int positionId FK
        int candidateId FK
        int currentInterviewStep FK
        datetime applicationDate
        string notes
    }
```

## Diagrama de deployment

```mermaid
graph TB
    subgraph "Desarrollo Local"
        DevFrontend[Frontend<br/>localhost:3000]
        DevBackend[Backend<br/>localhost:3010]
        DevDB[(PostgreSQL<br/>Docker<br/>localhost:5433)]
        DevFiles[uploads/<br/>Local FS]
    end
    
    subgraph "Producción (Hipotético)"
        ProdFrontend[Frontend<br/>CDN/Static Host]
        ProdBackend[Backend<br/>Node.js Server]
        ProdDB[(PostgreSQL<br/>Managed DB)]
        ProdFiles[File Storage<br/>S3/Local]
    end
    
    DevFrontend --> DevBackend
    DevBackend --> DevDB
    DevBackend --> DevFiles
    
    ProdFrontend --> ProdBackend
    ProdBackend --> ProdDB
    ProdBackend --> ProdFiles
    
    style DevDB fill:#e1ffe1
    style ProdDB fill:#ffe1e1
```

## Diagrama de capas DDD

```mermaid
graph TD
    subgraph "Presentation Layer"
        Routes[Routes]
        Controllers[Controllers]
        Middleware[Middleware]
    end
    
    subgraph "Application Layer"
        Services[Services]
        Validators[Validators]
        UseCases[Use Cases]
    end
    
    subgraph "Domain Layer"
        Entities[Entities]
        ValueObjects[Value Objects]
        DomainServices[Domain Services]
    end
    
    subgraph "Infrastructure Layer"
        Repositories[Repositories]
        ExternalServices[External Services]
        FileSystem[File System]
    end
    
    Routes --> Controllers
    Controllers --> Services
    Services --> Validators
    Services --> Entities
    Entities --> Repositories
    Repositories --> ExternalServices
    
    style Entities fill:#e1f5ff
    style Services fill:#fff4e1
    style Controllers fill:#ffe1f5
```

## Limitaciones de los diagramas

1. **Simplificación**: No muestran todos los componentes (middleware, error handlers, etc.)
2. **Estático**: No muestran flujos de error o casos alternativos
3. **Idealizado**: Algunos diagramas muestran arquitectura ideal, no implementación actual
4. **Sin detalles**: No incluyen configuraciones específicas, puertos, etc.

## Notas sobre Mermaid

- Los diagramas usan sintaxis Mermaid estándar
- Compatible con GitHub, GitLab, y muchos editores Markdown
- Pueden renderizarse en VS Code con extensión Mermaid
- Para editar: usar editor online en https://mermaid.live/

## Preguntas al humano

- ¿Hay diagramas adicionales que serían útiles?
- ¿Se requiere documentación de deployment más detallada?
- ¿Hay integraciones externas que deberían aparecer en diagramas?
