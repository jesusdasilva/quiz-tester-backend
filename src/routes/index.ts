import { Router } from 'express';
import userRoutes from './userRoutes';
import topicRoutes from './topicRoutes';
import questionRoutes from './questionRoutes';
import { config } from '../config/environment';

const router = Router();

// Rutas de la API
router.use('/api/users', userRoutes);
router.use('/api/topics', topicRoutes);
router.use('/api/questions', questionRoutes);

// Ruta de salud mejorada
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    cors: {
      enabled: true,
      origin: config.corsOrigin,
      credentials: true
    },
    endpoints: {
      users: '/api/users',
      topics: '/api/topics',
      questions: '/api/questions'
    }
  });
});

// Endpoint para verificar CORS
router.get('/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS funcionando correctamente',
    origin: req.headers.origin || 'No origin',
    method: req.method,
    headers: req.headers
  });
});

export default router; 