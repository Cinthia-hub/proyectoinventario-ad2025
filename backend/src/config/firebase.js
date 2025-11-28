import admin from 'firebase-admin';

const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (!serviceAccountBase64) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON no está definida en las variables de entorno.');
}

let serviceAccount;
try {
  const jsonStr = Buffer.from(serviceAccountBase64, 'base64').toString('utf8');
  serviceAccount = JSON.parse(jsonStr);
} catch (err) {
  console.error('Error parseando FIREBASE_SERVICE_ACCOUNT_JSON:', err);
  throw err;
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export { admin, db };