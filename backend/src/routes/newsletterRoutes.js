import express from "express";
import { subscribe, unsubscribe, getSubscribers } from "../controllers/newsletterController.js";
import { adminOnly, protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/subscribe", subscribe);
router.post("/unsubscribe", unsubscribe);

// Admin routes
router.get("/subscribers", protect, adminOnly, getSubscribers);

export default router;
