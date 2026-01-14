# Guía de Pruebas Manuales - Página Position

## 📋 Checklist Pre-Pruebas

### 1. Verificar Base de Datos PostgreSQL

```bash
# Verificar que Docker esté corriendo
docker ps

# Si no está corriendo, iniciar PostgreSQL
docker-compose up -d

# Verificar logs
docker-compose logs db
```

**✅ Esperado**: Contenedor `db` corriendo en puerto 5433

---

### 2. Verificar Backend

```bash
# Desde la raíz del proyecto
cd backend

# Verificar que esté compilado
npm run build

# Iniciar backend (en modo desarrollo con hot-reload)
npm run dev

# O en modo producción
npm start
```

**✅ Esperado**:

-   Mensaje: `Server is running at http://localhost:3010`
-   Probar: `curl http://localhost:3010/` → Debe responder "Hola LTI!"

---

### 3. Verificar Frontend

```bash
# Desde la raíz del proyecto
cd frontend

# Iniciar frontend (desarrollo)
npm start
```

**✅ Esperado**:

-   Navegador se abre automáticamente en `http://localhost:3000`
-   O abrir manualmente: `http://localhost:3000`

---

### 4. Verificar Datos de Prueba

**IMPORTANTE**: Necesitas tener al menos:

-   1 posición con `interviewFlow` configurado
-   Al menos 1 candidato que haya aplicado a esa posición
-   El candidato debe tener `currentInterviewStep` asignado

**Verificar en base de datos**:

```bash
# Opción 1: Prisma Studio (GUI)
cd backend
npm run prisma:studio
# Abre http://localhost:5555

# Opción 2: SQL directo
# Conectar a PostgreSQL y ejecutar:
SELECT p.id, p.title, COUNT(a.id) as num_candidates
FROM "Position" p
LEFT JOIN "Application" a ON p.id = a."positionId"
GROUP BY p.id, p.title;
```

**Si no hay datos, ejecutar seed**:

```bash
cd backend
npm run prisma:seed
```

---

## 🧪 Pruebas Paso a Paso

### Prueba 1: Navegación a la Página Position

**Pasos**:

1. Abrir `http://localhost:3000`
2. Click en "Ir a Posiciones" o navegar a `/positions`
3. Verificar que se muestren las posiciones
4. Click en botón "Ver proceso" de una posición

**✅ Resultado Esperado**:

-   Navegación a `/positions/:id` (donde `:id` es el ID de la posición)
-   Se muestra el header con:
    -   Botón "←" (flecha hacia atrás)
    -   Título de la posición
-   Se muestra el Kanban con columnas

**❌ Si falla**:

-   Verificar consola del navegador (F12)
-   Verificar que el backend esté respondiendo
-   Verificar que la posición tenga `interviewFlow` configurado

---

### Prueba 2: Carga de Datos (InterviewFlow + Candidates)

**Pasos**:

1. Abrir DevTools (F12) → Tab "Network"
2. Navegar a `/positions/:id`
3. Observar las peticiones HTTP

**✅ Resultado Esperado**:

-   Petición `GET /position/:id/interviewflow` → Status 200
-   Petición `GET /position/:id/candidates` → Status 200
-   Columnas del Kanban se renderizan con nombres de etapas
-   Candidatos aparecen en las columnas correctas

**❌ Si falla**:

-   Verificar respuesta de la API en Network tab
-   Verificar consola del navegador para errores
-   Verificar que la posición tenga `interviewFlow` y candidatos

---

### Prueba 3: Visualización del Kanban

**Pasos**:

1. Navegar a `/positions/:id`
2. Observar el layout

**✅ Resultado Esperado**:

-   **Desktop (≥768px)**:
    -   Columnas en grid horizontal
    -   Cada columna muestra:
        -   Header con nombre de etapa (fondo azul)
        -   Contador de candidatos
        -   Lista de tarjetas de candidatos
-   **Móvil (<768px)**:
    -   Columnas en vertical (una debajo de otra)
    -   Cada columna ocupa 100% del ancho

**Verificar responsive**:

-   Abrir DevTools → Toggle device toolbar (Ctrl+Shift+M)
-   Cambiar a vista móvil (<768px)
-   Verificar que columnas se apilen verticalmente

---

### Prueba 4: Drag & Drop (Desktop)

**Pasos**:

1. Navegar a `/positions/:id`
2. Hacer click y arrastrar una tarjeta de candidato
3. Soltar en otra columna

**✅ Resultado Esperado**:

-   Al arrastrar:
    -   Cursor cambia a "grabbing"
    -   Tarjeta se vuelve semi-transparente (opacity 0.5)
-   Al pasar sobre otra columna:
    -   Columna se resalta (borde azul, fondo claro)
-   Al soltar:
    -   Candidato se mueve inmediatamente (optimistic update)
    -   Petición `PUT /candidates/:id` se envía (ver Network tab)
    -   Si éxito: candidato permanece en nueva columna
    -   Si error: candidato vuelve a columna original + mensaje de error

**❌ Si falla**:

-   Verificar que `@dnd-kit` esté instalado
-   Verificar consola del navegador
-   Verificar que no haya errores de CORS

---

### Prueba 5: Optimistic UI y Rollback

**Pasos**:

1. Navegar a `/positions/:id`
2. Abrir DevTools → Network tab
3. Simular error de red:
    - Opción A: Desconectar backend (`npm stop` en terminal del backend)
    - Opción B: Usar DevTools → Network → Throttling → Offline
4. Intentar mover un candidato
5. Reconectar backend

**✅ Resultado Esperado**:

-   Candidato se mueve visualmente (optimistic)
-   Petición falla (ver Network tab)
-   Candidato vuelve a columna original (rollback)
-   Aparece mensaje de error (Alert rojo)

---

### Prueba 6: Estados de Carga y Error

**Prueba 6.1: Loading State**

**Pasos**:

1. Abrir DevTools → Network tab
2. Configurar throttling: "Slow 3G"
3. Navegar a `/positions/:id`
4. Observar durante la carga

**✅ Resultado Esperado**:

-   Se muestra skeleton loader (placeholders animados)
-   Después de cargar, se muestra el Kanban

**Prueba 6.2: Error State**

**Pasos**:

1. Detener backend (`npm stop` en terminal del backend)
2. Navegar a `/positions/:id`
3. Observar mensaje de error

**✅ Resultado Esperado**:

-   Alert rojo con mensaje: "Error al cargar los datos"
-   Botón "Reintentar" (si implementado)

---

### Prueba 7: Empty States

**Pasos**:

1. Navegar a `/positions/:id` donde una columna no tenga candidatos
2. Observar la columna vacía

**✅ Resultado Esperado**:

-   Columna muestra mensaje: "No hay candidatos en esta etapa"
-   Header de columna muestra contador: "0 candidatos"

---

### Prueba 8: Accesibilidad (A11y)

**Prueba 8.1: Keyboard Navigation**

**Pasos**:

1. Navegar a `/positions/:id`
2. Usar Tab para navegar
3. Presionar Espacio en una tarjeta de candidato
4. Usar flechas para mover entre columnas

**✅ Resultado Esperado**:

-   Focus visible en elementos interactivos
-   Navegación con teclado funciona

**Prueba 8.2: Screen Reader**

**Pasos**:

1. Activar screen reader (NVDA en Windows, VoiceOver en Mac)
2. Navegar por la página

**✅ Resultado Esperado**:

-   Screen reader anuncia:
    -   "Columna: [nombre etapa]. X candidatos"
    -   "Candidato [nombre], puntuación [score]"
    -   Instrucciones de uso

---

### Prueba 9: Responsive Móvil

**Pasos**:

1. Abrir DevTools → Toggle device toolbar
2. Seleccionar dispositivo móvil (iPhone, Android)
3. Navegar a `/positions/:id`
4. Intentar drag & drop con touch

**✅ Resultado Esperado**:

-   Columnas en vertical (100% ancho)
-   Scroll vertical funciona
-   Drag & drop funciona con touch gestures
-   Layout no se rompe

---

### Prueba 10: Validaciones y Edge Cases

**Prueba 10.1: Mover a la misma columna**

**Pasos**:

1. Intentar mover un candidato a la columna donde ya está

**✅ Resultado Esperado**:

-   No se envía petición PUT
-   No hay cambio visual

**Prueba 10.2: Mover durante actualización**

**Pasos**:

1. Mover un candidato rápidamente
2. Intentar mover otro antes de que termine la primera actualización

**✅ Resultado Esperado**:

-   Drag & drop se bloquea durante actualización (`isUpdating = true`)
-   Solo se permite una actualización a la vez

**Prueba 10.3: Candidato sin etapa válida**

**Pasos**:

1. En base de datos, asignar a un candidato un `currentInterviewStep` que no existe en el flujo
2. Recargar la página

**✅ Resultado Esperado**:

-   Warning en consola: `Step "[nombre]" not found in flow`
-   Candidato no aparece en ninguna columna (o aparece en columna especial si implementado)

---

## 🔍 Verificación Técnica (DevTools)

### Network Tab

**Peticiones esperadas al cargar `/positions/:id`**:

1. `GET /position/:id/interviewflow`

    - Status: 200
    - Response: `{ interviewFlow: { positionName, interviewFlow: {...} } }`

2. `GET /position/:id/candidates`
    - Status: 200
    - Response: `[{ fullName, currentInterviewStep, averageScore, id, applicationId }]`

**Petición al mover candidato**:

3. `PUT /candidates/:id`
    - Status: 200
    - Request Body: `{ applicationId: number, currentInterviewStep: number }`
    - Response: `{ message: "Candidate stage updated successfully", data: {...} }`

### Console Tab

**✅ Sin errores**:

-   No hay errores en rojo
-   Solo warnings informativos (si los hay)

**❌ Errores comunes**:

-   `CORS error` → Verificar `CORS_ORIGIN` en `.env`
-   `Network Error` → Backend no está corriendo
-   `404 Not Found` → Ruta incorrecta o posición no existe
-   `TypeError: Cannot read property...` → Error en código frontend

---

## 📝 Checklist Final

-   [ ] Backend corriendo en `http://localhost:3010`
-   [ ] Frontend corriendo en `http://localhost:3000`
-   [ ] PostgreSQL corriendo (Docker)
-   [ ] Datos de prueba disponibles (posición con candidatos)
-   [ ] Navegación funciona (`/positions` → `/positions/:id`)
-   [ ] Kanban se carga correctamente
-   [ ] Columnas se renderizan con etapas
-   [ ] Candidatos aparecen en columnas correctas
-   [ ] Drag & drop funciona (desktop)
-   [ ] Optimistic UI funciona
-   [ ] Rollback funciona en caso de error
-   [ ] Responsive funciona (móvil)
-   [ ] Loading states funcionan
-   [ ] Error states funcionan
-   [ ] Empty states funcionan
-   [ ] Accesibilidad básica funciona

---

## 🐛 Troubleshooting

### Problema: "Cannot GET /positions/:id"

**Solución**: Verificar que la ruta esté en `App.js`:

```javascript
<Route path="/positions/:id" element={<PositionPage />} />
```

### Problema: "Network Error" o CORS

**Solución**:

1. Verificar que backend esté corriendo
2. Verificar `CORS_ORIGIN` en `.env` incluye `http://localhost:3000`

### Problema: Kanban vacío (sin columnas)

**Solución**:

1. Verificar que la posición tenga `interviewFlow` configurado
2. Verificar respuesta de `GET /position/:id/interviewflow` en Network tab

### Problema: Candidatos no aparecen

**Solución**:

1. Verificar que haya candidatos que aplicaron a la posición
2. Verificar respuesta de `GET /position/:id/candidates` en Network tab
3. Verificar que `currentInterviewStep` del candidato coincida con nombre de etapa

### Problema: Drag & drop no funciona

**Solución**:

1. Verificar que `@dnd-kit/core` y `@dnd-kit/sortable` estén instalados
2. Verificar consola del navegador para errores
3. Verificar que no haya errores de TypeScript al compilar

---

## ✅ Listo para Producción

Si todas las pruebas pasan, la funcionalidad está lista. Los tests unitarios e integración (Tickets 13-14) son opcionales pero recomendados para mantener calidad a largo plazo.
