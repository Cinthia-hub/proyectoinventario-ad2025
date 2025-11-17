import express from "express";
import cors from "cors";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import productsRouter from "./src/routes/product.routes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// lowdb setup
const file = path.join(__dirname, "db.json");
const adapter = new JSONFile(file);
const db = new Low(adapter);

// Initialize DB (ensure default)
await db.read();
db.data = db.data || { products: [] };
await db.write();

// Hacer db accesible en req via un middleware simple
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Routes
app.use("/api/products", productsRouter);

// Simple health
app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});