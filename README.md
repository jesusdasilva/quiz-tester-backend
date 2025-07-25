# Quiz Tester Backend

Backend para aplicación de pruebas y cuestionarios desarrollado con Node.js, Express y Firebase Firestore.

## Modelos de Datos

### Topic (Tema)

El modelo Topic representa los temas o categorías de las preguntas.

```typescript
interface Topic {
  id?: string;           // ID del documento (generado automáticamente)
  name: string;          // Nombre del tema (mínimo 3 caracteres)
  description: string;   // Descripción del tema (mínimo 10 caracteres)
  image_url?: string;    // URL de la imagen del tema (opcional)
  createdAt?: Date;      // Fecha de creación
  updatedAt?: Date;      // Fecha de última actualización
}
```

#### Ejemplos de uso:

**Crear un tema:**
```bash
POST /api/topics
Content-Type: application/json

{
  "name": "JavaScript Básico",
  "description": "Conceptos fundamentales de JavaScript incluyendo variables, funciones y objetos",
  "image_url": "https://example.com/images/javascript.png"
}
```

**Actualizar un tema:**
```bash
PUT /api/topics/{id}
Content-Type: application/json

{
  "name": "JavaScript Avanzado",
  "description": "Conceptos avanzados de JavaScript incluyendo closures, promises y async/await",
  "image_url": "https://example.com/images/javascript-advanced.png"
}
```

**Obtener todos los temas:**
```bash
GET /api/topics
```

**Obtener temas con conteo de preguntas:**
```bash
GET /api/topics/with-questions-count
```

**Obtener un tema por ID:**
```bash
GET /api/topics/{id}
```

**Eliminar un tema:**
```bash
DELETE /api/topics/{id}
```

### Questions (Preguntas)

#### Crear pregunta
```http
POST /api/questions
Content-Type: application/json

{
  "topic_id": "topic-id-aqui",
  "answers_to_select": 1,
  "correct_answer": 0,
  "locales": {
    "en": {
      "question": "How are commits related to pull requests?",
      "options": [
        "Commits are made on a branch that can have a linked pull request.",
        "Commits can only be made after a pull request is created.",
        "Commits can only be made before a pull request is created.",
        "Commits are made on a pull request that can have a linked branch."
      ],
      "explanation": "Commits are changes saved to a branch. When a pull request is created from that branch, it includes all the commits from that branch."
    },
    "es": {
      "question": "¿Cómo se relacionan los commits con los pull requests?",
      "options": [
        "Los commits se hacen en una rama que puede tener un pull request vinculado.",
        "Los commits solo se pueden hacer después de crear un pull request.",
        "Los commits solo se pueden hacer antes de crear un pull request.",
        "Los commits se hacen en un pull request que puede tener una rama vinculada."
      ],
      "explanation": "Los commits son cambios guardados en una rama. Cuando se crea un pull request desde esa rama, incluye todos los commits realizados en ella."
    }
  }
}
```

#### Obtener todas las preguntas
```http
GET /api/questions
```

#### Obtener conteo de preguntas por temas
```http
GET /api/questions/count-by-topics
```

#### Obtener pregunta por ID
```http
GET /api/questions/{id}
```

#### Obtener preguntas por tema
```http
GET /api/questions/topic/{topicId}
```

#### Actualizar pregunta
```http
PUT /api/questions/{id}
Content-Type: application/json

{
  "correct_answer": 1,
  "locales": {
    "en": {
      "question": "Updated question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "explanation": "Updated explanation"
    },
    "es": {
      "question": "Texto de pregunta actualizado",
      "options": ["Opción 1", "Opción 2", "Opción 3", "Opción 4"],
      "explanation": "Explicación actualizada"
    }
  }
}
```

#### Eliminar pregunta
```http
DELETE /api/questions/{id}
```

## Validaciones

### Topics
- `name`: Mínimo 3 caracteres
- `description`: Mínimo 10 caracteres
- No se permiten nombres duplicados

### Questions
- `topic_id`: Debe existir en la colección topics
- `answers_to_select`: Entre 1 y 4
- `correct_answer`: Entre 0 y 3
- `locales`: Requiere idiomas 'en' y 'es'
- Cada idioma requiere:
  - `question`: Mínimo 10 caracteres
  - `options`: Array con al menos 2 opciones
  - `explanation`: Mínimo 10 caracteres
- `correct_answer` no puede exceder el número de opciones

## Respuestas de la API

Todas las respuestas siguen este formato:

```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... }
}
```

En caso de error:

```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "Detalles adicionales del error"
}
```

## Códigos de Estado HTTP

- `200` - Operación exitosa
- `201` - Recurso creado exitosamente
- `400` - Solicitud incorrecta (validaciones)
- `401` - No autorizado
- `404` - Recurso no encontrado
- `500` - Error interno del servidor

## Scripts Disponibles

- `npm run dev` - Ejecutar en modo desarrollo con hot reload
- `npm run build` - Compilar TypeScript a JavaScript
- `npm start` - Ejecutar en producción 