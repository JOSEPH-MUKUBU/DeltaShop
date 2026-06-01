import asyncHandler from "express-async-handler";
import { Category } from "../models/Category.js";
import { toSlug } from "../utils/slug.js";

export const listCategories = asyncHandler(async (req, res) => {
  const { parent, isActive, search } = req.query;
  const filter = {};

  if (parent !== undefined) filter.parent = parent || null;
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (search) filter.$text = { $search: search };

  const categories = await Category.find(filter)
    .sort({ order: 1, name: 1 })
    .populate("parent", "name slug");

  res.json({ categories });
});

export const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id).populate("parent", "name slug");

  if (!category) {
    res.status(404);
    throw new Error("Catégorie introuvable");
  }

  res.json({ category });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image, parent, order, isActive } = req.body || {};

  if (!name) {
    res.status(400);
    throw new Error("Le nom est requis");
  }

  const slugBase = toSlug(name);
  let slug = slugBase;
  let i = 1;
  while (await Category.exists({ slug })) {
    slug = `${slugBase}-${i++}`;
  }

  const category = await Category.create({
    name: String(name).trim(),
    slug,
    description: String(description || ""),
    image: String(image || ""),
    parent: parent || null,
    order: order == null ? 0 : Number(order),
    isActive: isActive == null ? true : Boolean(isActive)
  });

  res.status(201).json({ category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);

  if (!category) {
    res.status(404);
    throw new Error("Catégorie introuvable");
  }

  const { name, description, image, parent, order, isActive } = req.body || {};

  if (name != null) category.name = String(name).trim();
  if (description != null) category.description = String(description);
  if (image != null) category.image = String(image);
  if (parent !== undefined) category.parent = parent || null;
  if (order != null) category.order = Number(order);
  if (isActive != null) category.isActive = Boolean(isActive);

  await category.save();
  res.json({ category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);

  if (!category) {
    res.status(404);
    throw new Error("Catégorie introuvable");
  }

  const hasChildren = await Category.exists({ parent: id });
  if (hasChildren) {
    res.status(400);
    throw new Error("Impossible de supprimer une catégorie avec des sous-catégories");
  }

  await category.deleteOne();
  res.json({ ok: true });
});

export const getCategoryTree = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });

  const buildTree = (parentId = null) => {
    return categories
      .filter(c => String(c.parent) === String(parentId) || (parentId === null && !c.parent))
      .map(c => ({
        ...c.toObject(),
        children: buildTree(c._id)
      }));
  };

  const tree = buildTree();
  res.json({ categories: tree });
});
