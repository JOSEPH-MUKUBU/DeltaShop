import asyncHandler from "express-async-handler";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

export const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body || {};

  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    res.status(400);
    throw new Error("Le panier est vide");
  }
  if (!shippingAddress?.fullName || !shippingAddress?.address || !shippingAddress?.city) {
    res.status(400);
    throw new Error("Adresse de livraison incomplète");
  }

  const productIds = orderItems.map((i) => i.product).filter(Boolean);
  const products = await Product.find({ _id: { $in: productIds } });
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const normalized = orderItems.map((i) => {
    const p = byId.get(String(i.product));
    if (!p) {
      res.status(400);
      throw new Error("Produit invalide dans le panier");
    }
    const qty = Math.max(1, Number(i.qty || 1));
    return {
      product: p._id,
      name: p.name,
      image: p.images?.[0] || "",
      price: p.price,
      qty
    };
  });

  const itemsPrice = round2(normalized.reduce((sum, i) => sum + i.price * i.qty, 0));
  const taxPrice = round2(itemsPrice * 0);
  const shippingPrice = round2(itemsPrice >= 50 ? 0 : 5.99);
  const totalPrice = round2(itemsPrice + taxPrice + shippingPrice);

  const order = await Order.create({
    user: req.user._id,
    orderItems: normalized,
    shippingAddress,
    paymentMethod: paymentMethod || "cash",
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice
  });

  res.status(201).json({ order });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ orders });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) {
    res.status(404);
    throw new Error("Commande introuvable");
  }
  if (!req.user.isAdmin && String(order.user?._id || order.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Accès interdit");
  }
  res.json({ order });
});

export const listOrdersAdmin = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 }).populate("user", "name email");
  res.json({ orders });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  const order = await Order.findById(id);
  if (!order) {
    res.status(404);
    throw new Error("Commande introuvable");
  }

  if (status) {
    order.status = String(status);
    if (status === "delivered") {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }
  }

  await order.save();
  res.json({ order });
});


