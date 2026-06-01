import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  listOrdersAdmin,
  updateOrderStatus
} from "../controllers/orderController.js";
import { adminOnly, protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/mine", protect, getMyOrders);
router.get("/admin", protect, adminOnly, listOrdersAdmin);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);
router.get("/:id", protect, getOrderById);

export default router;

