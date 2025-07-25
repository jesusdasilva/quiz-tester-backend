import { Router } from 'express';
import { TopicController } from '../controllers/TopicController';

const router = Router();
const topicController = new TopicController();

// Rutas de topics
router.post('/', topicController.create.bind(topicController));
router.get('/', topicController.getAll.bind(topicController));
router.get('/with-questions-count', topicController.getTopicsWithQuestionCount.bind(topicController));
router.get('/:id', topicController.getById.bind(topicController));
router.put('/:id', topicController.update.bind(topicController));
router.delete('/:id', topicController.delete.bind(topicController));

export default router; 