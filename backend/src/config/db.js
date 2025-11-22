import admin from 'firebase-admin';
import { env } from './env.js'; // <--- Importamos nuestra config limpia

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: env.FIREBASE.PROJECT_ID,
        clientEmail: env.FIREBASE.CLIENT_EMAIL,
        privateKey: env.FIREBASE.PRIVATE_KEY
    })
});

export const db = admin.firestore();
console.log('🔥 Conectado a Firebase (Configuración centralizada)');