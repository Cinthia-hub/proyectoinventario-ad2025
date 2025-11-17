/*
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Importar rutas
import productsRouter from "./src/routes/product.routes.js";
import authRouter from "./src/routes/auth.routes.js";

// CARGAMOS LA DB AQUÍ (Asegúrate que la ruta apunte a db.js)
import "./src/config/db.js"; 

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/products", productsRouter);
app.use("/api/auth", authRouter);

app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
*/

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
//import productsRouter from "./src/routes/product.routes.js";
import authRouter from "./src/routes/auth.routes.js";
import "./src/config/db.js"; // Tu conexión a Firebase

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

//app.use("/api/products", productsRouter);
app.use("/api/auth", authRouter);

app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});