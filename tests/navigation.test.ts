import request from 'supertest';
import { app } from '../src/index';

describe('Navegación Secuencial de Preguntas', () => {
  let topicId: string;
  let questionIds: string[] = [];

  beforeAll(async () => {
    // Crear un tema de prueba
    const topicRes = await request(app)
      .post('/api/topics')
      .send({ 
        name: 'Tema Navegación', 
        description: 'Tema para probar navegación secuencial', 
        image_url: 'test.png' 
      });
    topicId = topicRes.body.data.id;

    // Crear 3 preguntas secuenciales
    const questions = [
      {
        number: 1,
        correct_answers: [0],
        locales: {
          en: {
            question: 'First question?',
            options: [
              { id: 1, text: 'Option 1' },
              { id: 2, text: 'Option 2' },
              { id: 3, text: 'Option 3' },
              { id: 4, text: 'Option 4' }
            ],
            explanation: 'First question explanation'
          },
          es: {
            question: '¿Primera pregunta?',
            options: [
              { id: 1, text: 'Opción 1' },
              { id: 2, text: 'Opción 2' },
              { id: 3, text: 'Opción 3' },
              { id: 4, text: 'Opción 4' }
            ],
            explanation: 'Explicación primera pregunta'
          }
        }
      },
      {
        number: 2,
        correct_answers: [1],
        locales: {
          en: {
            question: 'Second question?',
            options: [
              { id: 1, text: 'Option A' },
              { id: 2, text: 'Option B' },
              { id: 3, text: 'Option C' },
              { id: 4, text: 'Option D' }
            ],
            explanation: 'Second question explanation'
          },
          es: {
            question: '¿Segunda pregunta?',
            options: [
              { id: 1, text: 'Opción A' },
              { id: 2, text: 'Opción B' },
              { id: 3, text: 'Opción C' },
              { id: 4, text: 'Opción D' }
            ],
            explanation: 'Explicación segunda pregunta'
          }
        }
      },
      {
        number: 3,
        correct_answers: [2],
        locales: {
          en: {
            question: 'Third question?',
            options: [
              { id: 1, text: 'Choice 1' },
              { id: 2, text: 'Choice 2' },
              { id: 3, text: 'Choice 3' },
              { id: 4, text: 'Choice 4' }
            ],
            explanation: 'Third question explanation'
          },
          es: {
            question: '¿Tercera pregunta?',
            options: [
              { id: 1, text: 'Elección 1' },
              { id: 2, text: 'Elección 2' },
              { id: 3, text: 'Elección 3' },
              { id: 4, text: 'Elección 4' }
            ],
            explanation: 'Explicación tercera pregunta'
          }
        }
      }
    ];

    // Crear las preguntas
    for (const questionData of questions) {
      const res = await request(app)
        .post('/api/questions')
        .send({
          topic_id: topicId,
          ...questionData
        });
      questionIds.push(res.body.data.id);
    }
  }, 30000); // Aumentar timeout a 30 segundos

  it('debe obtener la primera pregunta con información de navegación', async () => {
    const res = await request(app)
      .get(`/api/questions/topic/${topicId}/navigate/1`);

    expect(res.status).toBe(200);
    expect(res.body.data.question.number).toBe(1);
    expect(res.body.data.navigation.current).toBe(1);
    expect(res.body.data.navigation.total).toBe(3);
    expect(res.body.data.navigation.hasPrevious).toBe(false);
    expect(res.body.data.navigation.hasNext).toBe(true);
    expect(res.body.data.navigation.previousNumber).toBe(null);
    expect(res.body.data.navigation.nextNumber).toBe(2);
  });

  it('debe obtener la pregunta del medio con navegación completa', async () => {
    const res = await request(app)
      .get(`/api/questions/topic/${topicId}/navigate/2`);

    expect(res.status).toBe(200);
    expect(res.body.data.question.number).toBe(2);
    expect(res.body.data.navigation.current).toBe(2);
    expect(res.body.data.navigation.total).toBe(3);
    expect(res.body.data.navigation.hasPrevious).toBe(true);
    expect(res.body.data.navigation.hasNext).toBe(true);
    expect(res.body.data.navigation.previousNumber).toBe(1);
    expect(res.body.data.navigation.nextNumber).toBe(3);
  });

  it('debe obtener la última pregunta con información de navegación', async () => {
    const res = await request(app)
      .get(`/api/questions/topic/${topicId}/navigate/3`);

    expect(res.status).toBe(200);
    expect(res.body.data.question.number).toBe(3);
    expect(res.body.data.navigation.current).toBe(3);
    expect(res.body.data.navigation.total).toBe(3);
    expect(res.body.data.navigation.hasPrevious).toBe(true);
    expect(res.body.data.navigation.hasNext).toBe(false);
    expect(res.body.data.navigation.previousNumber).toBe(2);
    expect(res.body.data.navigation.nextNumber).toBe(null);
  });

  it('debe devolver error para número de pregunta inexistente', async () => {
    const res = await request(app)
      .get(`/api/questions/topic/${topicId}/navigate/5`);

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/no encontrada/i);
  });

  it('debe devolver error para número inválido', async () => {
    const res = await request(app)
      .get(`/api/questions/topic/${topicId}/navigate/0`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/entero positivo/i);
  });

  it('debe devolver error para tema inexistente', async () => {
    const res = await request(app)
      .get(`/api/questions/topic/nonexistent-topic/navigate/1`);

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/no encontrado/i);
  });
}); 