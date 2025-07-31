import request from 'supertest';
import { app } from '../src/index';

describe('Validaciones de Opciones con IDs', () => {
  let topicId: string;

  beforeAll(async () => {
    // Crear un tema de prueba
    const topicRes = await request(app)
      .post('/api/topics')
      .send({ 
        name: 'Tema Opciones', 
        description: 'Tema para probar validaciones de opciones con IDs', 
        image_url: 'test.png' 
      });
    topicId = topicRes.body.data.id;
  }, 30000);

  it('debe crear una pregunta con opciones válidas con IDs', async () => {
    const res = await request(app)
      .post('/api/questions')
      .send({
        topic_id: topicId,
        number: 1,
        correct_answers: [0],
        locales: {
          en: {
            question: 'What is the capital of France?',
            options: [
              { id: 1, text: 'London' },
              { id: 2, text: 'Paris' },
              { id: 3, text: 'Berlin' },
              { id: 4, text: 'Madrid' }
            ],
            explanation: 'Paris is the capital of France'
          },
          es: {
            question: '¿Cuál es la capital de Francia?',
            options: [
              { id: 1, text: 'Londres' },
              { id: 2, text: 'París' },
              { id: 3, text: 'Berlín' },
              { id: 4, text: 'Madrid' }
            ],
            explanation: 'París es la capital de Francia'
          }
        }
      });
    
    expect(res.status).toBe(201);
    expect(res.body.data.locales.en.options[0].id).toBe(1);
    expect(res.body.data.locales.en.options[0].text).toBe('London');
  });

  it('debe rechazar opciones sin ID', async () => {
    const res = await request(app)
      .post('/api/questions')
      .send({
        topic_id: topicId,
        number: 2,
        correct_answers: [0],
        locales: {
          en: {
            question: 'What is 2+2?',
            options: [
              { text: '3' }, // Sin ID
              { id: 2, text: '4' },
              { id: 3, text: '5' },
              { id: 4, text: '6' }
            ],
            explanation: '2+2 equals 4'
          },
          es: {
            question: '¿Cuánto es 2+2?',
            options: [
              { id: 1, text: '3' },
              { id: 2, text: '4' },
              { id: 3, text: '5' },
              { id: 4, text: '6' }
            ],
            explanation: '2+2 es igual a 4'
          }
        }
      });
    
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/id válido/);
  });

  it('debe rechazar opciones sin text', async () => {
    const res = await request(app)
      .post('/api/questions')
      .send({
        topic_id: topicId,
        number: 3,
        correct_answers: [0],
        locales: {
          en: {
            question: 'What is 2+2?',
            options: [
              { id: 1 }, // Sin text
              { id: 2, text: '4' },
              { id: 3, text: '5' },
              { id: 4, text: '6' }
            ],
            explanation: '2+2 equals 4'
          },
          es: {
            question: '¿Cuánto es 2+2?',
            options: [
              { id: 1, text: '3' },
              { id: 2, text: '4' },
              { id: 3, text: '5' },
              { id: 4, text: '6' }
            ],
            explanation: '2+2 es igual a 4'
          }
        }
      });
    
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/text válido/);
  });

  it('debe rechazar opciones con IDs duplicados', async () => {
    const res = await request(app)
      .post('/api/questions')
      .send({
        topic_id: topicId,
        number: 4,
        correct_answers: [0],
        locales: {
          en: {
            question: 'What is 2+2?',
            options: [
              { id: 1, text: '3' },
              { id: 1, text: '4' }, // ID duplicado
              { id: 3, text: '5' },
              { id: 4, text: '6' }
            ],
            explanation: '2+2 equals 4'
          },
          es: {
            question: '¿Cuánto es 2+2?',
            options: [
              { id: 1, text: '3' },
              { id: 2, text: '4' },
              { id: 3, text: '5' },
              { id: 4, text: '6' }
            ],
            explanation: '2+2 es igual a 4'
          }
        }
      });
    
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/duplicado/);
  });

  it('debe rechazar opciones que no son objetos', async () => {
    const res = await request(app)
      .post('/api/questions')
      .send({
        topic_id: topicId,
        number: 5,
        correct_answers: [0],
        locales: {
          en: {
            question: 'What is 2+2?',
            options: [
              '3', // String en lugar de objeto
              { id: 2, text: '4' },
              { id: 3, text: '5' },
              { id: 4, text: '6' }
            ],
            explanation: '2+2 equals 4'
          },
          es: {
            question: '¿Cuánto es 2+2?',
            options: [
              { id: 1, text: '3' },
              { id: 2, text: '4' },
              { id: 3, text: '5' },
              { id: 4, text: '6' }
            ],
            explanation: '2+2 es igual a 4'
          }
        }
      });
    
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/objeto con id y text/);
  });

  it('debe permitir actualizar pregunta con opciones válidas con IDs', async () => {
    // Crear una pregunta para actualizar
    const createRes = await request(app)
      .post('/api/questions')
      .send({
        topic_id: topicId,
        number: 6,
        correct_answers: [0],
        locales: {
          en: {
            question: 'What is 3+3?',
            options: [
              { id: 1, text: '5' },
              { id: 2, text: '6' },
              { id: 3, text: '7' },
              { id: 4, text: '8' }
            ],
            explanation: '3+3 equals 6'
          },
          es: {
            question: '¿Cuánto es 3+3?',
            options: [
              { id: 1, text: '5' },
              { id: 2, text: '6' },
              { id: 3, text: '7' },
              { id: 4, text: '8' }
            ],
            explanation: '3+3 es igual a 6'
          }
        }
      });
    
    expect(createRes.status).toBe(201);
    const questionId = createRes.body.data.id;

    // Actualizar con nuevas opciones
    const updateRes = await request(app)
      .put(`/api/questions/${questionId}`)
      .send({
        locales: {
          en: {
            question: 'What is 4+4?',
            options: [
              { id: 1, text: '6' },
              { id: 2, text: '7' },
              { id: 3, text: '8' },
              { id: 4, text: '9' }
            ],
            explanation: '4+4 equals 8'
          },
          es: {
            question: '¿Cuánto es 4+4?',
            options: [
              { id: 1, text: '6' },
              { id: 2, text: '7' },
              { id: 3, text: '8' },
              { id: 4, text: '9' }
            ],
            explanation: '4+4 es igual a 8'
          }
        }
      });
    
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.locales.en.question).toBe('What is 4+4?');
    expect(updateRes.body.data.locales.en.options[2].text).toBe('8');
  });

  it('debe validar que correct_answers funcione con el nuevo formato', async () => {
    const res = await request(app)
      .post('/api/questions')
      .send({
        topic_id: topicId,
        number: 7,
        correct_answers: [1], // Segunda opción (índice 1)
        locales: {
          en: {
            question: 'What is the correct answer?',
            options: [
              { id: 1, text: 'Wrong answer' },
              { id: 2, text: 'Correct answer' },
              { id: 3, text: 'Another wrong answer' },
              { id: 4, text: 'Also wrong' }
            ],
            explanation: 'The second option is correct'
          },
          es: {
            question: '¿Cuál es la respuesta correcta?',
            options: [
              { id: 1, text: 'Respuesta incorrecta' },
              { id: 2, text: 'Respuesta correcta' },
              { id: 3, text: 'Otra respuesta incorrecta' },
              { id: 4, text: 'También incorrecta' }
            ],
            explanation: 'La segunda opción es correcta'
          }
        }
      });
    
    expect(res.status).toBe(201);
    expect(res.body.data.correct_answers).toEqual([1]);
  });
}); 