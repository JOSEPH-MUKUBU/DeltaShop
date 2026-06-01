import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { User } from "../models/User.js";

export const protect = asyncHandler(async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Non autorisé (token manquant)");
  }

  const token = auth.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select("-passwordHash");
  if (!user) {
    res.status(401);
    throw new Error("Non autorisé (utilisateur introuvable)");
  }

  if (!user.isActive) {
    res.status(401);
    throw new Error("Compte désactivé");
  }

  req.user = user;
  next();
});

export function adminOnly(req, res, next) {
  if (!req.user?.isAdmin && !req.user?.roles?.includes("admin")) {
    res.status(403);
    throw new Error("Accès admin requis");
  }
  next();
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const userRoles = req.user?.roles || [];
    const isAdmin = req.user?.isAdmin || userRoles.includes("admin");
    
    if (isAdmin || allowedRoles.some(role => userRoles.includes(role))) {
      return next();
    }
    
    res.status(403);
    throw new Error(`Accès requis: ${allowedRoles.join(", ")}`);
  };
}

export function requireAnyRole(req, res, next) {
  const userRoles = req.user?.roles || [];
  const isAdmin = req.user?.isAdmin;
  
  if (isAdmin || userRoles.length > 0) {
    return next();
  }
  
  res.status(403);
  throw new Error("Accès staff requis");
}

