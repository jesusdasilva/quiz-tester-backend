import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();
const userController = new UserController();

// Rutas de usuarios
router.post('/', userController.create.bind(userController));
router.get('/', userController.getAll.bind(userController));
router.get('/:id', userController.getById.bind(userController));
router.put('/:id', userController.update.bind(userController));
router.delete('/:id', userController.delete.bind(userController));

export default router; 