import express from "express";
import { nanoid } from "nanoid";

const router = express.Router();

// GET /api/products
router.get("/", async (req, res) => {
  const db = req.db;
  await db.read();
  const products = db.data.products || [];
  res.json(products);
});

// POST /api/products
router.post("/", async (req, res) => {
  const db = req.db;
  await db.read();
  const payload = req.body;
  const id = nanoid();
  const newProduct = { id, ...payload };
  db.data.products.push(newProduct);
  await db.write();
  res.status(201).json(newProduct);
});

// PUT /api/products/:id
router.put("/:id", async (req, res) => {
  const db = req.db;
  await db.read();
  const { id } = req.params;
  const index = (db.data.products || []).findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }
  db.data.products[index] = { ...db.data.products[index], ...req.body };
  await db.write();
  res.json(db.data.products[index]);
});

// DELETE /api/products/:id
router.delete("/:id", async (req, res) => {
  const db = req.db;
  await db.read();
  const { id } = req.params;
  const before = db.data.products.length;
  db.data.products = (db.data.products || []).filter(p => p.id !== id);
  await db.write();
  if (db.data.products.length === before) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.status(204).send();
});

export default router;