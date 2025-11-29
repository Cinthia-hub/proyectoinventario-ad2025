import { db } from "../config/db.js"; // Asegúrate que esta ruta sea correcta según tu proyecto

// 1. OBTENER TODAS LAS TIENDAS
export const getStores = async (req, res) => {
  try {
    const snapshot = await db.collection('stores').get();
    
    // Convertimos los documentos de Firebase a un array limpio
    const stores = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    res.json(stores);
  } catch (error) {
    console.error('Error getting stores:', error);
    res.status(500).json({ error: error.message });
  }
};

// 2. CREAR UNA TIENDA
export const createStore = async (req, res) => {
  try {
    const newStore = req.body;
    // Guardamos en la colección 'stores'
    const docRef = await db.collection('stores').add(newStore);
    const docSnap = await docRef.get();
    
    res.status(201).json({ id: docRef.id, ...docSnap.data() });
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ error: error.message });
  }
};

// 3. ACTUALIZAR TIENDA
export const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const storeRef = db.collection('stores').doc(id);
    
    // Verificamos si existe antes de actualizar
    const doc = await storeRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Store not found' });
    }

    await storeRef.update(req.body);
    
    // Devolvemos los datos actualizados
    const updatedDoc = await storeRef.get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    console.error('Error updating store:', error);
    res.status(500).json({ error: error.message });
  }
};

// 4. ELIMINAR TIENDA
export const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('stores').doc(id).delete();
    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Error deleting store:', error);
    res.status(500).json({ error: error.message });
  }
};