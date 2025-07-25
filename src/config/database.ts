import { Firestore } from '@google-cloud/firestore';

// Configuración de Firestore
const firestore = new Firestore({
  projectId: process.env.FIRESTORE_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export default firestore; 