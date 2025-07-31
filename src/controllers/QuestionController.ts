import { Request, Response } from 'express';
import { QuestionModel, Question, QuestionLocales } from '../models/Question';
import { TopicModel } from '../models/Topic';
import { ResponseUtil } from '../utils/response';
import { Logger } from '../utils/logger';

export class QuestionController {
  private questionModel = new QuestionModel();
  private topicModel = new TopicModel();

  private validateLocales(locales: any): string | null {
    if (!locales || typeof locales !== 'object') {
      return 'locales debe ser un objeto';
    }

    if (!locales.en || !locales.es) {
      return 'locales debe contener en y es';
    }

    const languages = ['en', 'es'];
    
    for (const lang of languages) {
      const locale = locales[lang];
      
      if (!locale || typeof locale !== 'object') {
        return `locale ${lang} debe ser un objeto`;
      }

      if (!locale.question || typeof locale.question !== 'string' || locale.question.trim() === '') {
        return `locale ${lang} debe tener una pregunta válida`;
      }

      if (!locale.options || !Array.isArray(locale.options) || locale.options.length === 0) {
        return `locale ${lang} debe tener opciones válidas`;
      }

      if (!locale.explanation || typeof locale.explanation !== 'string' || locale.explanation.trim() === '') {
        return `locale ${lang} debe tener una explicación válida`;
      }

      // Validar estructura de opciones
      const optionIds = new Set<number>();
      for (const option of locale.options) {
        if (!option || typeof option !== 'object') {
          return `Cada opción en ${lang} debe ser un objeto con id y text`;
        }
        
        if (!option.id || typeof option.id !== 'number' || option.id <= 0) {
          return `Cada opción en ${lang} debe tener un id válido (número entero positivo)`;
        }
        
        if (!option.text || typeof option.text !== 'string' || option.text.trim() === '') {
          return `Cada opción en ${lang} debe tener un text válido`;
        }
        // Validar que el ID sea único
        if (optionIds.has(option.id)) {
          return `El id ${option.id} está duplicado en las opciones de ${lang}`;
        }
        optionIds.add(option.id);
      }
    }

    return null;
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { topic_id, correct_answers, locales, number } = req.body;

      // Validaciones básicas
      if (!topic_id || !correct_answers || !locales || number === undefined) {
        ResponseUtil.badRequest(res, 'Todos los campos son requeridos: topic_id, correct_answers, locales, number');
        return;
      }

      // Validar que number sea un entero positivo
      if (!Number.isInteger(number) || number <= 0) {
        ResponseUtil.badRequest(res, 'El campo number debe ser un número entero positivo');
        return;
      }

      // Validar que el topic existe
      const topic = await this.topicModel.findById(topic_id);
      if (!topic) {
        ResponseUtil.badRequest(res, 'El tema especificado no existe');
        return;
      }

      // Validar unicidad de number por topic
      const exists = await this.questionModel.existsByTopicIdAndNumber(topic_id, number);
      if (exists) {
        ResponseUtil.badRequest(res, 'Ya existe una pregunta con ese número en el tema especificado');
        return;
      }

      // Validar correct_answers
      if (!Array.isArray(correct_answers) || correct_answers.length === 0) {
        ResponseUtil.badRequest(res, 'correct_answers debe ser un array no vacío');
        return;
      }

      // Validar que exista al menos una respuesta correcta
      if (correct_answers.length === 0) {
        ResponseUtil.badRequest(res, 'Debe existir al menos una respuesta correcta');
        return;
      }

      // Validar locales primero para obtener los IDs válidos de las opciones
      const localeError = this.validateLocales(locales);
      if (localeError) {
        ResponseUtil.badRequest(res, localeError);
        return;
      }

      // Obtener todos los IDs válidos de las opciones (tanto en inglés como en español)
      const enOptionIds = new Set(locales.en.options.map((opt: any) => opt.id));
      const esOptionIds = new Set(locales.es.options.map((opt: any) => opt.id));
      
      // Verificar que ambos idiomas tengan los mismos IDs
      if (enOptionIds.size !== esOptionIds.size) {
        ResponseUtil.badRequest(res, 'Las opciones en inglés y español deben tener la misma cantidad de elementos');
        return;
      }
      
      for (const id of enOptionIds) {
        if (!esOptionIds.has(id)) {
          ResponseUtil.badRequest(res, `Los IDs de las opciones deben ser iguales en ambos idiomas. ID ${id} no coincide`);
          return;
        }
      }

      // Validar que cada valor en correct_answers corresponda a un ID válido de las opciones
      for (const answer of correct_answers) {
        if (!enOptionIds.has(answer)) {
          const validIds = Array.from(enOptionIds).sort((a, b) => (a as number) - (b as number));
          ResponseUtil.badRequest(res, `El valor ${answer} en correct_answers no corresponde a ningún ID de opción válido. IDs válidos: [${validIds.join(', ')}]`);
          return;
        }
      }

      // Validar que no exista una pregunta con el mismo texto en inglés
      const existingEnglishQuestion = await this.questionModel.findByEnglishQuestion(topic_id, locales.en.question);
      if (existingEnglishQuestion) {
        ResponseUtil.badRequest(res, 'Ya existe una pregunta con el mismo texto en inglés en este tema', {
          duplicateQuestion: existingEnglishQuestion
        });
        return;
      }

      // Validar que no exista una pregunta con el mismo texto en español
      const existingSpanishQuestion = await this.questionModel.findBySpanishQuestion(topic_id, locales.es.question);
      if (existingSpanishQuestion) {
        ResponseUtil.badRequest(res, 'Ya existe una pregunta con el mismo texto en español en este tema', {
          duplicateQuestion: existingSpanishQuestion
        });
        return;
      }

      const question = await this.questionModel.create({
        topic_id,
        number,
        correct_answers,
        locales
      });

      Logger.info('Pregunta creada exitosamente', { questionId: question.id, topicId: topic_id });
      ResponseUtil.success(res, question, 'Pregunta creada exitosamente', 201);
    } catch (error) {
      Logger.error('Error al crear pregunta', error);
      ResponseUtil.error(res, 'Error al crear pregunta', 500, error);
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const questions = await this.questionModel.findAll();
      ResponseUtil.success(res, questions, 'Preguntas obtenidas exitosamente');
    } catch (error) {
      Logger.error('Error al obtener preguntas', error);
      ResponseUtil.error(res, 'Error al obtener preguntas', 500, error);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const question = await this.questionModel.findById(id);

      if (!question) {
        ResponseUtil.notFound(res, 'Pregunta no encontrada');
        return;
      }

      ResponseUtil.success(res, question, 'Pregunta obtenida exitosamente');
    } catch (error) {
      Logger.error('Error al obtener pregunta', error);
      ResponseUtil.error(res, 'Error al obtener pregunta', 500, error);
    }
  }

  async getByTopicId(req: Request, res: Response): Promise<void> {
    try {
      const { topicId } = req.params;
      
      // Validar que el topic existe
      const topic = await this.topicModel.findById(topicId);
      if (!topic) {
        ResponseUtil.notFound(res, 'Tema no encontrado');
        return;
      }

      const questions = await this.questionModel.findByTopicId(topicId);
      ResponseUtil.success(res, questions, 'Preguntas del tema obtenidas exitosamente');
    } catch (error) {
      Logger.error('Error al obtener preguntas del tema', error);
      ResponseUtil.error(res, 'Error al obtener preguntas del tema', 500, error);
    }
  }

  async getQuestionsCountByTopics(req: Request, res: Response): Promise<void> {
    try {
      // Obtener todos los temas
      const topics = await this.topicModel.findAll();
      
      // Obtener el conteo de preguntas para cada tema
      const topicsWithCount = await Promise.all(
        topics.map(async (topic) => {
          const questions = await this.questionModel.findByTopicId(topic.id!);
          return {
            topic_id: topic.id,
            topic_name: topic.name,
            topic_description: topic.description,
            topic_image_url: topic.image_url,
            questions_count: questions.length
          };
        })
      );

      // Calcular total de preguntas
      const totalQuestions = topicsWithCount.reduce((sum, topic) => sum + topic.questions_count, 0);

      const result = {
        topics: topicsWithCount,
        total_topics: topics.length,
        total_questions: totalQuestions
      };

      Logger.info('Conteo de preguntas por temas obtenido exitosamente', { 
        totalTopics: topics.length, 
        totalQuestions 
      });
      
      ResponseUtil.success(res, result, 'Conteo de preguntas por temas obtenido exitosamente');
    } catch (error) {
      Logger.error('Error al obtener conteo de preguntas por temas', error);
      ResponseUtil.error(res, 'Error al obtener conteo de preguntas por temas', 500, error);
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { topic_id, correct_answers, locales, number } = req.body;

      const question = await this.questionModel.findById(id);
      if (!question) {
        ResponseUtil.notFound(res, 'Pregunta no encontrada');
        return;
      }

      // Validar topic_id si se proporciona
      let topicIdToCheck = question.topic_id;
      if (topic_id) {
        const topic = await this.topicModel.findById(topic_id);
        if (!topic) {
          ResponseUtil.badRequest(res, 'El tema especificado no existe');
          return;
        }
        topicIdToCheck = topic_id;
      }

      // Validar number si se proporciona
      if (number !== undefined) {
        if (!Number.isInteger(number) || number <= 0) {
          ResponseUtil.badRequest(res, 'El campo number debe ser un número entero positivo');
          return;
        }
        // Validar unicidad de number por topic (excluyendo la pregunta actual)
        const exists = await this.questionModel.existsByTopicIdAndNumber(topicIdToCheck, number, id);
        if (exists) {
          ResponseUtil.badRequest(res, 'Ya existe una pregunta con ese número en el tema especificado');
          return;
        }
      }

      // Validar correct_answers si se proporciona
      if (correct_answers !== undefined) {
        if (!Array.isArray(correct_answers) || correct_answers.length === 0) {
          ResponseUtil.badRequest(res, 'correct_answers debe ser un array no vacío');
          return;
        }

        // Validar que exista al menos una respuesta correcta
        if (correct_answers.length === 0) {
          ResponseUtil.badRequest(res, 'Debe existir al menos una respuesta correcta');
          return;
        }

        // Si se proporcionan locales, validar que correct_answers corresponda a IDs válidos
        if (locales) {
          // Obtener todos los IDs válidos de las opciones
          const enOptionIds = new Set(locales.en.options.map((opt: any) => opt.id));
          const esOptionIds = new Set(locales.es.options.map((opt: any) => opt.id));
          
          // Verificar que ambos idiomas tengan los mismos IDs
          if (enOptionIds.size !== esOptionIds.size) {
            ResponseUtil.badRequest(res, 'Las opciones en inglés y español deben tener la misma cantidad de elementos');
            return;
          }
          
          for (const id of enOptionIds) {
            if (!esOptionIds.has(id)) {
              ResponseUtil.badRequest(res, `Los IDs de las opciones deben ser iguales en ambos idiomas. ID ${id} no coincide`);
              return;
            }
          }

          // Validar que cada valor en correct_answers corresponda a un ID válido de las opciones
          for (const answer of correct_answers) {
            if (!enOptionIds.has(answer)) {
              const validIds = Array.from(enOptionIds).sort((a, b) => (a as number) - (b as number));
              ResponseUtil.badRequest(res, `El valor ${answer} en correct_answers no corresponde a ningún ID de opción válido. IDs válidos: [${validIds.join(', ')}]`);
              return;
            }
          }
        }
      }

      // Validar locales si se proporciona
      if (locales) {
        const localeError = this.validateLocales(locales);
        if (localeError) {
          ResponseUtil.badRequest(res, localeError);
          return;
        }

        // Validar que no exista una pregunta con el mismo texto en inglés (excluyendo la actual)
        const existingEnglishQuestion = await this.questionModel.findByEnglishQuestion(topicIdToCheck, locales.en.question, id);
        if (existingEnglishQuestion) {
          ResponseUtil.badRequest(res, 'Ya existe una pregunta con el mismo texto en inglés en este tema', {
            duplicateQuestion: existingEnglishQuestion
          });
          return;
        }

        // Validar que no exista una pregunta con el mismo texto en español (excluyendo la actual)
        const existingSpanishQuestion = await this.questionModel.findBySpanishQuestion(topicIdToCheck, locales.es.question, id);
        if (existingSpanishQuestion) {
          ResponseUtil.badRequest(res, 'Ya existe una pregunta con el mismo texto en español en este tema', {
            duplicateQuestion: existingSpanishQuestion
          });
          return;
        }
      }

      const updatedQuestion = await this.questionModel.update(id, {
        topic_id,
        number,
        correct_answers,
        locales
      });

      Logger.info('Pregunta actualizada exitosamente', { questionId: id });
      ResponseUtil.success(res, updatedQuestion, 'Pregunta actualizada exitosamente');
    } catch (error) {
      Logger.error('Error al actualizar pregunta', error);
      ResponseUtil.error(res, 'Error al actualizar pregunta', 500, error);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.questionModel.delete(id);

      if (!deleted) {
        ResponseUtil.notFound(res, 'Pregunta no encontrada');
        return;
      }

      Logger.info('Pregunta eliminada exitosamente', { questionId: id });
      ResponseUtil.success(res, null, 'Pregunta eliminada exitosamente');
    } catch (error) {
      Logger.error('Error al eliminar pregunta', error);
      ResponseUtil.error(res, 'Error al eliminar pregunta', 500, error);
    }
  }

  async getQuestionByNumber(req: Request, res: Response): Promise<void> {
    try {
      const { topicId, number } = req.params;
      const questionNumber = parseInt(number);

      // Validar que el número sea válido
      if (isNaN(questionNumber) || questionNumber <= 0) {
        ResponseUtil.badRequest(res, 'El número de pregunta debe ser un entero positivo');
        return;
      }

      // Validar que el topic existe
      const topic = await this.topicModel.findById(topicId);
      if (!topic) {
        ResponseUtil.notFound(res, 'Tema no encontrado');
        return;
      }

      // Obtener pregunta actual
      const question = await this.questionModel.findByTopicIdAndNumber(topicId, questionNumber);
      if (!question) {
        ResponseUtil.notFound(res, 'Pregunta no encontrada');
        return;
      }

      // Obtener todas las preguntas del tema para calcular navegación
      const allQuestions = await this.questionModel.findByTopicId(topicId);
      const totalQuestions = allQuestions.length;

      // Calcular información de navegación
      const hasPrevious = questionNumber > 1;
      const hasNext = questionNumber < totalQuestions;

      const navigationData = {
        question,
        navigation: {
          current: questionNumber,
          total: totalQuestions,
          hasPrevious,
          hasNext,
          previousNumber: hasPrevious ? questionNumber - 1 : null,
          nextNumber: hasNext ? questionNumber + 1 : null
        }
      };

      Logger.info('Pregunta obtenida para navegación', { 
        topicId, 
        questionNumber, 
        totalQuestions 
      });
      
      ResponseUtil.success(res, navigationData, 'Pregunta obtenida exitosamente');
    } catch (error) {
      Logger.error('Error al obtener pregunta para navegación', error);
      ResponseUtil.error(res, 'Error al obtener pregunta', 500, error);
    }
  }
} 