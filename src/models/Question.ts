import firestore from '../config/database';

export interface QuestionOption {
  id: number;
  text: string;
}

export interface QuestionLocale {
  question: string;
  options: QuestionOption[];
  explanation: string;
}

export interface QuestionLocales {
  en: QuestionLocale;
  es: QuestionLocale;
}

export interface Question {
  id?: string;
  topic_id: string;
  number: number; // Número de pregunta obligatorio
  correct_answers: number[];
  locales: QuestionLocales;
  createdAt?: Date;
  updatedAt?: Date;
}

// Función para convertir Firestore Timestamp a Date
const convertTimestamp = (timestamp: any): Date | undefined => {
  if (!timestamp) return undefined;
  
  // Si es un Timestamp de Firestore
  if (timestamp._seconds !== undefined) {
    return new Date(timestamp._seconds * 1000);
  }
  
  // Si ya es un Date
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // Si es un string o número
  return new Date(timestamp);
};

export class QuestionModel {
  private collection = firestore.collection('questions');

  async create(questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Promise<Question> {
    const now = new Date();
    const question: Omit<Question, 'id'> = {
      ...questionData,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await this.collection.add(question);
    return {
      id: docRef.id,
      ...question
    };
  }

  async findById(id: string): Promise<Question | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    const data = doc.data();
    return {
      id: doc.id,
      topic_id: data?.topic_id,
      number: data?.number, // Recuperar el número de pregunta
      correct_answers: data?.correct_answers || [],
      locales: data?.locales,
      createdAt: convertTimestamp(data?.createdAt),
      updatedAt: convertTimestamp(data?.updatedAt)
    } as Question;
  }

  async findByTopicId(topicId: string): Promise<Question[]> {
    const snapshot = await this.collection.where('topic_id', '==', topicId).get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        topic_id: data?.topic_id,
        number: data?.number, // Recuperar el número de pregunta
        correct_answers: data?.correct_answers || [],
        locales: data?.locales,
        createdAt: convertTimestamp(data?.createdAt),
        updatedAt: convertTimestamp(data?.updatedAt)
      } as Question;
    });
  }

  async findAll(): Promise<Question[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        topic_id: data?.topic_id,
        number: data?.number, // Recuperar el número de pregunta
        correct_answers: data?.correct_answers || [],
        locales: data?.locales,
        createdAt: convertTimestamp(data?.createdAt),
        updatedAt: convertTimestamp(data?.updatedAt)
      } as Question;
    });
  }

  async update(id: string, questionData: Partial<Omit<Question, 'id' | 'createdAt'>>): Promise<Question | null> {
    // Eliminar campos undefined
    const updateData: any = { ...questionData, updatedAt: new Date() };
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await this.collection.doc(id).update(updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return false;
    }
    await this.collection.doc(id).delete();
    return true;
  }

  // Buscar si existe una pregunta con el mismo topic_id y number
  async existsByTopicIdAndNumber(topic_id: string, number: number, excludeId?: string): Promise<boolean> {
    let query = this.collection.where('topic_id', '==', topic_id).where('number', '==', number);
    const snapshot = await query.get();
    if (excludeId) {
      // Excluir la pregunta actual en caso de update
      return snapshot.docs.some(doc => doc.id !== excludeId);
    }
    return !snapshot.empty;
  }

  // Buscar una pregunta específica por topic_id y number
  async findByTopicIdAndNumber(topic_id: string, number: number): Promise<Question | null> {
    const snapshot = await this.collection
      .where('topic_id', '==', topic_id)
      .where('number', '==', number)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      topic_id: data?.topic_id,
      number: data?.number,
      correct_answers: data?.correct_answers || [],
      locales: data?.locales,
      createdAt: convertTimestamp(data?.createdAt),
      updatedAt: convertTimestamp(data?.updatedAt)
    } as Question;
  }

  // Buscar si existe una pregunta con el mismo texto en inglés
  async findByEnglishQuestion(topic_id: string, questionText: string, excludeId?: string): Promise<Question | null> {
    const snapshot = await this.collection
      .where('topic_id', '==', topic_id)
      .get();
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const existingQuestion = data?.locales?.en?.question;
      const matchesQuestion = existingQuestion && 
        existingQuestion.toLowerCase().trim() === questionText.toLowerCase().trim();
      
      if (matchesQuestion && (!excludeId || doc.id !== excludeId)) {
        return {
          id: doc.id,
          topic_id: data?.topic_id,
          number: data?.number,
          correct_answers: data?.correct_answers || [],
          locales: data?.locales,
          createdAt: convertTimestamp(data?.createdAt),
          updatedAt: convertTimestamp(data?.updatedAt)
        } as Question;
      }
    }
    
    return null;
  }

  // Buscar si existe una pregunta con el mismo texto en español
  async findBySpanishQuestion(topic_id: string, questionText: string, excludeId?: string): Promise<Question | null> {
    const snapshot = await this.collection
      .where('topic_id', '==', topic_id)
      .get();
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const existingQuestion = data?.locales?.es?.question;
      const matchesQuestion = existingQuestion && 
        existingQuestion.toLowerCase().trim() === questionText.toLowerCase().trim();
      
      if (matchesQuestion && (!excludeId || doc.id !== excludeId)) {
        return {
          id: doc.id,
          topic_id: data?.topic_id,
          number: data?.number,
          correct_answers: data?.correct_answers || [],
          locales: data?.locales,
          createdAt: convertTimestamp(data?.createdAt),
          updatedAt: convertTimestamp(data?.updatedAt)
        } as Question;
      }
    }
    
    return null;
  }
} 