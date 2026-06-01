import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";
import { connectDb } from "../config/db.js";
import { User } from "../models/User.js";
import { Product } from "../models/Product.js";
import { Review } from "../models/Review.js";
import { sampleProducts } from "./products.js";
import { sampleReviews } from "./reviews.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..", "..", "..");
dotenv.config({ path: path.join(rootDir, ".env") });

async function run() {
  await connectDb();

  await OrderSafeCleanup();

  const adminEmail = "admin@delta.com";
  const adminPassword = "Admin123!";

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const admin = await User.findOneAndUpdate(
    { email: adminEmail },
    { name: "Admin", email: adminEmail, passwordHash, isAdmin: true },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Product.deleteMany({});
  await Product.insertMany(sampleProducts);
  await Review.deleteMany({});
  await Review.insertMany(sampleReviews);

  console.log("Seed OK");
  console.log("Admin:", adminEmail, adminPassword);
  await mongoose.disconnect();
}

async function OrderSafeCleanup() {
  // Le modèle Order peut ne pas être importé si tu l'enlèves; on évite l'échec.
  try {
    const { Order } = await import("../models/Order.js");
    await Order.deleteMany({});
  } catch (e) {
    // ignore
  }
}

run().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});

