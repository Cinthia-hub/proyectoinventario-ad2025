import express from 'express';
import { db } from '../config/db.js';
import bcrypt from 'bcryptjs';

const router = express.Router();
const SALT_ROUNDS = 10;

function withoutPassword(obj) {
  const copy = { ...obj };
  if (copy.password) delete copy.password;
  return copy;
}

// GET /api/users
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('users').orderBy('nombre').get();
    const items = snapshot.docs.map(d => ({ id: d.id, ...withoutPassword(d.data()) }));
    res.json(items);
  } catch (err) {
    console.error('Error fetching users', err);
    res.status(500).json({ error: 'Error obteniendo usuarios' });
  }
});

// POST /api/users
router.post('/', async (req, res) => {
  try {
    const payload = req.body || {};
    console.log('POST /api/users payload (antes de hash):', payload);

    if (payload.password) {
      const hashed = await bcrypt.hash(String(payload.password), SALT_ROUNDS);
      payload.password = hashed;
      console.log('Password hasheada correctamente.');
    }

    const ref = await db.collection('users').add(payload);
    const created = await ref.get();
    const createdData = withoutPassword(created.data());
    res.status(201).json({ id: created.id, ...createdData });
  } catch (err) {
    console.error('Error creating user', err);
    res.status(500).json({ error: 'Error creando usuario' });
  }
});

// PUT /api/users/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('users').doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) return res.status(404).json({ error: 'Usuario no encontrado' });

    const updatePayload = { ...(req.body || {}) };
    console.log(`PUT /api/users/${id} payload (antes de hash):`, updatePayload);

    if (updatePayload.password) {
      const hashed = await bcrypt.hash(String(updatePayload.password), SALT_ROUNDS);
      updatePayload.password = hashed;
      console.log('Password actualizada y hasheada.');
    } else {
      delete updatePayload.password;
    }

    await docRef.update(updatePayload);
    const updated = await docRef.get();
    res.json({ id: updated.id, ...withoutPassword(updated.data()) });
  } catch (err) {
    console.error('Error updating user', err);
    res.status(500).json({ error: 'Error actualizando usuario' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('users').doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) return res.status(404).json({ error: 'Usuario no encontrado' });
    await docRef.delete();
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting user', err);
    res.status(500).json({ error: 'Error eliminando usuario' });
  }
});

export default router;