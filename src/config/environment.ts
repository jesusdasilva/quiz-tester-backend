export const config = {
  // Configuración del servidor
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Configuración de Firestore
  firestoreProjectId: process.env.FIRESTORE_PROJECT_ID,
  googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  
  // Configuración de CORS
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // Configuración de logging
  logLevel: process.env.LOG_LEVEL || 'info'
};

export const isDevelopment = config.nodeEnv === 'development';
export const isProduction = config.nodeEnv === 'production'; 