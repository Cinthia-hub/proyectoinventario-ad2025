import express from "express";
import * as settingsController from "../controllers/settings.controller.js";

const router = express.Router();

router.get("/", settingsController.getSettings);
router.post("/", settingsController.saveSettings);

export default router;