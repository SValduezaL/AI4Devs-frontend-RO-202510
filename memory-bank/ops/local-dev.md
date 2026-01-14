# Local Development

## Setup inicial

### Prerrequisitos

-   **Node.js**: Versión 16+ (recomendado: LTS más reciente)
-   **npm**: Incluido con Node.js
-   **Docker**: Para base de datos PostgreSQL
-   **Git**: Para clonar repositorio

### Instalación paso a paso

```bash
# 1. Clonar repositorio
git clone <repository-url>
cd AI4Devs-frontend-RO-202510

# 2. Instalar dependencias del frontend
cd frontend
npm install

# 3. Instalar dependencias del backend
cd ../backend
npm install

# 4. Configurar variables de entorno
cd ..
# Crear archivo .env en la raíz con:
# DATABASE_URL=postgresql://myuser:password@localhost:5433/mydatabase
# DB_USER=myuser
# DB_PASSWORD=password
# DB_NAME=mydatabase
# DB_PORT=5433
# BACKEND_PORT=3010
# BACKEND_HOST=localhost
# CORS_ORIGIN=http://localhost:3000
# REACT_APP_BACKEND_URL=http://localhost:3010

# 5. Iniciar base de datos
docker-compose up -d

# 6. Verificar que PostgreSQL está corriendo
docker-compose ps

# 7. Generar cliente Prisma
cd backend
npx prisma generate

# 8. Ejecutar migraciones
npm run prisma:migrate

# 9. (Opcional) Poblar base de datos con datos de ejemplo
npm run prisma:seed

# 10. Compilar backend
npm run build
```

## Desarrollo

### Iniciar servicios

**Terminal 1 - Backend**:

```bash
cd backend
npm run dev
# Servidor en http://localhost:3010
```

**Terminal 2 - Frontend**:

```bash
cd frontend
npm start
# Aplicación en http://localhost:3000
```

**Terminal 3 - Base de datos** (si necesitas logs):

```bash
docker-compose logs -f db
```

### Comandos útiles

#### Backend

```bash
cd backend

# Desarrollo con hot-reload
npm run dev

# Compilar TypeScript
npm run build

# Ejecutar compilado
npm start

# Tests
npm test

# Prisma Studio (GUI para base de datos)
npm run prisma:studio
# Abre en http://localhost:5555

# Migraciones
npm run prisma:migrate          # Desarrollo (crea nueva migración)
npm run prisma:migrate:deploy   # Producción (aplica migraciones existentes)

# Seed (poblar datos)
npm run prisma:seed
```

#### Frontend

```bash
cd frontend

# Desarrollo
npm start

# Build de producción
npm run build

# Tests
npm test

# Eject (no recomendado, irreversible)
npm run eject
```

#### Docker

```bash
# Iniciar PostgreSQL
docker-compose up -d

# Detener PostgreSQL
docker-compose down

# Ver logs
docker-compose logs -f db

# Reiniciar contenedor
docker-compose restart db

# Ver estado
docker-compose ps
```

## Estructura de desarrollo

### Hot Reload

-   **Backend**: `ts-node-dev` con `--respawn` y `--transpile-only`
-   **Frontend**: Create React App con hot module replacement

### Variables de entorno

**Backend**: Carga desde `.env` en raíz del proyecto  
**Frontend**: Usa `dotenv-cli` para cargar `.env` en scripts npm

**Nota**: Variables de React deben comenzar con `REACT_APP_`

## Debugging

### Backend

**VS Code launch.json** (no detectado, sugerido):

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Debug Backend",
            "runtimeExecutable": "npm",
            "runtimeArgs": ["run", "dev"],
            "skipFiles": ["<node_internals>/**"]
        }
    ]
}
```

**Logs**:

-   Backend usa `console.log` para logging
-   Logs aparecen en terminal donde corre `npm run dev`

### Frontend

**React DevTools**: Instalar extensión del navegador

**Console del navegador**: Errores y warnings de React aparecen aquí

### Base de datos

**Prisma Studio**:

```bash
cd backend
npm run prisma:studio
```

**psql** (cliente PostgreSQL):

```bash
docker-compose exec db psql -U postgres -d mydatabase
```

## Problemas comunes

### Error: "Cannot connect to database"

**Causa**: PostgreSQL no está corriendo o `DATABASE_URL` incorrecta

**Solución**:

```bash
# Verificar que contenedor está corriendo
docker-compose ps

# Si no está corriendo, iniciar
docker-compose up -d

# Verificar variables de entorno
cat .env | grep DATABASE_URL

# Probar conexión
docker-compose exec db psql -U postgres -d mydatabase -c "SELECT 1;"
```

### Error: "Prisma Client not generated"

**Causa**: Cliente Prisma no generado después de cambios en schema

**Solución**:

```bash
cd backend
npx prisma generate
```

### Error: "CORS error" en frontend

**Causa**: Origen no permitido en `CORS_ORIGIN`

**Solución**:

1. Verificar que frontend corre en `http://localhost:3000`
2. Verificar `.env` tiene `CORS_ORIGIN=http://localhost:3000`
3. Reiniciar backend después de cambiar `.env`

### Error: "Upload folder does not exist"

**Causa**: Carpeta `../uploads/` no existe

**Solución**:

```bash
# Desde raíz del proyecto
mkdir -p uploads
# O cambiar ruta en fileUploadService.ts
```

### Error: Prisma en OneDrive (Windows)

**Causa**: Problemas conocidos con Prisma en rutas de OneDrive

**Solución**:

```bash
# Ejecutar script de fix
cd backend
.\fix-prisma-onedrive.ps1

# O mover proyecto fuera de OneDrive
```

### Error: "Port already in use"

**Causa**: Puerto 3010 o 3000 ya está en uso

**Solución**:

```bash
# Encontrar proceso usando puerto (Windows)
netstat -ano | findstr :3010
# Matar proceso (reemplazar PID)
taskkill /PID <PID> /F

# O cambiar puerto en .env
BACKEND_PORT=3011
```

## Testing local

### Backend

```bash
cd backend
npm test
```

**Tests detectados**:

-   `candidateService.test.ts`
-   `positionService.test.ts`
-   `candidateController.test.ts`
-   `positionController.test.ts`

### Frontend

```bash
cd frontend
npm test
```

**Estado**: Tests no detectados en frontend

## Base de datos local

### Resetear base de datos

```bash
cd backend

# Eliminar y recrear base de datos
npx prisma migrate reset
# Esto elimina todos los datos y aplica migraciones desde cero

# O manualmente:
# 1. Eliminar contenedor
docker-compose down -v

# 2. Reiniciar
docker-compose up -d

# 3. Aplicar migraciones
npm run prisma:migrate

# 4. Seed (opcional)
npm run prisma:seed
```

### Backup local

```bash
# Exportar base de datos
docker-compose exec db pg_dump -U postgres mydatabase > backup.sql

# Restaurar
docker-compose exec -T db psql -U postgres mydatabase < backup.sql
```

## Workflow recomendado

1. **Iniciar día**:

    ```bash
    docker-compose up -d
    cd backend && npm run dev
    cd ../frontend && npm start
    ```

2. **Antes de commit**:

    ```bash
    # Backend
    cd backend
    npm run build  # Verificar que compila
    npm test       # Ejecutar tests

    # Frontend
    cd ../frontend
    npm run build  # Verificar que compila
    ```

3. **Después de cambios en schema**:

    ```bash
    cd backend
    npx prisma migrate dev --name <nombre-migracion>
    npx prisma generate
    ```

4. **Cerrar día**:
    ```bash
    # Detener servicios (Ctrl+C en terminales)
    # Opcional: detener base de datos
    docker-compose down
    ```

## Preguntas al humano

-   ¿Hay scripts de setup automatizados?
-   ¿Se usa algún tool de desarrollo adicional (nodemon alternativo, etc.)?
-   ¿Hay configuración de VS Code compartida?
-   ¿Se requiere configuración especial para debugging?
-   ¿Hay guías de contribución adicionales?
