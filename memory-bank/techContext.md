# Tech Context

## Stack

### Backend

-   **Runtime**: Node.js
-   **Lenguaje**: TypeScript 5.4.5
-   **Framework**: Express 4.19.2
-   **ORM**: Prisma 5.13.0
-   **Base de datos**: PostgreSQL (contenedor Docker)
-   **File upload**: Multer 1.4.5-lts.1
-   **API Docs**: Swagger (swagger-jsdoc, swagger-ui-express)
-   **Testing**: Jest 29.7.0 + ts-jest
-   **Linting/Formatting**: ESLint 9.2.0 + Prettier 3.2.5

### Frontend

-   **Framework**: React 18.3.1
-   **Lenguaje**: TypeScript 4.9.5 + JavaScript (mezcla)
-   **Build tool**: Create React App (react-scripts 5.0.1)
-   **Routing**: React Router DOM 6.23.1
-   **UI Library**: Bootstrap 5.3.3 + React Bootstrap 2.10.2
-   **Icons**: React Bootstrap Icons 1.11.4
-   **Date picker**: React Datepicker 6.9.0
-   **Testing**: Jest + React Testing Library
-   **Environment**: dotenv-cli 7.4.2

### Infraestructura

-   **Containerización**: Docker Compose
-   **Base de datos**: PostgreSQL (imagen oficial)
-   **Package manager**: npm (detectado package-lock.json)

## Dependencias clave y propósito

### Backend

| Dependencia          | Versión      | Propósito                               |
| -------------------- | ------------ | --------------------------------------- |
| `@prisma/client`     | ^5.13.0      | Cliente ORM para acceso a base de datos |
| `express`            | ^4.19.2      | Framework web para API REST             |
| `cors`               | ^2.8.5       | Middleware para CORS                    |
| `multer`             | ^1.4.5-lts.1 | Middleware para upload de archivos      |
| `dotenv`             | ^16.4.5      | Carga de variables de entorno           |
| `swagger-jsdoc`      | ^6.2.8       | Generación de documentación OpenAPI     |
| `swagger-ui-express` | ^5.0.0       | UI para documentación Swagger           |
| `ts-node-dev`        | ^2.0.0       | Desarrollo con hot-reload               |
| `jest`               | ^29.7.0      | Framework de testing                    |
| `ts-jest`            | ^29.1.2      | Preset de Jest para TypeScript          |

### Frontend

| Dependencia        | Versión | Propósito                        |
| ------------------ | ------- | -------------------------------- |
| `react`            | ^18.3.1 | Biblioteca UI                    |
| `react-dom`        | ^18.3.1 | Renderizado React                |
| `react-router-dom` | ^6.23.1 | Enrutamiento SPA                 |
| `react-bootstrap`  | ^2.10.2 | Componentes Bootstrap para React |
| `bootstrap`        | ^5.3.3  | Framework CSS                    |
| `react-datepicker` | ^6.9.0  | Selector de fechas               |
| `dotenv-cli`       | ^7.4.2  | Carga de .env en scripts npm     |

## Setup local exacto

### Prerrequisitos

-   Node.js (versión no especificada, pero TypeScript 5.4.5 requiere Node 16+)
-   Docker y Docker Compose
-   npm

### Pasos de instalación

```bash
# 1. Clonar repositorio (asumido)

# 2. Instalar dependencias del frontend
cd frontend
npm install

# 3. Instalar dependencias del backend
cd ../backend
npm install

# 4. Iniciar base de datos PostgreSQL
cd ..
docker-compose up -d

# 5. Configurar variables de entorno
# Crear .env en la raíz con:
# DATABASE_URL=postgresql://myuser:password@localhost:5433/mydatabase
# DB_USER=myuser
# DB_PASSWORD=password
# DB_NAME=mydatabase
# DB_PORT=5433
# BACKEND_PORT=3010
# BACKEND_HOST=localhost
# CORS_ORIGIN=http://localhost:3000
# REACT_APP_BACKEND_URL=http://localhost:3010

# 6. Generar cliente Prisma
cd backend
npx prisma generate

# 7. Ejecutar migraciones
npm run prisma:migrate

# 8. Poblar base de datos (opcional)
npm run prisma:seed

# 9. Compilar backend
npm run build

# 10. Iniciar backend (terminal 1)
npm start
# O en modo desarrollo:
npm run dev

# 11. Iniciar frontend (terminal 2)
cd ../frontend
npm start
```

### Comandos útiles

**Backend**:

```bash
cd backend

# Desarrollo con hot-reload
npm run dev

# Compilar
npm run build

# Ejecutar tests
npm test

# Prisma Studio (GUI para DB)
npm run prisma:studio

# Migraciones
npm run prisma:migrate
npm run prisma:migrate:deploy  # Para producción
```

**Frontend**:

```bash
cd frontend

# Desarrollo
npm start

# Build de producción
npm run build

# Tests
npm test
```

**Docker**:

```bash
# Iniciar PostgreSQL
docker-compose up -d

# Detener PostgreSQL
docker-compose down

# Ver logs
docker-compose logs -f db
```

## Config/Env: Variables de entorno detectadas

### Backend (.env en raíz)

| Variable       | Ejemplo                                    | Propósito                                | Requerida                              |
| -------------- | ------------------------------------------ | ---------------------------------------- | -------------------------------------- |
| `DATABASE_URL` | `postgresql://user:pass@localhost:5433/db` | Conexión a PostgreSQL                    | ✅ Sí                                  |
| `DB_USER`      | `postgres`                                 | Usuario de PostgreSQL                    | ✅ Sí (para docker-compose)            |
| `DB_PASSWORD`  | `password`                                 | Contraseña de PostgreSQL                 | ✅ Sí (para docker-compose)            |
| `DB_NAME`      | `mydatabase`                               | Nombre de la base de datos               | ✅ Sí (para docker-compose)            |
| `DB_PORT`      | `5433`                                     | Puerto de PostgreSQL                     | ✅ Sí (para docker-compose)            |
| `BACKEND_PORT` | `3010`                                     | Puerto del servidor Express              | ❌ No (default: 3010)                  |
| `BACKEND_HOST` | `localhost`                                | Host del servidor Express                | ❌ No (default: localhost)             |
| `CORS_ORIGIN`  | `http://localhost:3000`                    | Orígenes permitidos (separados por coma) | ❌ No (default: http://localhost:3000) |
| `NODE_ENV`     | `development`                              | Ambiente (development/production)        | ❌ No                                  |

### Frontend

| Variable                | Ejemplo                 | Propósito            | Requerida                              |
| ----------------------- | ----------------------- | -------------------- | -------------------------------------- |
| `REACT_APP_BACKEND_URL` | `http://localhost:3010` | URL base del backend | ❌ No (default: http://localhost:3010) |

**Nota**: En React, variables de entorno deben comenzar con `REACT_APP_` para ser accesibles.

### Docker Compose

Variables usadas en `docker-compose.yml`:

-   `DB_PASSWORD`
-   `DB_USER`
-   `DB_NAME`
-   `DB_PORT`

## Restricciones: Versiones, compatibilidades, limitaciones

### Versiones críticas

-   **TypeScript**: Backend 5.4.5, Frontend 4.9.5 (discrepancia detectada)
-   **Node.js**: No especificado, pero TypeScript 5.4.5 requiere Node 16+
-   **PostgreSQL**: Versión no especificada (imagen `postgres:latest` en docker-compose)
-   **Prisma**: 5.13.0 (requiere Node 16.13+)

### Compatibilidades

-   **Prisma binary targets**: Configurado para `native` y `debian-openssl-3.0.x` (útil para deployment en Linux)
-   **TypeScript strict mode**: Habilitado en ambos proyectos
-   **ES Modules**: Backend usa CommonJS (`module: "commonjs"`), Frontend usa ESNext

### Limitaciones de entorno

1. **Windows + OneDrive**: Script detectado `fix-prisma-onedrive.ps1` sugiere problemas conocidos con Prisma en OneDrive
2. **Ruta de uploads**: Hardcodeada como `../uploads/` (relativa al backend), puede fallar según dónde se ejecute
3. **CORS**: Configurado para desarrollo, puede necesitar ajustes en producción
4. **Sin HTTPS**: No hay configuración de SSL/TLS detectada
5. **Sin variables de entorno en build**: Frontend requiere rebuild si cambia `REACT_APP_BACKEND_URL`

### Limitaciones técnicas detectadas

-   **Mezcla TypeScript/JavaScript**: Frontend tiene archivos `.js` y `.tsx` mezclados
-   **Sin monorepo tool**: No usa pnpm workspaces, npm workspaces, o similar
-   **Sin CI/CD**: No hay pipelines detectados
-   **Sin health checks**: No hay endpoints de health check
-   **Sin logging estructurado**: Usa `console.log` básico

## Preguntas al humano

-   ¿Qué versión de Node.js se requiere/recomienda?
-   ¿Hay planes de unificar versiones de TypeScript entre frontend y backend?
-   ¿Dónde se almacenan los uploads en producción? (ruta actual es relativa)
-   ¿Hay configuración de SSL/TLS para producción?
-   ¿Se usa algún servicio de almacenamiento de archivos (S3, etc.) o solo sistema de archivos local?
