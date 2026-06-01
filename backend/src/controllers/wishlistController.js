import asyncHandler from "express-async-handler";
import { Wishlist } from "../models/Wishlist.js";
import { Product } from "../models/Product.js";

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req, res) => {
  const wishlistItems = await Wishlist.find({ user: req.user._id })
    .populate("product", "name slug images price countInStock brand")
    .sort({ addedAt: -1 });

  // Nettoie les entrées orphelines (produit supprimé) pour éviter les erreurs frontend.
  const orphanIds = wishlistItems.filter((item) => !item.product).map((item) => item._id);
  if (orphanIds.length > 0) {
    await Wishlist.deleteMany({ _id: { $in: orphanIds } });
  }

  const validItems = wishlistItems.filter((item) => Boolean(item.product));
  res.json({ wishlist: validItems, count: validItems.length });
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error("ID du produit requis");
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Produit non trouvé");
  }

  // Check if already in wishlist
  const existingItem = await Wishlist.findOne({
    user: req.user._id,
    product: productId
  });

  if (existingItem) {
    res.status(409);
    throw new Error("Produit déjà dans la liste de souhaits");
  }

  const wishlistItem = await Wishlist.create({
    user: req.user._id,
    product: productId
  });

  // Populate and return
  await wishlistItem.populate("product", "name slug images price countInStock brand");

  res.status(201).json({
    message: "Produit ajouté à la liste de souhaits",
    wishlistItem
  });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlistItem = await Wishlist.findOneAndDelete({
    user: req.user._id,
    product: productId
  });

  if (!wishlistItem) {
    res.status(404);
    throw new Error("Produit non trouvé dans la liste de souhaits");
  }

  res.json({ message: "Produit retiré de la liste de souhaits" });
});

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
export const checkWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlistItem = await Wishlist.findOne({
    user: req.user._id,
    product: productId
  });

  res.json({ isInWishlist: !!wishlistItem });
});

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
export const clearWishlist = asyncHandler(async (req, res) => {
  await Wishlist.deleteMany({ user: req.user._id });
  res.json({ message: "Liste de souhaits vidée" });
});
