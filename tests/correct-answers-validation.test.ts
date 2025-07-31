import request from 'supertest';
import { app } from '../src/index';

describe('Validación de correct_answers vs IDs de opciones', () => {
  let topicId: string;

  beforeAll(async () => {
    // Crear un tema para las pruebas
    const topicResponse = await request(app)
      .post('/api/topics')
      .send({
        name: 'Tema de prueba para validación',
        description: 'Descripción del tema de prueba para validar correct_answers',
        image_url: 'https://example.com/image.jpg'
      });

    topicId = topicResponse.body.data.id;
  }, 30000);

  afterAll(async () => {
    // Limpiar: eliminar el tema creado
    if (topicId) {
      await request(app).delete(`/api/topics/${topicId}`);
    }
  });

  describe('POST /api/questions', () => {
    it('debe rechazar pregunta con correct_answers que no corresponden a IDs de opciones', async () => {
      const questionData = {
        topic_id: topicId,
        number: 1,
        correct_answers: [5, 6], // IDs que no existen en las opciones
        locales: {
          en: {
            question: 'What is the capital of France?',
            options: [
              { id: 1, text: 'London' },
              { id: 2, text: 'Berlin' },
              { id: 3, text: 'Paris' },
              { id: 4, text: 'Madrid' }
            ],
            explanation: 'Paris is the capital of France'
          },
          es: {
            question: '¿Cuál es la capital de Francia?',
            options: [
              { id: 1, text: 'Londres' },
              { id: 2, text: 'Berlín' },
              { id: 3, text: 'París' },
              { id: 4, text: 'Madrid' }
            ],
            explanation: 'París es la capital de Francia'
          }
        }
      };

      const response = await request(app)
        .post('/api/questions')
        .send(questionData);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/no corresponde a ningún ID de opción válido/);
      expect(response.body.message).toMatch(/IDs válidos: \[1, 2, 3, 4\]/);
    });

    it('debe aceptar pregunta con correct_answers que corresponden a IDs válidos', async () => {
      const questionData = {
        topic_id: topicId,
        number: 2,
        correct_answers: [3], // ID válido que existe en las opciones
        locales: {
          en: {
            question: 'What is the capital of Spain?',
            options: [
              { id: 1, text: 'London' },
              { id: 2, text: 'Berlin' },
              { id: 3, text: 'Madrid' },
              { id: 4, text: 'Paris' }
            ],
            explanation: 'Madrid is the capital of Spain'
          },
          es: {
            question: '¿Cuál es la capital de España?',
            options: [
              { id: 1, text: 'Londres' },
              { id: 2, text: 'Berlín' },
              { id: 3, text: 'Madrid' },
              { id: 4, text: 'París' }
            ],
            explanation: 'Madrid es la capital de España'
          }
        }
      };

      const response = await request(app)
        .post('/api/questions')
        .send(questionData);

      expect(response.status).toBe(201);
      expect(response.body.data.correct_answers).toEqual([3]);
    });

    it('debe aceptar pregunta con múltiples correct_answers válidas', async () => {
      const questionData = {
        topic_id: topicId,
        number: 3,
        correct_answers: [1, 3], // Múltiples IDs válidos
        locales: {
          en: {
            question: 'Which cities are capitals?',
            options: [
              { id: 1, text: 'London' },
              { id: 2, text: 'Liverpool' },
              { id: 3, text: 'Paris' },
              { id: 4, text: 'Lyon' }
            ],
            explanation: 'London and Paris are capitals'
          },
          es: {
            question: '¿Qué ciudades son capitales?',
            options: [
              { id: 1, text: 'Londres' },
              { id: 2, text: 'Liverpool' },
              { id: 3, text: 'París' },
              { id: 4, text: 'Lyon' }
            ],
            explanation: 'Londres y París son capitales'
          }
        }
      };

      const response = await request(app)
        .post('/api/questions')
        .send(questionData);

      expect(response.status).toBe(201);
      expect(response.body.data.correct_answers).toEqual([1, 3]);
    });

    it('debe rechazar pregunta con IDs diferentes entre inglés y español', async () => {
      const questionData = {
        topic_id: topicId,
        number: 4,
        correct_answers: [1],
        locales: {
          en: {
            question: 'Test question',
            options: [
              { id: 1, text: 'Option 1' },
              { id: 2, text: 'Option 2' }
            ],
            explanation: 'Test explanation'
          },
          es: {
            question: 'Pregunta de prueba',
            options: [
              { id: 1, text: 'Opción 1' },
              { id: 3, text: 'Opción 2' } // ID diferente (3 en lugar de 2)
            ],
            explanation: 'Explicación de prueba'
          }
        }
      };

      const response = await request(app)
        .post('/api/questions')
        .send(questionData);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Los IDs de las opciones deben ser iguales en ambos idiomas/);
    });

    it('debe rechazar pregunta con cantidad diferente de opciones entre idiomas', async () => {
      const questionData = {
        topic_id: topicId,
        number: 5,
        correct_answers: [1],
        locales: {
          en: {
            question: 'Test question',
            options: [
              { id: 1, text: 'Option 1' },
              { id: 2, text: 'Option 2' }
            ],
            explanation: 'Test explanation'
          },
          es: {
            question: 'Pregunta de prueba',
            options: [
              { id: 1, text: 'Opción 1' } // Solo una opción en español
            ],
            explanation: 'Explicación de prueba'
          }
        }
      };

      const response = await request(app)
        .post('/api/questions')
        .send(questionData);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/deben tener la misma cantidad de elementos/);
    });
  });

  describe('PUT /api/questions/:id', () => {
    let questionId: string;

    beforeEach(async () => {
      // Crear una pregunta para actualizar
      const questionData = {
        topic_id: topicId,
        number: 10,
        correct_answers: [1],
        locales: {
          en: {
            question: 'Original question',
            options: [
              { id: 1, text: 'Option 1' },
              { id: 2, text: 'Option 2' }
            ],
            explanation: 'Original explanation'
          },
          es: {
            question: 'Pregunta original',
            options: [
              { id: 1, text: 'Opción 1' },
              { id: 2, text: 'Opción 2' }
            ],
            explanation: 'Explicación original'
          }
        }
      };

      const response = await request(app)
        .post('/api/questions')
        .send(questionData);

      questionId = response.body.data.id;
    });

    afterEach(async () => {
      // Limpiar: eliminar la pregunta creada
      if (questionId) {
        await request(app).delete(`/api/questions/${questionId}`);
      }
    });

    it('debe rechazar actualización con correct_answers inválidas', async () => {
      const updateData = {
        correct_answers: [5], // ID que no existe
        locales: {
          en: {
            question: 'Updated question',
            options: [
              { id: 1, text: 'Option 1' },
              { id: 2, text: 'Option 2' },
              { id: 3, text: 'Option 3' }
            ],
            explanation: 'Updated explanation'
          },
          es: {
            question: 'Pregunta actualizada',
            options: [
              { id: 1, text: 'Opción 1' },
              { id: 2, text: 'Opción 2' },
              { id: 3, text: 'Opción 3' }
            ],
            explanation: 'Explicación actualizada'
          }
        }
      };

      const response = await request(app)
        .put(`/api/questions/${questionId}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/no corresponde a ningún ID de opción válido/);
      expect(response.body.message).toMatch(/IDs válidos: \[1, 2, 3\]/);
    });

    it('debe aceptar actualización con correct_answers válidas', async () => {
      const updateData = {
        correct_answers: [2, 3], // IDs válidos
        locales: {
          en: {
            question: 'Updated question',
            options: [
              { id: 1, text: 'Option 1' },
              { id: 2, text: 'Option 2' },
              { id: 3, text: 'Option 3' }
            ],
            explanation: 'Updated explanation'
          },
          es: {
            question: 'Pregunta actualizada',
            options: [
              { id: 1, text: 'Opción 1' },
              { id: 2, text: 'Opción 2' },
              { id: 3, text: 'Opción 3' }
            ],
            explanation: 'Explicación actualizada'
          }
        }
      };

      const response = await request(app)
        .put(`/api/questions/${questionId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.correct_answers).toEqual([2, 3]);
    });
  });
}); 