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
  "number": 1,
  "correct_answers": [0],
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

#### Navegación secuencial de preguntas
```http
GET /api/questions/topic/{topicId}/navigate/{number}
```

Este endpoint permite navegar secuencialmente por las preguntas de un tema específico, proporcionando información de navegación para implementar botones "anterior" y "siguiente".

**Parámetros:**
- `topicId`: ID del tema
- `number`: Número de la pregunta (entero positivo)

**Respuesta:**
```json
{
  "success": true,
  "message": "Pregunta obtenida exitosamente",
  "data": {
    "question": {
      "id": "abc123",
      "question_id": "abc123",
      "topic_id": "topic-id",
      "number": 3,
      "correct_answers": [0],
      "locales": {
        "en": {
          "question": "Question text",
          "options": ["Option A", "Option B"],
          "explanation": "Explanation text"
        },
        "es": {
          "question": "Texto de la pregunta",
          "options": ["Opción A", "Opción B"],
          "explanation": "Texto de explicación"
        }
      },
      "createdAt": "2025-07-25T04:30:00.000Z",
      "updatedAt": "2025-07-25T04:30:00.000Z"
    },
    "navigation": {
      "current": 3,
      "total": 10,
      "hasPrevious": true,
      "hasNext": true,
      "previousNumber": 2,
      "nextNumber": 4
    }
  }
}
```

**Información de navegación:**
- `current`: Número de la pregunta actual
- `total`: Total de preguntas en el tema
- `hasPrevious`: Indica si existe pregunta anterior
- `hasNext`: Indica si existe pregunta siguiente
- `previousNumber`: Número de la pregunta anterior (null si no existe)
- `nextNumber`: Número de la pregunta siguiente (null si no existe)

**Ejemplo de uso:**
```bash
# Obtener la pregunta número 3 del tema
GET /api/questions/topic/bW3pB7PgJcRW6Fpk1KRB/navigate/3

# Obtener la primera pregunta del tema
GET /api/questions/topic/bW3pB7PgJcRW6Fpk1KRB/navigate/1
```

#### Actualizar pregunta
```http
PUT /api/questions/{id}
Content-Type: application/json

{
  "number": 2,
  "correct_answers": [1],
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

## Questions

### Crear una pregunta

**POST** `/api/questions`

```json
{
  "topic_id": "topic_id",
  "number": 1,
  "correct_answers": [0, 2],
  "locales": {
    "en": {
      "question": "What type of accounts are available in the platform?",
      "options": [
        {
          "id": 1,
          "text": "Personal accounts"
        },
        {
          "id": 2,
          "text": "Organization accounts"
        },
        {
          "id": 3,
          "text": "Enterprise accounts"
        },
        {
          "id": 4,
          "text": "Shared accounts"
        },
        {
          "id": 5,
          "text": "Company accounts"
        }
      ],
      "explanation": "The platform supports multiple types of accounts to meet different organizational needs."
    },
    "es": {
      "question": "¿Qué tipos de cuentas están disponibles en la plataforma?",
      "options": [
        {
          "id": 1,
          "text": "Cuentas personales"
        },
        {
          "id": 2,
          "text": "Cuentas de organización"
        },
        {
          "id": 3,
          "text": "Cuentas empresariales"
        },
        {
          "id": 4,
          "text": "Cuentas compartidas"
        },
        {
          "id": 5,
          "text": "Cuentas de empresa"
        }
      ],
      "explanation": "La plataforma soporta múltiples tipos de cuentas para satisfacer diferentes necesidades organizacionales."
    }
  }
}
```

### Actualizar una pregunta

**PUT** `/api/questions/:id`

```json
{
  "number": 2,
  "correct_answers": [1],
  "locales": {
    "en": {
      "question": "Updated question text?",
      "options": [
        {
          "id": 1,
          "text": "Updated option 1"
        },
        {
          "id": 2,
          "text": "Updated option 2"
        },
        {
          "id": 3,
          "text": "Updated option 3"
        },
        {
          "id": 4,
          "text": "Updated option 4"
        }
      ],
      "explanation": "Updated explanation"
    },
    "es": {
      "question": "¿Texto de pregunta actualizado?",
      "options": [
        {
          "id": 1,
          "text": "Opción actualizada 1"
        },
        {
          "id": 2,
          "text": "Opción actualizada 2"
        },
        {
          "id": 3,
          "text": "Opción actualizada 3"
        },
        {
          "id": 4,
          "text": "Opción actualizada 4"
        }
      ],
      "explanation": "Explicación actualizada"
    }
  }
}
```

## Validaciones

### Topics
- `name`: Mínimo 3 caracteres
- `description`: Mínimo 10 caracteres
- No se permiten nombres duplicados

### Questions
- `topic_id`: Debe existir en la colección topics
- `number`: Número entero positivo, único por tema
- `correct_answers`: Array no vacío con valores entre 0 y (número de opciones - 1)
- `locales`: Requiere idiomas 'en' y 'es'
- Cada idioma requiere:
  - `question`: Mínimo 10 caracteres
  - `options`: Array con al menos 2 opciones, cada una con:
    - `id`: String único dentro del idioma
    - `text`: String no vacío
  - `explanation`: Mínimo 10 caracteres
- No se permiten preguntas duplicadas (mismo texto en el mismo tema)
- `correct_answers` no puede exceder el número de opciones disponibles

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
- `npm test` - Ejecutar pruebas
- `npm run test:watch` - Ejecutar pruebas en modo watch

## Scripts de Migración

### Migrar Formato de Opciones

Para migrar todas las preguntas del formato anterior de opciones (strings simples) al nuevo formato con IDs:

```bash
npm run migrate:options
```

**Ver ejemplo de migración:**
```bash
npm run migrate:options:example
```

### Asignar Números de Preguntas

Para asignar números secuenciales a preguntas existentes:

```bash
npm run fix:numbers
```

### Documentación Completa

Ver `scripts/README.md` para información detallada sobre todos los scripts de migración disponibles.