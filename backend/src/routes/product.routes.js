import express from "express";
import { db } from "../config/db.js";

const router = express.Router();

// GET /api/products - lista todos los productos
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection('products').get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/products - crea un producto
router.post("/", async (req, res) => {
  try {
    const payload = req.body || {};
    const docRef = await db.collection('products').add(payload);
    const created = await docRef.get();
    res.status(201).json({ id: created.id, ...created.data() });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/products/:id - actualiza un producto
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('products').doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }
    await docRef.update(req.body || {});
    const updated = await docRef.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/products/:id - elimina un producto
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('products').doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }
    await docRef.delete();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;