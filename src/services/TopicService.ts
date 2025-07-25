import { TopicModel, Topic } from '../models/Topic';
import { Logger } from '../utils/logger';

export class TopicService {
  private topicModel = new TopicModel();

  async createTopic(topicData: { name: string; description: string; image_url?: string }): Promise<Topic> {
    Logger.info('Creando nuevo tema', { name: topicData.name });
    
    // Validaciones adicionales de negocio
    if (topicData.name.length < 3) {
      throw new Error('El nombre debe tener al menos 3 caracteres');
    }

    if (topicData.description.length < 10) {
      throw new Error('La descripción debe tener al menos 10 caracteres');
    }

    // Validación opcional para image_url
    if (topicData.image_url && typeof topicData.image_url !== 'string') {
      throw new Error('image_url debe ser una cadena de texto');
    }

    // Verificar si ya existe un tema con el mismo nombre
    const existingTopics = await this.topicModel.findAll();
    const existingTopic = existingTopics.find(topic => 
      topic.name.toLowerCase() === topicData.name.toLowerCase()
    );

    if (existingTopic) {
      throw new Error('Ya existe un tema con ese nombre');
    }

    return await this.topicModel.create(topicData);
  }

  async getTopicById(id: string): Promise<Topic | null> {
    Logger.info('Buscando tema por ID', { topicId: id });
    return await this.topicModel.findById(id);
  }

  async getAllTopics(): Promise<Topic[]> {
    Logger.info('Obteniendo todos los temas');
    return await this.topicModel.findAll();
  }

  async updateTopic(id: string, topicData: Partial<Topic>): Promise<Topic | null> {
    Logger.info('Actualizando tema', { topicId: id });
    
    // Validaciones adicionales
    if (topicData.name && topicData.name.length < 3) {
      throw new Error('El nombre debe tener al menos 3 caracteres');
    }

    if (topicData.description && topicData.description.length < 10) {
      throw new Error('La descripción debe tener al menos 10 caracteres');
    }

    // Validación opcional para image_url
    if (topicData.image_url !== undefined && typeof topicData.image_url !== 'string') {
      throw new Error('image_url debe ser una cadena de texto');
    }

    // Verificar duplicados si se está actualizando el nombre
    if (topicData.name) {
      const existingTopics = await this.topicModel.findAll();
      const existingTopic = existingTopics.find(topic => 
        topic.id !== id && topic.name.toLowerCase() === topicData.name!.toLowerCase()
      );

      if (existingTopic) {
        throw new Error('Ya existe un tema con ese nombre');
      }
    }

    return await this.topicModel.update(id, topicData);
  }

  async deleteTopic(id: string): Promise<boolean> {
    Logger.info('Eliminando tema', { topicId: id });
    return await this.topicModel.delete(id);
  }
} 