import request from 'supertest';
import { app } from '../src/index';

describe('CRUD de Preguntas con campo number', () => {
  let topicId: string;
  let questionId: string;

  beforeAll(async () => {
    // Crear un tema de prueba
    const topicRes = await request(app)
      .post('/api/topics')
      .send({ 
        name: 'Tema Test', 
        description: 'Tema para probar el campo number', 
        image_url: 'test.png' 
      });
    topicId = topicRes.body.data.id;
  }, 30000);

  it('debe crear una pregunta con number', async () => {
    const res = await request(app)
      .post('/api/questions')
      .send({
        topic_id: topicId,
        number: 1,
        correct_answers: [0],
        locales: {
          en: {
            question: 'What is 2+2?',
            options: [
              { id: 1, text: '3' },
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
    
    expect(res.status).toBe(201);
    expect(res.body.data.number).toBe(1);
    questionId = res.body.data.id;
  });

  it('no debe permitir number repetido en el mismo tema', async () => {
    const res = await request(app)
      .post('/api/questions')
      .send({
        topic_id: topicId,
        number: 1, // Mismo número que la pregunta anterior
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
    
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/ya existe/i);
  });

  it('debe actualizar el number si es único', async () => {
    const res = await request(app)
      .put(`/api/questions/${questionId}`)
      .send({ number: 2 });
    
    expect(res.status).toBe(200);
    expect(res.body.data.number).toBe(2);
  });

  it('debe mostrar el campo number al obtener la pregunta', async () => {
    const res = await request(app)
      .get(`/api/questions/${questionId}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data.number).toBe(2);
  });

  it('debe eliminar la pregunta', async () => {
    const res = await request(app)
      .delete(`/api/questions/${questionId}`);
    
    expect(res.status).toBe(200);
  });
}); 