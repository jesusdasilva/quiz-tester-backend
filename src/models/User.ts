import firestore from '../config/database';

export interface User {
  id?: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
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

export class UserModel {
  private collection = firestore.collection('users');

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const now = new Date();
    const user: Omit<User, 'id'> = {
      ...userData,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await this.collection.add(user);
    return {
      id: docRef.id,
      ...user
    };
  }

  async findById(id: string): Promise<User | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    const data = doc.data();
    return {
      id: doc.id,
      email: data?.email,
      name: data?.name,
      createdAt: convertTimestamp(data?.createdAt),
      updatedAt: convertTimestamp(data?.updatedAt)
    } as User;
  }

  async findByEmail(email: string): Promise<User | null> {
    const snapshot = await this.collection.where('email', '==', email).limit(1).get();
    if (snapshot.empty) {
      return null;
    }
    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      email: data?.email,
      name: data?.name,
      createdAt: convertTimestamp(data?.createdAt),
      updatedAt: convertTimestamp(data?.updatedAt)
    } as User;
  }

  async update(id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
    const updateData = {
      ...userData,
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

  async findAll(): Promise<User[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data?.email,
        name: data?.name,
        createdAt: convertTimestamp(data?.createdAt),
        updatedAt: convertTimestamp(data?.updatedAt)
      } as User;
    });
  }
} 