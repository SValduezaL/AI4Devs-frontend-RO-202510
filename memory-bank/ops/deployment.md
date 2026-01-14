# Deployment

## Estado actual

**Producción**: `UNKNOWN` (no detectado en repo)

No hay configuración de deployment detectada en el repositorio. Esta sección documenta lo que se debería configurar.

## Ambientes

### Detectados

-   **Desarrollo local**: Configurado y funcionando
-   **Producción**: No detectado

### Recomendados

-   **Desarrollo**: Local con Docker
-   **Staging**: `UNKNOWN`
-   **Producción**: `UNKNOWN`

## Requisitos de deployment

### Backend

-   **Runtime**: Node.js 16+
-   **Base de datos**: PostgreSQL
-   **Variables de entorno**: Ver `techContext.md`
-   **Puerto**: Configurable via `BACKEND_PORT`
-   **Storage**: Carpeta `uploads/` o servicio de almacenamiento

### Frontend

-   **Build**: Static files (HTML, CSS, JS)
-   **Hosting**: CDN o servidor web estático
-   **Variables de entorno**: Compiladas en build (requiere rebuild si cambian)

## Opciones de deployment

### Backend

#### Opción 1: Servidor tradicional (VPS, EC2, etc.)

**Requisitos**:

-   Node.js instalado
-   PostgreSQL accesible
-   PM2 o similar para gestión de procesos
-   Nginx como reverse proxy (recomendado)

**Pasos**:

```bash
# 1. Clonar repositorio
git clone <repo>
cd AI4Devs-frontend-RO-202510

# 2. Instalar dependencias
cd backend
npm install --production

# 3. Configurar variables de entorno
# Crear .env con valores de producción

# 4. Generar Prisma client
npx prisma generate

# 5. Aplicar migraciones
npm run prisma:migrate:deploy

# 6. Compilar
npm run build

# 7. Iniciar con PM2
pm2 start dist/index.js --name lti-backend
pm2 save
```

#### Opción 2: Docker

**Dockerfile sugerido** (no existe en repo):

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/ ./
RUN npx prisma generate
RUN npm run build

EXPOSE 3010

CMD ["node", "dist/index.js"]
```

**docker-compose.prod.yml sugerido**:

```yaml
version: "3.8"
services:
    backend:
        build:
            context: .
            dockerfile: Dockerfile.backend
        environment:
            - DATABASE_URL=${DATABASE_URL}
            - NODE_ENV=production
        ports:
            - "3010:3010"
        depends_on:
            - db

    db:
        image: postgres:15
        environment:
            - POSTGRES_PASSWORD=${DB_PASSWORD}
            - POSTGRES_USER=${DB_USER}
            - POSTGRES_DB=${DB_NAME}
        volumes:
            - postgres_data:/var/lib/postgresql/data

volumes:
    postgres_data:
```

#### Opción 3: Platform as a Service (Heroku, Railway, Render, etc.)

**Requisitos**:

-   Buildpack de Node.js
-   PostgreSQL addon
-   Variables de entorno configuradas

**Pasos típicos**:

1. Conectar repositorio
2. Configurar build command: `cd backend && npm install && npx prisma generate && npm run build`
3. Configurar start command: `cd backend && npm start`
4. Añadir PostgreSQL addon
5. Configurar variables de entorno
6. Deploy

### Frontend

#### Opción 1: Static hosting (Netlify, Vercel, GitHub Pages)

**Requisitos**:

-   Build de React
-   Variables de entorno en configuración de plataforma

**Pasos típicos**:

1. Conectar repositorio
2. Configurar build command: `cd frontend && npm install && npm run build`
3. Configurar publish directory: `frontend/build`
4. Configurar variables de entorno (REACT_APP_BACKEND_URL)
5. Deploy

#### Opción 2: CDN + S3 (AWS)

**Pasos**:

1. Build: `cd frontend && npm run build`
2. Subir `build/` a S3 bucket
3. Configurar CloudFront distribution
4. Configurar dominio

#### Opción 3: Servidor web (Nginx, Apache)

**Pasos**:

1. Build: `cd frontend && npm run build`
2. Copiar `build/` a servidor web
3. Configurar Nginx/Apache para servir archivos estáticos
4. Configurar reverse proxy para API

## Variables de entorno de producción

### Backend

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5433/db
BACKEND_PORT=3010
BACKEND_HOST=0.0.0.0
CORS_ORIGIN=https://tu-dominio.com
# Añadir más según necesidad
```

### Frontend

```env
REACT_APP_BACKEND_URL=https://api.tu-dominio.com
```

**Nota**: Requiere rebuild después de cambiar variables.

## Migraciones de base de datos

### Desarrollo

```bash
cd backend
npm run prisma:migrate
```

### Producción

```bash
cd backend
npm run prisma:migrate:deploy
```

**Importante**: No crear nuevas migraciones en producción, solo aplicar existentes.

## Checklist de deployment

### Pre-deployment

-   [ ] Tests pasando
-   [ ] Build exitoso (backend y frontend)
-   [ ] Variables de entorno configuradas
-   [ ] Base de datos accesible
-   [ ] Migraciones aplicadas
-   [ ] Secrets no en código

### Post-deployment

-   [ ] Health check endpoint responde
-   [ ] API accesible desde frontend
-   [ ] CORS configurado correctamente
-   [ ] Logs funcionando
-   [ ] Monitoreo configurado (si aplica)
-   [ ] Backup de base de datos configurado

## Monitoreo y observabilidad

### Recomendado (no implementado)

-   **Health checks**: Endpoint `/health`
-   **Logging estructurado**: Winston, Pino, etc.
-   **Error tracking**: Sentry, Rollbar, etc.
-   **APM**: New Relic, Datadog, etc.
-   **Uptime monitoring**: Pingdom, UptimeRobot, etc.

## Seguridad en producción

### Checklist

-   [ ] HTTPS configurado (SSL/TLS)
-   [ ] Autenticación implementada
-   [ ] Rate limiting configurado
-   [ ] CORS restringido a dominios específicos
-   [ ] Secrets en variables de entorno (no en código)
-   [ ] Base de datos con acceso restringido
-   [ ] Validación de inputs en todos los endpoints
-   [ ] Sanitización de archivos subidos
-   [ ] Headers de seguridad (Helmet.js)

## Backup y recuperación

### Base de datos

**Backup automático recomendado**:

-   Backup diario de PostgreSQL
-   Retención: 7-30 días según política
-   Restaurar en ambiente de staging periódicamente

**Backup manual**:

```bash
pg_dump -U postgres -d mydatabase > backup_$(date +%Y%m%d).sql
```

### Archivos (uploads)

**Recomendado**: Usar servicio de almacenamiento (S3, Azure Blob, etc.) en lugar de sistema de archivos local.

## Escalabilidad

### Backend

-   **Horizontal**: Múltiples instancias detrás de load balancer
-   **Vertical**: Aumentar recursos del servidor
-   **Database**: Connection pooling (Prisma lo hace automáticamente)

### Frontend

-   **CDN**: Para assets estáticos
-   **Caching**: Headers de cache apropiados

## CI/CD (no detectado)

### Recomendado

**Pipeline típico**:

1. Lint y format check
2. Tests
3. Build
4. Deploy a staging
5. Tests de integración
6. Deploy a producción (manual o automático)

**Plataformas**: GitHub Actions, GitLab CI, CircleCI, etc.

## Preguntas al humano

-   ¿Dónde está desplegado actualmente (si existe)?
-   ¿Qué plataforma de hosting se prefiere?
-   ¿Hay CI/CD configurado fuera del repo?
-   ¿Cuál es la estrategia de backup?
-   ¿Hay requisitos de compliance o seguridad específicos?
