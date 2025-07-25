import firestore from '../config/database';

export interface Topic {
  id?: string;
  name: string;
  description: string;
  image_url?: string | null;
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

export class TopicModel {
  private collection = firestore.collection('topics');

  async create(topicData: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>): Promise<Topic> {
    const now = new Date();
    const topic: Omit<Topic, 'id'> = {
      ...topicData,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await this.collection.add(topic);
    return {
      id: docRef.id,
      ...topic
    };
  }

  async findById(id: string): Promise<Topic | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    const data = doc.data();
    return {
      id: doc.id,
      name: data?.name,
      description: data?.description,
      image_url: data?.image_url || null,
      createdAt: convertTimestamp(data?.createdAt),
      updatedAt: convertTimestamp(data?.updatedAt)
    } as Topic;
  }

  async findAll(): Promise<Topic[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data?.name,
        description: data?.description,
        image_url: data?.image_url || null,
        createdAt: convertTimestamp(data?.createdAt),
        updatedAt: convertTimestamp(data?.updatedAt)
      } as Topic;
    });
  }

  async update(id: string, topicData: Partial<Omit<Topic, 'id' | 'createdAt'>>): Promise<Topic | null> {
    const updateData = {
      ...topicData,
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