import { Request, Response } from 'express';
import { QuestionModel, Question, QuestionLocales } from '../models/Question';
import { TopicModel } from '../models/Topic';
import { ResponseUtil } from '../utils/response';
import { Logger } from '../utils/logger';

export class QuestionController {
  private questionModel = new QuestionModel();
  private topicModel = new TopicModel();

  private validateLocales(locales: QuestionLocales): string | null {
    const requiredLanguages = ['en', 'es'];
    
    for (const lang of requiredLanguages) {
      const locale = locales[lang as keyof QuestionLocales];
      if (!locale) {
        return `Falta el idioma ${lang}`;
      }
      
      if (!locale.question || locale.question.trim().length < 10) {
        return `La pregunta en ${lang} debe tener al menos 10 caracteres`;
      }
      
      if (!locale.options || !Array.isArray(locale.options) || locale.options.length < 2) {
        return `Debe haber al menos 2 opciones en ${lang}`;
      }
      
      if (!locale.explanation || locale.explanation.trim().length < 10) {
        return `La explicación en ${lang} debe tener al menos 10 caracteres`;
      }
    }
    
    return null;
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { topic_id, correct_answers, locales } = req.body;

      // Validaciones básicas
      if (!topic_id || !correct_answers || !locales) {
        ResponseUtil.badRequest(res, 'Todos los campos son requeridos: topic_id, correct_answers, locales');
        return;
      }

      // Validar que el topic existe
      const topic = await this.topicModel.findById(topic_id);
      if (!topic) {
        ResponseUtil.badRequest(res, 'El tema especificado no existe');
        return;
      }

      // Validar correct_answers
      if (!Array.isArray(correct_answers) || correct_answers.length === 0) {
        ResponseUtil.badRequest(res, 'correct_answers debe ser un array no vacío');
        return;
      }

      // Validar que todos los valores en correct_answers estén entre 0 y 3
      for (const answer of correct_answers) {
        if (answer < 0 || answer > 3) {
          ResponseUtil.badRequest(res, 'Todos los valores en correct_answers deben estar entre 0 y 3');
          return;
        }
      }

      // Validar locales
      const localeError = this.validateLocales(locales);
      if (localeError) {
        ResponseUtil.badRequest(res, localeError);
        return;
      }

      const question = await this.questionModel.create({
        topic_id,
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
      const { topic_id, correct_answers, locales } = req.body;

      const question = await this.questionModel.findById(id);
      if (!question) {
        ResponseUtil.notFound(res, 'Pregunta no encontrada');
        return;
      }

      // Validar topic_id si se proporciona
      if (topic_id) {
        const topic = await this.topicModel.findById(topic_id);
        if (!topic) {
          ResponseUtil.badRequest(res, 'El tema especificado no existe');
          return;
        }
      }

      // Validar correct_answers si se proporciona
      if (correct_answers !== undefined) {
        if (!Array.isArray(correct_answers) || correct_answers.length === 0) {
          ResponseUtil.badRequest(res, 'correct_answers debe ser un array no vacío');
          return;
        }

        // Validar que todos los valores en correct_answers estén entre 0 y 3
        for (const answer of correct_answers) {
          if (answer < 0 || answer > 3) {
            ResponseUtil.badRequest(res, 'Todos los valores en correct_answers deben estar entre 0 y 3');
            return;
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
      }

      const updatedQuestion = await this.questionModel.update(id, {
        topic_id,
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
} 