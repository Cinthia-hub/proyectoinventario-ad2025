import { db } from '../config/db.js'; 

const COLLECTION = 'users';

export default {
    async findByUsername(username) {
        const snapshot = await db.collection(COLLECTION)
            .where('username', '==', username)
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    },

    async create(userData) {
        const docRef = await db.collection(COLLECTION).add(userData);
        return { id: docRef.id, ...userData };
    },
    
    async findById(id) {
        const doc = await db.collection(COLLECTION).doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() };
    }
};
