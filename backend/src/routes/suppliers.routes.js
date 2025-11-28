import express from 'express';
import { db } from '../config/db.js';

const router = express.Router();

// GET /api/suppliers
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('suppliers').orderBy('name').get();
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(items);
  } catch (err) {
    console.error('Error fetching suppliers', err);
    res.status(500).json({ error: 'Error obteniendo proveedores' });
  }
});

// POST /api/suppliers
router.post('/', async (req, res) => {
  try {
    const payload = req.body || {};
    const ref = await db.collection('suppliers').add(payload);
    const created = await ref.get();
    res.status(201).json({ id: created.id, ...created.data() });
  } catch (err) {
    console.error('Error creating supplier', err);
    res.status(500).json({ error: 'Error creando proveedor' });
  }
});

// PUT /api/suppliers/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('suppliers').doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) return res.status(404).json({ error: 'Proveedor no encontrado' });
    await docRef.update(req.body || {});
    const updated = await docRef.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (err) {
    console.error('Error updating supplier', err);
    res.status(500).json({ error: 'Error actualizando proveedor' });
  }
});

// DELETE /api/suppliers/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('suppliers').doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) return res.status(404).json({ error: 'Proveedor no encontrado' });
    await docRef.delete();
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting supplier', err);
    res.status(500).json({ error: 'Error eliminando proveedor' });
  }
});

export default router;