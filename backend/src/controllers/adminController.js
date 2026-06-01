import asyncHandler from "express-async-handler";
import { User } from "../models/User.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { Category } from "../models/Category.js";

function convertToCSV(data, headers) {
  if (!data || data.length === 0) return "";
  const headerRow = headers.map(h => `"${h.label}"`).join(";");
  const rows = data.map(row => {
    return headers.map(h => {
      const value = h.key.includes('.') 
        ? h.key.split('.').reduce((obj, k) => obj?.[k], row) 
        : row[h.key];
      const formatted = value == null ? "" : String(value).replace(/"/g, '""');
      return `"${formatted}"`;
    }).join(";");
  });
  return [headerRow, ...rows].join("\n");
}

export const getSummary = asyncHandler(async (req, res) => {
  const [usersCount, productsCount, orders, revenueAgg, categoriesCount] = await Promise.all([
    User.countDocuments({}),
    Product.countDocuments({}),
    Order.find({}).sort({ createdAt: -1 }).limit(5).populate("user", "name email"),
    Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          count: { $sum: 1 }
        }
      }
    ]),
    Category.countDocuments({})
  ]);

  const revenue = revenueAgg[0] || { totalRevenue: 0, count: 0 };

  res.json({
    usersCount,
    productsCount,
    ordersCount: revenue.count,
    revenue: revenue.totalRevenue,
    categoriesCount,
    recentOrders: orders
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));
  const sortBy = req.query.sortBy || "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
  const search = String(req.query.search || "").trim();
  const isActive = req.query.isActive;
  const hasRole = req.query.hasRole;

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (hasRole) filter.roles = { $in: [hasRole] };

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .sort({ [sortBy]: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit)
    .select("-passwordHash");

  res.json({ users, page, pages: Math.ceil(total / limit), total });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("Utilisateur introuvable");
  }

  const { name, email, isAdmin, roles, isActive } = req.body || {};
  if (name != null) user.name = String(name).trim();
  if (email != null) user.email = String(email).toLowerCase().trim();
  if (isAdmin != null) user.isAdmin = Boolean(isAdmin);
  if (roles != null) user.roles = Array.isArray(roles) ? roles : [roles];
  if (isActive != null) user.isActive = Boolean(isActive);

  await user.save();
  res.json({ user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (String(id) === String(req.user._id)) {
    res.status(400);
    throw new Error("Impossible de supprimer votre propre compte admin");
  }
  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("Utilisateur introuvable");
  }
  await user.deleteOne();
  res.json({ ok: true });
});

export const exportUsersCSV = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-passwordHash").sort({ createdAt: -1 });
  
  const headers = [
    { key: "_id", label: "ID" },
    { key: "name", label: "Nom" },
    { key: "email", label: "Email" },
    { key: "isAdmin", label: "Admin" },
    { key: "roles", label: "Rôles" },
    { key: "isActive", label: "Actif" },
    { key: "createdAt", label: "Créé le" }
  ];

  const csv = convertToCSV(users.map(u => ({
    ...u.toObject(),
    roles: u.roles?.join(", ") || "",
    isAdmin: u.isAdmin ? "Oui" : "Non",
    isActive: u.isActive ? "Oui" : "Non"
  })), headers);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=users.csv");
  res.send("\uFEFF" + csv);
});

export const listProductsAdmin = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));
  const sortBy = req.query.sortBy || "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
  const search = String(req.query.search || "").trim();
  const category = String(req.query.category || "").trim();
  const minPrice = parseFloat(req.query.minPrice || "0");
  const maxPrice = parseFloat(req.query.maxPrice || "Infinity");
  const inStock = req.query.inStock;
  const isFeatured = req.query.isFeatured;

  const filter = {};
  if (search) filter.$text = { $search: search };
  if (category) filter.category = category;
  if (!isNaN(minPrice) || !isNaN(maxPrice)) {
    filter.price = {};
    if (!isNaN(minPrice)) filter.price.$gte = minPrice;
    if (!isNaN(maxPrice) && maxPrice !== Infinity) filter.price.$lte = maxPrice;
  }
  if (inStock === "true") filter.countInStock = { $gt: 0 };
  if (inStock === "false") filter.countInStock = { $lte: 0 };
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort({ [sortBy]: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({ products, page, pages: Math.ceil(total / limit), total });
});

export const exportProductsCSV = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ createdAt: -1 });
  
  const headers = [
    { key: "_id", label: "ID" },
    { key: "name", label: "Nom" },
    { key: "slug", label: "Slug" },
    { key: "description", label: "Description" },
    { key: "price", label: "Prix" },
    { key: "category", label: "Catégorie" },
    { key: "brand", label: "Marque" },
    { key: "countInStock", label: "Stock" },
    { key: "rating", label: "Note" },
    { key: "numReviews", label: "Avis" },
    { key: "isFeatured", label: "Mis en avant" },
    { key: "createdAt", label: "Créé le" }
  ];

  const csv = convertToCSV(products.map(p => ({
    ...p.toObject(),
    isFeatured: p.isFeatured ? "Oui" : "Non",
    description: p.description?.replace(/\n/g, " ") || ""
  })), headers);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=products.csv");
  res.send("\uFEFF" + csv);
});

export const listOrdersAdmin = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));
  const sortBy = req.query.sortBy || "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
  const status = req.query.status;
  const minPrice = parseFloat(req.query.minPrice || "0");
  const maxPrice = parseFloat(req.query.maxPrice || "Infinity");
  const dateFrom = req.query.dateFrom;
  const dateTo = req.query.dateTo;

  const filter = {};
  if (status) filter.status = status;
  if (!isNaN(minPrice) || !isNaN(maxPrice)) {
    filter.totalPrice = {};
    if (!isNaN(minPrice)) filter.totalPrice.$gte = minPrice;
    if (!isNaN(maxPrice) && maxPrice !== Infinity) filter.totalPrice.$lte = maxPrice;
  }
  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filter.createdAt.$lte = new Date(dateTo);
  }

  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .sort({ [sortBy]: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("user", "name email");

  res.json({ orders, page, pages: Math.ceil(total / limit), total });
});

export const exportOrdersCSV = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 }).populate("user", "name email");
  
  const headers = [
    { key: "_id", label: "ID" },
    { key: "user.name", label: "Client" },
    { key: "user.email", label: "Email" },
    { key: "totalPrice", label: "Total" },
    { key: "status", label: "Statut" },
    { key: "shippingAddress.city", label: "Ville" },
    { key: "shippingAddress.country", label: "Pays" },
    { key: "createdAt", label: "Créée le" }
  ];

  const csv = convertToCSV(orders, headers);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=orders.csv");
  res.send("\uFEFF" + csv);
});

