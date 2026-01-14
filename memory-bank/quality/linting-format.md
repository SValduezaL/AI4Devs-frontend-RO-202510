# Linting and Formatting

## Estado actual

### Backend

✅ **ESLint configurado**: Versión 9.2.0  
✅ **Prettier configurado**: Versión 3.2.5  
✅ **Integración**: eslint-config-prettier + eslint-plugin-prettier

**Configuración detectada**:

-   `eslint-config-prettier`: Desactiva reglas de ESLint que conflictúan con Prettier
-   `eslint-plugin-prettier`: Ejecuta Prettier como regla de ESLint

### Frontend

✅ **ESLint configurado**: Via Create React App

**Configuración detectada**:

-   Extiende `react-app` y `react-app/jest`
-   Configurado en `package.json` bajo `eslintConfig`

## Ejecutar linters

### Backend

```bash
cd backend

# Ejecutar ESLint (si hay script configurado)
npm run lint  # Si existe

# O manualmente
npx eslint src/

# Ejecutar Prettier (si hay script configurado)
npm run format  # Si existe

# O manualmente
npx prettier --write src/
```

**Nota**: Scripts `lint` y `format` no detectados en `package.json`, pero herramientas están instaladas.

### Frontend

```bash
cd frontend

# Ejecutar ESLint (via Create React App)
npm start  # Muestra warnings en consola

# O manualmente
npx eslint src/

# Ejecutar Prettier
npx prettier --write src/
```

## Configuración

### Backend ESLint

**Ubicación**: Probablemente `.eslintrc.js`, `.eslintrc.json`, o en `package.json`

**Configuración inferida**:

-   Usa Prettier para formatting
-   Configuración de TypeScript (probablemente)

### Backend Prettier

**Ubicación**: Probablemente `.prettierrc` o `.prettierrc.json`

**Configuración**: Desconocida (valores por defecto si no existe)

### Frontend ESLint

**Ubicación**: `frontend/package.json` → `eslintConfig`

**Configuración**:

```json
{
    "eslintConfig": {
        "extends": ["react-app", "react-app/jest"]
    }
}
```

## Reglas y convenciones

### Backend

**Inferidas** (no confirmadas):

-   TypeScript strict mode habilitado
-   Prettier para formato consistente
-   ESLint para calidad de código

### Frontend

**Reglas de Create React App**:

-   Reglas básicas de React
-   Reglas de JavaScript/TypeScript
-   Reglas de Jest para tests

## Formato de código

### Backend

**Prettier**: Formatea automáticamente según configuración

**Convenciones inferidas**:

-   Indentación: Probablemente 2 espacios (estándar)
-   Comillas: Probablemente simples (estándar)
-   Semicolons: Probablemente sí (TypeScript estándar)

### Frontend

**Prettier**: No detectado explícitamente, pero recomendado

**Convenciones**:

-   JSX: Según estándares de React
-   Indentación: 2 espacios (estándar React)

## Integración con IDE

### VS Code

**Extensiones recomendadas**:

-   ESLint
-   Prettier
-   TypeScript

**Configuración sugerida** (`.vscode/settings.json`):

```json
{
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    },
    "[typescript]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[javascript]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    }
}
```

## Pre-commit hooks

**Estado**: No detectado

**Recomendado**: Usar Husky + lint-staged

**Configuración sugerida**:

```json
// package.json
{
    "husky": {
        "hooks": {
            "pre-commit": "lint-staged"
        }
    },
    "lint-staged": {
        "backend/src/**/*.{ts,tsx}": ["eslint --fix", "prettier --write"],
        "frontend/src/**/*.{js,jsx,ts,tsx}": [
            "eslint --fix",
            "prettier --write"
        ]
    }
}
```

## Resolver conflictos

### ESLint vs Prettier

**Solución**: `eslint-config-prettier` (ya instalado en backend)

Desactiva reglas de ESLint que conflictúan con Prettier.

### Formato inconsistente

**Solución**: Ejecutar Prettier en todo el proyecto:

```bash
# Backend
cd backend
npx prettier --write "src/**/*.{ts,tsx}"

# Frontend
cd frontend
npx prettier --write "src/**/*.{js,jsx,ts,tsx}"
```

## Mejores prácticas

1. **Formato consistente**: Usar Prettier en todo el proyecto
2. **Lint antes de commit**: Configurar pre-commit hooks
3. **CI/CD**: Ejecutar linters en pipeline
4. **Configuración compartida**: Commitear archivos de configuración
5. **Ignorar generados**: No formatear archivos generados (build/, dist/)

## Archivos a ignorar

### .eslintignore (si existe)

```
node_modules/
dist/
build/
*.min.js
```

### .prettierignore (recomendado)

```
node_modules/
dist/
build/
coverage/
*.min.js
*.min.css
package-lock.json
```

## Preguntas al humano

-   ¿Hay configuración de ESLint/Prettier en archivos separados?
-   ¿Se requiere formato específico diferente a estándar?
-   ¿Hay pre-commit hooks configurados?
-   ¿Se ejecutan linters en CI/CD?
-   ¿Hay reglas personalizadas de ESLint?
