import path from "path";
import fs from "fs";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

import { connectDb } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import sliderRoutes from "./routes/sliderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import { errorHandler, notFound } from "./middleware/error.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..", "..");

dotenv.config({ path: path.join(rootDir, ".env") });

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

const allowOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
app.use(
  cors({
    origin: allowOrigin,
    credentials: true
  })
);

const imagesDir = path.join(rootDir, "images");

if (fs.existsSync(imagesDir)) {
  app.use("/static", express.static(imagesDir));
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/sliders", sliderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);

// Production: servir le front buildé
const distDir = path.join(rootDir, "frontend", "dist");
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.method !== "GET") return next();
    if (req.path.startsWith("/api")) return next();
    return res.sendFile(path.join(distDir, "index.html"));
  });
}

app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT || 5000);

await connectDb();
app.listen(port, () => {
  console.log(`API prête sur http://localhost:${port}`);
});

