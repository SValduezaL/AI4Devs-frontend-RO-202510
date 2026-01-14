# Observability

## Estado actual

### Logging

**Backend**: `console.log` básico  
**Frontend**: `console.log` / `console.error` básico

**Ubicación de logs**:

-   Backend: Terminal donde corre `npm run dev` o `npm start`
-   Frontend: Console del navegador (DevTools)

### Monitoring

**Estado**: No implementado

No hay sistema de monitoreo, alertas, o métricas configurado.

### Error Tracking

**Estado**: No implementado

No hay sistema de error tracking (Sentry, Rollbar, etc.) configurado.

### Health Checks

**Estado**: No implementado

No hay endpoint de health check para verificar estado del sistema.

## Logging actual

### Backend

**Ejemplo detectado**:

```typescript
console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
console.error(err.stack);
```

**Niveles**: No estructurado (solo log y error)

**Formato**: Texto plano

### Frontend

**Ejemplo**: Errores de React aparecen en console del navegador

**Niveles**: Info, Warning, Error (via console)

## Mejoras recomendadas

### 1. Logging estructurado

**Backend - Opción 1: Winston**

```bash
npm install winston
```

**Configuración sugerida**:

```typescript
import winston from "winston";

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: "error.log", level: "error" }),
        new winston.transports.File({ filename: "combined.log" }),
    ],
});

if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: winston.format.simple(),
        })
    );
}
```

**Backend - Opción 2: Pino**

```bash
npm install pino pino-pretty
```

**Ventajas**: Más rápido, mejor para producción

### 2. Health Check Endpoint

**Implementación sugerida**:

```typescript
// backend/src/routes/healthRoutes.ts
app.get("/health", async (req, res) => {
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
});
```

### 3. Error Tracking

**Opción: Sentry**

```bash
# Backend
npm install @sentry/node

# Frontend
npm install @sentry/react
```

**Configuración**: Inicializar en `index.ts` (backend) y `index.tsx` (frontend)

### 4. Métricas básicas

**Opción: Prometheus + Grafana** (para producción)

**Métricas sugeridas**:

-   Requests por segundo
-   Tiempo de respuesta
-   Tasa de errores
-   Uso de memoria/CPU

## Logging en producción

### Recomendaciones

1. **Niveles apropiados**:

    - `error`: Solo errores
    - `warn`: Warnings importantes
    - `info`: Información general
    - `debug`: Solo en desarrollo

2. **Formato estructurado**: JSON para fácil parsing

3. **Rotación de logs**: Evitar que archivos crezcan indefinidamente

4. **No loguear secrets**: Nunca loguear passwords, tokens, etc.

5. **Contexto**: Incluir request ID, user ID, etc. cuando sea posible

## Monitoring en producción

### Métricas clave

-   **Uptime**: Disponibilidad del servicio
-   **Response time**: Tiempo de respuesta de endpoints
-   **Error rate**: Porcentaje de requests con error
-   **Database connections**: Pool de conexiones
-   **Memory usage**: Uso de memoria
-   **CPU usage**: Uso de CPU

### Alertas recomendadas

-   Servicio caído (health check falla)
-   Tasa de errores > 5%
-   Response time > 1 segundo (p95)
-   Base de datos desconectada
-   Uso de memoria > 80%

## Herramientas sugeridas

### Desarrollo

-   **Console logging**: Suficiente para desarrollo local
-   **React DevTools**: Para debugging de frontend

### Producción

-   **Logging**: Winston o Pino
-   **Error tracking**: Sentry
-   **Monitoring**:
    -   Datadog
    -   New Relic
    -   Prometheus + Grafana
-   **Uptime**: Pingdom, UptimeRobot

## Integración con CI/CD

**Estado**: No detectado

**Recomendado**:

-   Ejecutar health checks después de deployment
-   Alertar si health check falla
-   Incluir logs en pipeline

## Preguntas al humano

-   ¿Hay sistema de logging/monitoring preferido?
-   ¿Hay requisitos de compliance para retención de logs?
-   ¿Se requiere integración con sistemas externos de monitoring?
-   ¿Hay presupuesto para herramientas de observabilidad?
-   ¿Qué nivel de detalle se requiere en logs de producción?
