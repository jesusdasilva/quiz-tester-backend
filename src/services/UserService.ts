import { UserModel, User } from '../models/User';
import { Logger } from '../utils/logger';

export class UserService {
  private userModel = new UserModel();

  async createUser(userData: { email: string; name: string }): Promise<User> {
    Logger.info('Creando nuevo usuario', { email: userData.email });
    
    // Validaciones adicionales de negocio
    if (userData.email.length < 5) {
      throw new Error('El email debe tener al menos 5 caracteres');
    }

    if (userData.name.length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }

    return await this.userModel.create(userData);
  }

  async getUserById(id: string): Promise<User | null> {
    Logger.info('Buscando usuario por ID', { userId: id });
    return await this.userModel.findById(id);
  }

  async getAllUsers(): Promise<User[]> {
    Logger.info('Obteniendo todos los usuarios');
    return await this.userModel.findAll();
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    Logger.info('Actualizando usuario', { userId: id });
    
    // Validaciones adicionales
    if (userData.email && userData.email.length < 5) {
      throw new Error('El email debe tener al menos 5 caracteres');
    }

    if (userData.name && userData.name.length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }

    return await this.userModel.update(id, userData);
  }

  async deleteUser(id: string): Promise<boolean> {
    Logger.info('Eliminando usuario', { userId: id });
    return await this.userModel.delete(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    Logger.info('Buscando usuario por email', { email });
    return await this.userModel.findByEmail(email);
  }
} 