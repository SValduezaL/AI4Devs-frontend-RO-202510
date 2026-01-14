# ADR-0001: Template para Architecture Decision Records

## Estado

Propuesto / Aceptado / Deprecado / Reemplazado por [ADR-XXXX]

## Contexto

[Describe el contexto y la situación que requiere una decisión. Incluye:
- Problema que se intenta resolver
- Restricciones técnicas o de negocio
- Stakeholders involucrados]

## Decisión

[Describe la decisión tomada. Debe ser:
- Clara y específica
- Incluir alternativas consideradas
- Explicar por qué se eligió esta opción]

## Consecuencias

### Positivas

- [Beneficio 1]
- [Beneficio 2]

### Negativas

- [Desventaja 1]
- [Desventaja 2]

### Neutrales / Incertidumbres

- [Aspecto que requiere monitoreo]
- [Riesgo potencial]

## Alternativas consideradas

### Alternativa 1: [Nombre]

**Descripción**: [Qué es]

**Razón de rechazo**: [Por qué no se eligió]

### Alternativa 2: [Nombre]

**Descripción**: [Qué es]

**Razón de rechazo**: [Por qué no se eligió]

## Referencias

- [Link a documentación relevante]
- [Link a issues/PRs relacionados]
- [Link a código relacionado]

## Notas

[Información adicional, contexto histórico, etc.]

---

## Cómo usar este template

1. Copiar este archivo como `ADR-XXXX-<slug>.md`
2. Reemplazar `XXXX` con número secuencial
3. Reemplazar `<slug>` con descripción corta (kebab-case)
4. Completar todas las secciones
5. Actualizar índice si existe

## Ejemplo de uso

Para una decisión sobre usar JWT para autenticación:

- Nombre: `ADR-0002-jwt-authentication.md`
- Estado: Aceptado
- Contexto: Necesitamos autenticación para proteger API
- Decisión: Usar JWT tokens con expiración de 1 hora
- Consecuencias: Simple de implementar, pero requiere refresh tokens para mejor UX
- Alternativas: Session-based auth (rechazada por stateless requirement)
