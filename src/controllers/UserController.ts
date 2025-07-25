import { Request, Response } from 'express';
import { UserModel, User } from '../models/User';
import { ResponseUtil } from '../utils/response';
import { Logger } from '../utils/logger';

export class UserController {
  private userModel = new UserModel();

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { email, name } = req.body;

      if (!email || !name) {
        ResponseUtil.badRequest(res, 'Email y nombre son requeridos');
        return;
      }

      // Verificar si el usuario ya existe
      const existingUser = await this.userModel.findByEmail(email);
      if (existingUser) {
        ResponseUtil.badRequest(res, 'El usuario ya existe');
        return;
      }

      const user = await this.userModel.create({ email, name });
      Logger.info('Usuario creado exitosamente', { userId: user.id });
      ResponseUtil.success(res, user, 'Usuario creado exitosamente', 201);
    } catch (error) {
      Logger.error('Error al crear usuario', error);
      ResponseUtil.error(res, 'Error al crear usuario', 500, error);
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userModel.findAll();
      ResponseUtil.success(res, users, 'Usuarios obtenidos exitosamente');
    } catch (error) {
      Logger.error('Error al obtener usuarios', error);
      ResponseUtil.error(res, 'Error al obtener usuarios', 500, error);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userModel.findById(id);

      if (!user) {
        ResponseUtil.notFound(res, 'Usuario no encontrado');
        return;
      }

      ResponseUtil.success(res, user, 'Usuario obtenido exitosamente');
    } catch (error) {
      Logger.error('Error al obtener usuario', error);
      ResponseUtil.error(res, 'Error al obtener usuario', 500, error);
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { email, name } = req.body;

      const user = await this.userModel.findById(id);
      if (!user) {
        ResponseUtil.notFound(res, 'Usuario no encontrado');
        return;
      }

      const updatedUser = await this.userModel.update(id, { email, name });
      Logger.info('Usuario actualizado exitosamente', { userId: id });
      ResponseUtil.success(res, updatedUser, 'Usuario actualizado exitosamente');
    } catch (error) {
      Logger.error('Error al actualizar usuario', error);
      ResponseUtil.error(res, 'Error al actualizar usuario', 500, error);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.userModel.delete(id);

      if (!deleted) {
        ResponseUtil.notFound(res, 'Usuario no encontrado');
        return;
      }

      Logger.info('Usuario eliminado exitosamente', { userId: id });
      ResponseUtil.success(res, null, 'Usuario eliminado exitosamente');
    } catch (error) {
      Logger.error('Error al eliminar usuario', error);
      ResponseUtil.error(res, 'Error al eliminar usuario', 500, error);
    }
  }
} 