import express from "express";
import { adminOnly, protect, requireRole } from "../middleware/auth.js";
import {
  deleteUser,
  exportOrdersCSV,
  exportProductsCSV,
  exportUsersCSV,
  getSummary,
  listOrdersAdmin,
  listProductsAdmin,
  listUsers,
  updateUser
} from "../controllers/adminController.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/summary", getSummary);

router.get("/users", listUsers);
router.put("/users/:id", requireRole("admin", "user_manager"), updateUser);
router.delete("/users/:id", requireRole("admin"), deleteUser);
router.get("/users/export", requireRole("admin", "user_manager"), exportUsersCSV);

router.get("/products", listProductsAdmin);
router.get("/products/export", requireRole("admin", "product_manager"), exportProductsCSV);

router.get("/orders", listOrdersAdmin);
router.get("/orders/export", requireRole("admin", "order_manager"), exportOrdersCSV);

export default router;

