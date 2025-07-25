import { QuestionModel, Question, QuestionLocales } from '../models/Question';
import { TopicModel } from '../models/Topic';
import { Logger } from '../utils/logger';

export class QuestionService {
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

  async createQuestion(questionData: {
    topic_id: string;
    correct_answers: number[];
    locales: QuestionLocales;
  }): Promise<Question> {
    Logger.info('Creando nueva pregunta', { topicId: questionData.topic_id });
    
    // Validar que el topic existe
    const topic = await this.topicModel.findById(questionData.topic_id);
    if (!topic) {
      throw new Error('El tema especificado no existe');
    }

    // Validar correct_answers
    if (!Array.isArray(questionData.correct_answers) || questionData.correct_answers.length === 0) {
      throw new Error('correct_answers debe ser un array no vacío');
    }

    // Validar que todos los valores en correct_answers estén entre 0 y 3
    for (const answer of questionData.correct_answers) {
      if (answer < 0 || answer > 3) {
        throw new Error('Todos los valores en correct_answers deben estar entre 0 y 3');
      }
    }

    // Validar que correct_answers no exceda el número de opciones
    const maxOptions = Math.max(
      questionData.locales.en.options.length,
      questionData.locales.es.options.length
    );
    for (const answer of questionData.correct_answers) {
      if (answer >= maxOptions) {
        throw new Error('correct_answers no puede contener valores mayores o iguales al número de opciones');
      }
    }

    // Validar locales
    const localeError = this.validateLocales(questionData.locales);
    if (localeError) {
      throw new Error(localeError);
    }

    return await this.questionModel.create(questionData);
  }

  async getQuestionById(id: string): Promise<Question | null> {
    Logger.info('Buscando pregunta por ID', { questionId: id });
    return await this.questionModel.findById(id);
  }

  async getAllQuestions(): Promise<Question[]> {
    Logger.info('Obteniendo todas las preguntas');
    return await this.questionModel.findAll();
  }

  async getQuestionsByTopicId(topicId: string): Promise<Question[]> {
    Logger.info('Obteniendo preguntas por tema', { topicId });
    
    // Validar que el topic existe
    const topic = await this.topicModel.findById(topicId);
    if (!topic) {
      throw new Error('El tema especificado no existe');
    }

    return await this.questionModel.findByTopicId(topicId);
  }

  async updateQuestion(id: string, questionData: Partial<Question>): Promise<Question | null> {
    Logger.info('Actualizando pregunta', { questionId: id });
    
    // Validar topic_id si se proporciona
    if (questionData.topic_id) {
      const topic = await this.topicModel.findById(questionData.topic_id);
      if (!topic) {
        throw new Error('El tema especificado no existe');
      }
    }

    // Validar correct_answers si se proporciona
    if (questionData.correct_answers !== undefined) {
      if (!Array.isArray(questionData.correct_answers) || questionData.correct_answers.length === 0) {
        throw new Error('correct_answers debe ser un array no vacío');
      }

      // Validar que todos los valores en correct_answers estén entre 0 y 3
      for (const answer of questionData.correct_answers) {
        if (answer < 0 || answer > 3) {
          throw new Error('Todos los valores en correct_answers deben estar entre 0 y 3');
        }
      }
    }

    // Validar locales si se proporciona
    if (questionData.locales) {
      const localeError = this.validateLocales(questionData.locales);
      if (localeError) {
        throw new Error(localeError);
      }

      // Validar que correct_answers no exceda el número de opciones
      const maxOptions = Math.max(
        questionData.locales.en.options.length,
        questionData.locales.es.options.length
      );
      if (questionData.correct_answers !== undefined) {
        for (const answer of questionData.correct_answers) {
          if (answer >= maxOptions) {
            throw new Error('correct_answers no puede contener valores mayores o iguales al número de opciones');
          }
        }
      }
    }

    return await this.questionModel.update(id, questionData);
  }

  async deleteQuestion(id: string): Promise<boolean> {
    Logger.info('Eliminando pregunta', { questionId: id });
    return await this.questionModel.delete(id);
  }
} 