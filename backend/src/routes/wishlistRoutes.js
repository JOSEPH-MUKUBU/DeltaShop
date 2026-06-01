import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
  clearWishlist
} from "../controllers/wishlistController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getWishlist);
router.post("/", addToWishlist);
router.delete("/", clearWishlist);
router.delete("/:productId", removeFromWishlist);
router.get("/check/:productId", checkWishlist);

export default router;
