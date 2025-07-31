import request from 'supertest';
import { app } from '../src/index';

describe('Validaciones de Preguntas Duplicadas y Respuestas', () => {
  let topicId: string;

  beforeAll(async () => {
    // Crear un tema de prueba
    const topicRes = await request(app)
      .post('/api/topics')
      .send({ 
        name: 'Tema Duplicados', 
        description: 'Tema para probar validaciones de preguntas duplicadas', 
        image_url: 'test.png' 
      });
    topicId = topicRes.body.data.id;
  }, 30000);

  it('debe crear una pregunta válida', async () => {
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
  });

  it('debe rechazar pregunta con texto duplicado en inglés', async () => {
    const res = await request(app)
      .post('/api/questions')
      .send({
        topic_id: topicId,
        number: 2,
        correct_answers: [0],
        locales: {
          en: {
            question: 'What is 2+2?', // Mismo texto que la pregunta anterior
            options: [
              { id: 1, text: '3' },
              { id: 2, text: '4' },
              { id: 3, text: '5' },
              { id: 4, text: '6' }
            ],
            explanation: '2+2 equals 4'
          },
          es: {
            question: '¿Cuánto es 3+3?', // Texto diferente en español
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
    expect(res.body.message).toMatch(/inglés/);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.duplicateQuestion).toBeDefined();
    expect(res.body.error.duplicateQuestion.locales.en.question).toBe('What is 2+2?');
  });

  it('debe rechazar pregunta con texto duplicado en español', async () => {
    const res = await request(app)
      .post('/api/questions')
      .send({
        topic_id: topicId,
        number: 3,
        correct_answers: [0],
        locales: {
          en: {
            question: 'What is 3+3?', // Texto diferente en inglés
            options: [
              { id: 1, text: '5' },
              { id: 2, text: '6' },
              { id: 3, text: '7' },
              { id: 4, text: '8' }
            ],
            explanation: '3+3 equals 6'
          },
          es: {
            question: '¿Cuánto es 2+2?', // Mismo texto que la primera pregunta
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
    expect(res.body.message).toMatch(/español/);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.duplicateQuestion).toBeDefined();
    expect(res.body.error.duplicateQuestion.locales.es.question).toBe('¿Cuánto es 2+2?');
  });

  it('debe rechazar pregunta sin respuestas correctas', async () => {
    const res = await request(app)
      .post('/api/questions')
      .send({
        topic_id: topicId,
        number: 4,
        correct_answers: [], // Array vacío
        locales: {
          en: {
            question: 'What is 5+5?',
            options: [
              { id: 1, text: '8' },
              { id: 2, text: '9' },
              { id: 3, text: '10' },
              { id: 4, text: '11' }
            ],
            explanation: '5+5 equals 10'
          },
          es: {
            question: '¿Cuánto es 5+5?',
            options: [
              { id: 1, text: '8' },
              { id: 2, text: '9' },
              { id: 3, text: '10' },
              { id: 4, text: '11' }
            ],
            explanation: '5+5 es igual a 10'
          }
        }
      });
    
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/array no vacío/);
  });

  it('debe permitir actualizar pregunta sin cambiar el texto', async () => {
    // Crear una pregunta para actualizar
    const createRes = await request(app)
      .post('/api/questions')
      .send({
        topic_id: topicId,
        number: 5,
        correct_answers: [0],
        locales: {
          en: {
            question: 'What is 6+6?',
            options: [
              { id: 1, text: '10' },
              { id: 2, text: '11' },
              { id: 3, text: '12' },
              { id: 4, text: '13' }
            ],
            explanation: '6+6 equals 12'
          },
          es: {
            question: '¿Cuánto es 6+6?',
            options: [
              { id: 1, text: '10' },
              { id: 2, text: '11' },
              { id: 3, text: '12' },
              { id: 4, text: '13' }
            ],
            explanation: '6+6 es igual a 12'
          }
        }
      });
    
    expect(createRes.status).toBe(201);
    const questionId = createRes.body.data.id;

    // Actualizar solo el número (sin cambiar el texto)
    const updateRes = await request(app)
      .put(`/api/questions/${questionId}`)
      .send({
        number: 6
      });
    
    expect(updateRes.status).toBe(200);
  });

  it('debe rechazar actualización con texto duplicado', async () => {
    // Crear una pregunta para actualizar
    const createRes = await request(app)
      .post('/api/questions')
      .send({
        topic_id: topicId,
        number: 7,
        correct_answers: [0],
        locales: {
          en: {
            question: 'What is 7+7?',
            options: [
              { id: 1, text: '12' },
              { id: 2, text: '13' },
              { id: 3, text: '14' },
              { id: 4, text: '15' }
            ],
            explanation: '7+7 equals 14'
          },
          es: {
            question: '¿Cuánto es 7+7?',
            options: [
              { id: 1, text: '12' },
              { id: 2, text: '13' },
              { id: 3, text: '14' },
              { id: 4, text: '15' }
            ],
            explanation: '7+7 es igual a 14'
          }
        }
      });
    
    expect(createRes.status).toBe(201);
    const questionId = createRes.body.data.id;

    // Intentar actualizar con texto duplicado
    const updateRes = await request(app)
      .put(`/api/questions/${questionId}`)
      .send({
        locales: {
          en: {
            question: 'What is 2+2?', // Texto duplicado
            options: [
              { id: 1, text: '3' },
              { id: 2, text: '4' },
              { id: 3, text: '5' },
              { id: 4, text: '6' }
            ],
            explanation: 'Updated explanation'
          },
          es: {
            question: '¿Cuánto es 7+7?', // Mantener el mismo texto
            options: [
              { id: 1, text: '12' },
              { id: 2, text: '13' },
              { id: 3, text: '14' },
              { id: 4, text: '15' }
            ],
            explanation: 'Explicación actualizada'
          }
        }
      });
    
    expect(updateRes.status).toBe(400);
    expect(updateRes.body.message).toMatch(/inglés/);
    expect(updateRes.body.error).toBeDefined();
    expect(updateRes.body.error.duplicateQuestion).toBeDefined();
    expect(updateRes.body.error.duplicateQuestion.locales.en.question).toBe('What is 2+2?');
  });

  it('debe permitir preguntas con el mismo texto en diferentes temas', async () => {
    // Crear otro tema
    const topicRes2 = await request(app)
      .post('/api/topics')
      .send({ 
        name: 'Tema Duplicados 2', 
        description: 'Segundo tema para probar duplicados', 
        image_url: 'test2.png' 
      });
    const topicId2 = topicRes2.body.data.id;

    // Crear pregunta con el mismo texto en el segundo tema
    const res = await request(app)
      .post('/api/questions')
      .send({
        topic_id: topicId2,
        number: 1,
        correct_answers: [0],
        locales: {
          en: {
            question: 'What is 2+2?', // Mismo texto que en el primer tema
            options: [
              { id: 1, text: '3' },
              { id: 2, text: '4' },
              { id: 3, text: '5' },
              { id: 4, text: '6' }
            ],
            explanation: '2+2 equals 4'
          },
          es: {
            question: '¿Cuánto es 2+2?', // Mismo texto que en el primer tema
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
    
    expect(res.status).toBe(201); // Debe permitirse en diferentes temas
  });
}); 