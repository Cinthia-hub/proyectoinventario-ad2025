import express from "express";
import * as storesController from "../controllers/stores.controller.js";

const router = express.Router();

// Definimos las URLs
router.get("/", storesController.getStores);      // GET /api/stores
router.post("/", storesController.createStore);   // POST /api/stores
router.put("/:id", storesController.updateStore); // PUT /api/stores/:id
router.delete("/:id", storesController.deleteStore); // DELETE /api/stores/:id

export default router;