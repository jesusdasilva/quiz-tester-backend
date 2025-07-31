import request from 'supertest';
import { app } from '../src/index';

describe('Validaciones de correct_answers', () => {
  let topicId: string;

  beforeAll(async () => {
    // Crear un tema de prueba
    const topicRes = await request(app)
      .post('/api/topics')
      .send({ 
        name: 'Tema Validación', 
        description: 'Tema para probar validaciones de correct_answers', 
        image_url: 'test.png' 
      });
    topicId = topicRes.body.data.id;
  }, 30000);

  it('debe permitir correct_answers válidos con 2 opciones', async () => {
    const res = await request(app)
      .post('/api/questions')
      .send({
        topic_id: topicId,
        number: 1,
        correct_answers: [0],
        locales: {
          en: {
            question: 'What is the correct answer?',
            options: [
              { id: 1, text: 'Correct answer' },
              { id: 2, text: 'Wrong answer' }
            ],
            explanation: 'The first option is correct'
          },
          es: {
            question: '¿Cuál es la respuesta correcta?',
            options: [
              { id: 1, text: 'Respuesta correcta' },
              { id: 2, text: 'Respuesta incorrecta' }
            ],
            explanation: 'La primera opción es correcta'
          }
        }
      });
    
    expect(res.status).toBe(201);
  });

  it('debe permitir correct_answers válidos con 4 opciones', async () => {
    const res = await request(app)
      .post('/api/questions')
      .send({
        topic_id: topicId,
        number: 2,
        correct_answers: [1, 3],
        locales: {
          en: {
            question: 'Which options are correct?',
            options: [
              { id: 1, text: 'Option A' },
              { id: 2, text: 'Option B' },
              { id: 3, text: 'Option C' },
              { id: 4, text: 'Option D' }
            ],
            explanation: 'Options B and D are correct'
          },
          es: {
            question: '¿Qué opciones son correctas?',
            options: [
              { id: 1, text: 'Opción A' },
              { id: 2, text: 'Opción B' },
              { id: 3, text: 'Opción C' },
              { id: 4, text: 'Opción D' }
            ],
            explanation: 'Las opciones B y D son correctas'
          }
        }
      });
    
    expect(res.status).toBe(201);
  });

  it('debe rechazar correct_answers que excedan el número de opciones', async () => {
    const res = await request(app)
      .post('/api/questions')
      .send({
        topic_id: topicId,
        number: 3,
        correct_answers: [5], // Índice fuera de rango
        locales: {
          en: {
            question: 'What is the correct answer?',
            options: [
              { id: 1, text: 'Option A' },
              { id: 2, text: 'Option B' },
              { id: 3, text: 'Option C' },
              { id: 4, text: 'Option D' }
            ],
            explanation: 'Only 4 options available'
          },
          es: {
            question: '¿Cuál es la respuesta correcta?',
            options: [
              { id: 1, text: 'Opción A' },
              { id: 2, text: 'Opción B' },
              { id: 3, text: 'Opción C' },
              { id: 4, text: 'Opción D' }
            ],
            explanation: 'Solo 4 opciones disponibles'
          }
        }
      });
    
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/entre 0 y 3/);
  });

  it('debe rechazar correct_answers negativos', async () => {
    const res = await request(app)
      .post('/api/questions')
      .send({
        topic_id: topicId,
        number: 4,
        correct_answers: [-1], // Índice negativo
        locales: {
          en: {
            question: 'What is the correct answer?',
            options: [
              { id: 1, text: 'Option A' },
              { id: 2, text: 'Option B' },
              { id: 3, text: 'Option C' },
              { id: 4, text: 'Option D' }
            ],
            explanation: 'Negative indices are not allowed'
          },
          es: {
            question: '¿Cuál es la respuesta correcta?',
            options: [
              { id: 1, text: 'Opción A' },
              { id: 2, text: 'Opción B' },
              { id: 3, text: 'Opción C' },
              { id: 4, text: 'Opción D' }
            ],
            explanation: 'Los índices negativos no están permitidos'
          }
        }
      });
    
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/entre 0 y 3/);
  });

  it('debe rechazar correct_answers que excedan el número de opciones en update', async () => {
    // Crear una pregunta válida primero
    const createRes = await request(app)
      .post('/api/questions')
      .send({
        topic_id: topicId,
        number: 5,
        correct_answers: [0],
        locales: {
          en: {
            question: 'Original question?',
            options: [
              { id: 1, text: 'Option A' },
              { id: 2, text: 'Option B' },
              { id: 3, text: 'Option C' },
              { id: 4, text: 'Option D' }
            ],
            explanation: 'Original explanation'
          },
          es: {
            question: '¿Pregunta original?',
            options: [
              { id: 1, text: 'Opción A' },
              { id: 2, text: 'Opción B' },
              { id: 3, text: 'Opción C' },
              { id: 4, text: 'Opción D' }
            ],
            explanation: 'Explicación original'
          }
        }
      });
    
    expect(createRes.status).toBe(201);
    const questionId = createRes.body.data.id;

    // Intentar actualizar con correct_answers inválidos
    const updateRes = await request(app)
      .put(`/api/questions/${questionId}`)
      .send({
        correct_answers: [5], // Índice fuera de rango
        locales: {
          en: {
            question: 'Updated question?',
            options: [
              { id: 1, text: 'Option A' },
              { id: 2, text: 'Option B' },
              { id: 3, text: 'Option C' },
              { id: 4, text: 'Option D' }
            ],
            explanation: 'Updated explanation'
          },
          es: {
            question: '¿Pregunta actualizada?',
            options: [
              { id: 1, text: 'Opción A' },
              { id: 2, text: 'Opción B' },
              { id: 3, text: 'Opción C' },
              { id: 4, text: 'Opción D' }
            ],
            explanation: 'Explicación actualizada'
          }
        }
      });
    
    expect(updateRes.status).toBe(400);
    expect(updateRes.body.message).toMatch(/entre 0 y 3/);
  });
}); 