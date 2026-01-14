# 🚀 Guía Rápida para Iniciar el Proyecto

## Inicio Rápido (3 Terminales)

### Terminal 1: PostgreSQL (Docker)

```bash
# Desde la raíz del proyecto
docker-compose up -d

# Verificar que esté corriendo
docker ps
```

### Terminal 2: Backend

```bash
# Desde la raíz del proyecto
cd backend

# Modo desarrollo (con hot-reload)
npm run dev

# O modo producción
npm run build
npm start
```

**✅ Esperado**: `Server is running at http://localhost:3010`

### Terminal 3: Frontend

```bash
# Desde la raíz del proyecto
cd frontend

# Iniciar servidor de desarrollo
npm start
```

**✅ Esperado**: Navegador se abre en `http://localhost:3000`

---

## Verificar que Todo Funciona

1. **Backend**: Abrir `http://localhost:3010` → Debe mostrar "Hola LTI!"
2. **Frontend**: Abrir `http://localhost:3000` → Debe mostrar el dashboard
3. **Navegar**: Click en "Ir a Posiciones" → `/positions`
4. **Probar Kanban**: Click en "Ver proceso" de una posición → `/positions/:id`

---

## Si No Hay Datos de Prueba

```bash
# Desde backend/
cd backend
npm run prisma:seed
```

Esto poblará la base de datos con datos de ejemplo.

---

## Troubleshooting Rápido

-   **Backend no inicia**: Verificar que PostgreSQL esté corriendo (`docker ps`)
-   **Frontend no inicia**: Verificar que `axios` esté instalado (`npm install axios`)
-   **CORS Error**: Verificar `CORS_ORIGIN` en `.env` incluye `http://localhost:3000`
-   **404 en `/positions/:id`**: Verificar que la ruta esté en `App.js`

---

## Próximos Pasos

Una vez que todo esté corriendo, sigue la **GUIA_PRUEBAS_MANUALES.md** para probar todas las funcionalidades.
