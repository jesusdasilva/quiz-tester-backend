import { Router } from 'express';
import { QuestionController } from '../controllers/QuestionController';

const router = Router();
const questionController = new QuestionController();

// Rutas de questions
router.post('/', questionController.create.bind(questionController));
router.get('/', questionController.getAll.bind(questionController));
router.get('/count-by-topics', questionController.getQuestionsCountByTopics.bind(questionController));
router.get('/topic/:topicId', questionController.getByTopicId.bind(questionController));
router.get('/topic/:topicId/navigate/:number', questionController.getQuestionByNumber.bind(questionController));
router.get('/:id', questionController.getById.bind(questionController));
router.put('/:id', questionController.update.bind(questionController));
router.delete('/:id', questionController.delete.bind(questionController));

export default router; 