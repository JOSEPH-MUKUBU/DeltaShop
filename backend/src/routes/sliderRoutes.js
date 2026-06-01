import express from "express";
import {
  createSlider,
  deleteSlider,
  listSlidersAdmin,
  listSlidersPublic,
  updateSlider
} from "../controllers/sliderController.js";
import { adminOnly, protect } from "../middleware/auth.js";

const router = express.Router();

// Public
router.get("/", listSlidersPublic);

// Admin
router.get("/admin", protect, adminOnly, listSlidersAdmin);
router.post("/", protect, adminOnly, createSlider);
router.put("/:id", protect, adminOnly, updateSlider);
router.delete("/:id", protect, adminOnly, deleteSlider);

export default router;

