import asyncHandler from "express-async-handler";
import { Product } from "../models/Product.js";
import { toSlug } from "../utils/slug.js";

function isObjectIdLike(value) {
  return /^[a-fA-F0-9]{24}$/.test(String(value || ""));
}

function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const listProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const limit = Math.min(48, Math.max(1, parseInt(req.query.limit || "12", 10)));
  const q = String(req.query.q || "").trim();
  const category = String(req.query.category || "").trim();

  const filter = {};
  if (q) {
    const regex = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ name: regex }, { description: regex }, { category: regex }, { brand: regex }];
  }
  if (category) filter.category = category;

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({ products, page, pages: Math.ceil(total / limit), total });
});

export const getProduct = asyncHandler(async (req, res) => {
  const key = req.params.idOrSlug;
  const product = isObjectIdLike(key)
    ? await Product.findById(key)
    : await Product.findOne({ slug: String(key).toLowerCase() });

  if (!product) {
    res.status(404);
    throw new Error("Produit introuvable");
  }

  res.json({ product });
});

export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    images,
    brand,
    category,
    countInStock,
    isFeatured,
    featuredOrder,
    isDealOfDay,
    dealOrder
  } = req.body || {};
  if (!name || price == null) {
    res.status(400);
    throw new Error("Champs requis: name, price");
  }

  const slugBase = toSlug(name);
  let slug = slugBase;
  let i = 1;
  // Assure l'unicité
  while (await Product.exists({ slug })) {
    slug = `${slugBase}-${i++}`;
  }

  const product = await Product.create({
    name: String(name).trim(),
    slug,
    description: String(description || ""),
    price: Number(price),
    images: Array.isArray(images) ? images.map(String) : images ? [String(images)] : [],
    brand: String(brand || ""),
    category: String(category || ""),
    countInStock: countInStock == null ? 0 : Number(countInStock),
    isFeatured: Boolean(isFeatured),
    featuredOrder: featuredOrder == null ? 0 : Number(featuredOrder),
    isDealOfDay: Boolean(isDealOfDay),
    dealOrder: dealOrder == null ? 0 : Number(dealOrder)
  });

  res.status(201).json({ product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    res.status(404);
    throw new Error("Produit introuvable");
  }

  const { name, description, price, images, brand, category, countInStock, isFeatured, featuredOrder, isDealOfDay, dealOrder } =
    req.body || {};

  if (name != null) product.name = String(name).trim();
  if (description != null) product.description = String(description);
  if (price != null) product.price = Number(price);
  if (images != null) product.images = Array.isArray(images) ? images.map(String) : images ? [String(images)] : [];
  if (brand != null) product.brand = String(brand);
  if (category != null) product.category = String(category);
  if (countInStock != null) product.countInStock = Number(countInStock);
  if (isFeatured != null) product.isFeatured = Boolean(isFeatured);
  if (featuredOrder != null) product.featuredOrder = Number(featuredOrder);
  if (isDealOfDay != null) product.isDealOfDay = Boolean(isDealOfDay);
  if (dealOrder != null) product.dealOrder = Number(dealOrder);

  await product.save();
  res.json({ product });
});

export const getTrendingProducts = asyncHandler(async (req, res) => {
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit || "8", 10)));

  // For now, trending products are:
  // 1. Featured products first (isFeatured = true)
  // 2. Then by viewCount (if exists)
  // 3. Then by soldCount (if exists) 
  // 4. Finally by creation date (newest first)
  const products = await Product.find({})
    .sort({ 
      isFeatured: -1,
      featuredOrder: -1,
      viewCount: -1,
      soldCount: -1,
      createdAt: -1
    })
    .limit(limit);

  res.json({ products });
});

export const getDealsOfDay = asyncHandler(async (req, res) => {
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit || "4", 10)));

  const products = await Product.find({ isDealOfDay: true })
    .sort({
      dealOrder: -1,
      featuredOrder: -1,
      createdAt: -1
    })
    .limit(limit);

  res.json({ products });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    res.status(404);
    throw new Error("Produit introuvable");
  }
  await product.deleteOne();
  res.json({ ok: true });
});

