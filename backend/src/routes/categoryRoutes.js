import express from "express";
import { protect, adminOnly, requireRole } from "../middleware/auth.js";
import {
  createCategory,
  deleteCategory,
  getCategory,
  getCategoryTree,
  listCategories,
  updateCategory
} from "../controllers/categoryController.js";

const router = express.Router();

router.get("/tree", getCategoryTree);
router.get("/", listCategories);
router.get("/:id", getCategory);

router.use(protect, adminOnly);

router.post("/", requireRole("admin", "product_manager"), createCategory);
router.put("/:id", requireRole("admin", "product_manager"), updateCategory);
router.delete("/:id", requireRole("admin"), deleteCategory);

export default router;
