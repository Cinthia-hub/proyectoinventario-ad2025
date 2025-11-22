import dotenv from 'dotenv';

// Cargar variables del archivo .env
dotenv.config();

// Función simple para validar que existan
function required(key, defaultValue = undefined) {
    const value = process.env[key] || defaultValue;
    if (!value) {
        throw new Error(`Faltante: La variable de entorno ${key} es requerida.`);
    }
    return value;
}

export const env = {
    PORT: process.env.PORT || 3000,
    JWT_SECRET: required('JWT_SECRET'),
    FIREBASE: {
        PROJECT_ID: required('FIREBASE_PROJECT_ID'),
        CLIENT_EMAIL: required('FIREBASE_CLIENT_EMAIL'),
        // Aquí mismo arreglamos lo de los saltos de línea de una vez
        PRIVATE_KEY: required('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
    }
};
