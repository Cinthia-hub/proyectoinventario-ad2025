import express from 'express';
import { db } from '../config/db.js';
import bcrypt from 'bcryptjs';
import authenticate from '../middleware/authenticate.js';

const router = express.Router();
const SALT_ROUNDS = 10;

function withoutPassword(obj) {
  const copy = { ...obj };
  if (copy.password) delete copy.password;
  return copy;
}

// GET /api/users  (Se permite listar a quien esté autenticado o público; si quieres protegerlo, añade authenticate)
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

// POST /api/users  (Crear usuario: protegido para admins)
router.post('/', authenticate, async (req, res) => {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'rol' && req.user.role !== 'admin')) {
      // El check anterior trata de cubrir casos pero lo ideal es req.user.role === 'admin'
      if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });
    }

    const payload = req.body || {};
    if (payload.password) {
      const hashed = await bcrypt.hash(String(payload.password), SALT_ROUNDS);
      payload.password = hashed;
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

// PUT /api/users/:id  (Actualizar usuario: protegido para admins)
router.put('/:id', authenticate, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { id } = req.params;
    const docRef = db.collection('users').doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) return res.status(404).json({ error: 'Usuario no encontrado' });

    const updatePayload = { ...(req.body || {}) };

    if (updatePayload.password) {
      const hashed = await bcrypt.hash(String(updatePayload.password), SALT_ROUNDS);
      updatePayload.password = hashed;
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

// DELETE /api/users/:id  (Prohibir autoeliminación)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // Solo admins pueden borrar
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { id } = req.params;

    // Evitar que un admin se elimine a sí mismo
    if (String(req.user.id) === String(id)) {
      return res.status(403).json({ error: 'Un administrador no puede eliminar su propia cuenta.' });
    }

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