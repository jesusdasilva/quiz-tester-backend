# Scripts de Migración

Este directorio contiene scripts para migrar y ajustar datos en la base de datos.

## Scripts Disponibles

### 1. Migración de Formato de Opciones

**Comando:** `npm run migrate:options`

**Propósito:** Convierte las opciones de preguntas del formato antiguo (strings) al nuevo formato (objetos con `id` y `text`).

**Formato anterior:**
```json
{
  "locales": {
    "en": {
      "question": "What is 2+2?",
      "options": ["3", "4", "5", "6"],
      "explanation": "2+2 equals 4"
    }
  }
}
```

**Formato nuevo:**
```json
{
  "locales": {
    "en": {
      "question": "What is 2+2?",
      "options": [
        { "id": 1, "text": "3" },
        { "id": 2, "text": "4" },
        { "id": 3, "text": "5" },
        { "id": 4, "text": "6" }
      ],
      "explanation": "2+2 equals 4"
    }
  }
}
```

### 2. Ejemplo de Migración

**Comando:** `npm run migrate:options:example`

**Propósito:** Muestra un ejemplo de cómo se vería la migración sin ejecutar cambios en la base de datos.

### 3. Asignación de Números de Preguntas

**Comando:** `npm run fix:numbers`

**Propósito:** Asigna números secuenciales a las preguntas que no los tienen, basándose en la fecha de creación.

### 4. Ajuste de Correct Answers

**Comando:** `npm run fix:correct-answers`

**Propósito:** Ajusta las `correct_answers` sumando 1 a todos los números para que coincidan con los nuevos IDs de opciones que empiezan en 1.

**Ejemplo:**
- **Antes:** `correct_answers: [0, 2]` (índices basados en 0)
- **Después:** `correct_answers: [1, 3]` (índices basados en 1)

## Uso

1. **Migrar formato de opciones:**
   ```bash
   npm run migrate:options
   ```

2. **Ver ejemplo de migración:**
   ```bash
   npm run migrate:options:example
   ```

3. **Asignar números de preguntas:**
   ```bash
   npm run fix:numbers
   ```

4. **Ajustar correct_answers:**
   ```bash
   npm run fix:correct-answers
   ```

## Notas Importantes

- Todos los scripts son **seguros** y muestran un resumen detallado de los cambios realizados
- Los scripts solo modifican datos que necesitan ser actualizados
- Se recomienda hacer una copia de seguridad antes de ejecutar migraciones masivas
- Los scripts verifican que las credenciales de Firebase estén configuradas correctamente 