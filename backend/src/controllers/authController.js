import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { generateToken } from "../utils/token.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Champs requis: name, email, password");
  }

  const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (existing) {
    res.status(409);
    throw new Error("Email déjà utilisé");
  }

  const passwordHash = await bcrypt.hash(String(password), 10);
  const user = await User.create({
    name: String(name).trim(),
    email: String(email).toLowerCase().trim(),
    passwordHash,
    isAdmin: false
  });

  res.status(201).json({
    user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
    token: generateToken(user._id)
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    res.status(400);
    throw new Error("Champs requis: email, password");
  }

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (!user) {
    res.status(401);
    throw new Error("Identifiants invalides");
  }

  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) {
    res.status(401);
    throw new Error("Identifiants invalides");
  }

  res.json({
    user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
    token: generateToken(user._id)
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

