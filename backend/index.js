import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import usersRouter from "./src/routes/admins.routes.js";
import productsRouter from "./src/routes/product.routes.js";
import suppliersRouter from "./src/routes/suppliers.routes.js";
import authRouter from "./src/routes/auth.routes.js";
import storesRoutes from "./src/routes/stores.routes.js";
import ordersRouter from "./src/routes/orders.routes.js";
import "./src/config/db.js"; // Tu conexión a Firebase

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Montar router de usuarios en /api/admins y /api/users para compatibilidad
app.use("/api/users", usersRouter);
app.use("/api/suppliers", suppliersRouter);
app.use("/api/products", productsRouter);
app.use("/api/auth", authRouter);
app.use("/api/stores", storesRoutes);
app.use("/api/orders", ordersRouter);

app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});