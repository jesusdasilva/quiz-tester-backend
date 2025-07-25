import firestore from '../config/database';

export interface QuestionLocale {
  question: string;
  options: string[];
  explanation: string;
}

export interface QuestionLocales {
  en: QuestionLocale;
  es: QuestionLocale;
}

export interface Question {
  id?: string;
  question_id?: string;
  topic_id: string;
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
      question_id: docRef.id, // Usar el ID de Firestore como question_id
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
      question_id: doc.id,
      topic_id: data?.topic_id,
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
        question_id: doc.id,
        topic_id: data?.topic_id,
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
        question_id: doc.id,
        topic_id: data?.topic_id,
        correct_answers: data?.correct_answers || [],
        locales: data?.locales,
        createdAt: convertTimestamp(data?.createdAt),
        updatedAt: convertTimestamp(data?.updatedAt)
      } as Question;
    });
  }

  async update(id: string, questionData: Partial<Omit<Question, 'id' | 'createdAt'>>): Promise<Question | null> {
    const updateData = {
      ...questionData,
      updatedAt: new Date()
    };

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
} 