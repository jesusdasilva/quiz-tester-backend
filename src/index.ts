import dotenv from 'dotenv';

// Cargar variables de entorno al inicio
dotenv.config();

import { app, PORT } from './config/app';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { Logger } from './utils/logger';

// El middleware de CORS ya maneja las peticiones OPTIONS automáticamente
// No necesitamos middleware adicional de OPTIONS

// Configurar rutas
app.use(routes);

// Middleware de manejo de errores (debe ir al final)
app.use(notFoundHandler);
app.use(errorHandler);

//mensaje de prueba de cierre de issues
// Iniciar servidor
app.listen(PORT, () => {
  Logger.info(`Servidor corriendo en el puerto ${PORT}`);
  Logger.info(`API disponible en http://localhost:${PORT}`);
  Logger.info(`Health check en http://localhost:${PORT}/health`);
  Logger.info(`CORS configurado para desarrollo`);
});

export { app };
