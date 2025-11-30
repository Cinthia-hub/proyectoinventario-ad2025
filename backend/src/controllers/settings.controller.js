import { db } from "../config/db.js";

const SETTINGS_ID = 'general'; 

export const getSettings = async (req, res) => {
  try {
    const doc = await db.collection('settings').doc(SETTINGS_ID).get();
    if (!doc.exists) return res.json({});
    res.json(doc.data());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const saveSettings = async (req, res) => {
  try {
    const data = req.body;
    
    // Guardamos en Firestore
    await db.collection('settings').doc(SETTINGS_ID).set(data, { merge: true });
    
    res.json({ message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: error.message });
  }
};