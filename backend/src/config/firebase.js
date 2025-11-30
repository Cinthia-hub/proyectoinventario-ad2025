import admin from 'firebase-admin';
import dotenv from 'dotenv';

// 1. Cargar las variables del archivo .env
dotenv.config();

// 2. Verificar que existan las credenciales
if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
  throw new Error('Faltan variables de conexión a Firebase en el archivo .env');
}

// 3. Inicializar Firebase (Solo si no se ha iniciado ya)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Esta línea es vital para que lea bien la clave privada desde el .env
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
  });
}

// 4. Exportar la base de datos
export const db = admin.firestore();
export { admin };