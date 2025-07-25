import { Request, Response } from 'express';
import { TopicModel, Topic } from '../models/Topic';
import { ResponseUtil } from '../utils/response';
import { Logger } from '../utils/logger';

export class TopicController {
  private topicModel = new TopicModel();

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, image_url } = req.body;

      if (!name || !description) {
        ResponseUtil.badRequest(res, 'Nombre y descripción son requeridos');
        return;
      }

      if (name.length < 3) {
        ResponseUtil.badRequest(res, 'El nombre debe tener al menos 3 caracteres');
        return;
      }

      if (description.length < 10) {
        ResponseUtil.badRequest(res, 'La descripción debe tener al menos 10 caracteres');
        return;
      }

      // Validación opcional para image_url si se proporciona
      if (image_url && typeof image_url !== 'string') {
        ResponseUtil.badRequest(res, 'image_url debe ser una cadena de texto');
        return;
      }

      const topic = await this.topicModel.create({ name, description, image_url });
      Logger.info('Tema creado exitosamente', { topicId: topic.id });
      ResponseUtil.success(res, topic, 'Tema creado exitosamente', 201);
    } catch (error) {
      Logger.error('Error al crear tema', error);
      ResponseUtil.error(res, 'Error al crear tema', 500, error);
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const topics = await this.topicModel.findAll();
      ResponseUtil.success(res, topics, 'Temas obtenidos exitosamente');
    } catch (error) {
      Logger.error('Error al obtener temas', error);
      ResponseUtil.error(res, 'Error al obtener temas', 500, error);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const topic = await this.topicModel.findById(id);

      if (!topic) {
        ResponseUtil.notFound(res, 'Tema no encontrado');
        return;
      }

      ResponseUtil.success(res, topic, 'Tema obtenido exitosamente');
    } catch (error) {
      Logger.error('Error al obtener tema', error);
      ResponseUtil.error(res, 'Error al obtener tema', 500, error);
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, image_url } = req.body;

      const topic = await this.topicModel.findById(id);
      if (!topic) {
        ResponseUtil.notFound(res, 'Tema no encontrado');
        return;
      }

      if (name && name.length < 3) {
        ResponseUtil.badRequest(res, 'El nombre debe tener al menos 3 caracteres');
        return;
      }

      if (description && description.length < 10) {
        ResponseUtil.badRequest(res, 'La descripción debe tener al menos 10 caracteres');
        return;
      }

      // Validación opcional para image_url si se proporciona
      if (image_url !== undefined && typeof image_url !== 'string') {
        ResponseUtil.badRequest(res, 'image_url debe ser una cadena de texto');
        return;
      }

      const updatedTopic = await this.topicModel.update(id, { name, description, image_url });
      Logger.info('Tema actualizado exitosamente', { topicId: id });
      ResponseUtil.success(res, updatedTopic, 'Tema actualizado exitosamente');
    } catch (error) {
      Logger.error('Error al actualizar tema', error);
      ResponseUtil.error(res, 'Error al actualizar tema', 500, error);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.topicModel.delete(id);

      if (!deleted) {
        ResponseUtil.notFound(res, 'Tema no encontrado');
        return;
      }

      Logger.info('Tema eliminado exitosamente', { topicId: id });
      ResponseUtil.success(res, null, 'Tema eliminado exitosamente');
    } catch (error) {
      Logger.error('Error al eliminar tema', error);
      ResponseUtil.error(res, 'Error al eliminar tema', 500, error);
    }
  }

  async getTopicsWithQuestionCount(req: Request, res: Response): Promise<void> {
    try {
      const { QuestionModel } = await import('../models/Question');
      const questionModel = new QuestionModel();
      
      // Obtener todos los temas
      const topics = await this.topicModel.findAll();
      
      // Obtener el conteo de preguntas para cada tema
      const topicsWithCount = await Promise.all(
        topics.map(async (topic) => {
          const questions = await questionModel.findByTopicId(topic.id!);
          return {
            ...topic,
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

      Logger.info('Temas con conteo de preguntas obtenidos exitosamente', { 
        totalTopics: topics.length, 
        totalQuestions 
      });
      
      ResponseUtil.success(res, result, 'Temas con conteo de preguntas obtenidos exitosamente');
    } catch (error) {
      Logger.error('Error al obtener temas con conteo de preguntas', error);
      ResponseUtil.error(res, 'Error al obtener temas con conteo de preguntas', 500, error);
    }
  }
} 