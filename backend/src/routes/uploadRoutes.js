import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { adminOnly, protect } from "../middleware/auth.js";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..", "..");
const imagesDir = path.join(rootDir, "images");

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, imagesDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname) || ".jpg";
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, "-").toLowerCase();
    cb(null, `${Date.now()}-${base}${ext}`);
  }
});

const upload = multer({ storage });

router.post("/", protect, adminOnly, upload.single("image"), (req, res) => {
  const fileName = path.basename(req.file.path);
  const url = `/static/${fileName}`;
  res.status(201).json({ url });
});

export default router;

