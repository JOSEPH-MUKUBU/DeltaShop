import asyncHandler from "express-async-handler";
import { Slider } from "../models/Slider.js";

export const listSlidersPublic = asyncHandler(async (req, res) => {
  const sliders = await Slider.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
  res.json({ sliders });
});

export const listSlidersAdmin = asyncHandler(async (req, res) => {
  const sliders = await Slider.find({}).sort({ order: 1, createdAt: -1 });
  res.json({ sliders });
});

export const createSlider = asyncHandler(async (req, res) => {
  const { title, subtitle, image, link, isActive, order } = req.body || {};
  if (!title || !image) {
    res.status(400);
    throw new Error("Champs requis: title, image");
  }

  const slider = await Slider.create({
    title: String(title).trim(),
    subtitle: String(subtitle || ""),
    image: String(image),
    link: String(link || ""),
    isActive: isActive == null ? true : Boolean(isActive),
    order: order == null ? 0 : Number(order)
  });

  res.status(201).json({ slider });
});

export const updateSlider = asyncHandler(async (req, res) => {
  const slider = await Slider.findById(req.params.id);
  if (!slider) {
    res.status(404);
    throw new Error("Slider introuvable");
  }

  const { title, subtitle, image, link, isActive, order } = req.body || {};

  if (title != null) slider.title = String(title).trim();
  if (subtitle != null) slider.subtitle = String(subtitle);
  if (image != null) slider.image = String(image);
  if (link != null) slider.link = String(link);
  if (isActive != null) slider.isActive = Boolean(isActive);
  if (order != null) slider.order = Number(order);

  await slider.save();
  res.json({ slider });
});

export const deleteSlider = asyncHandler(async (req, res) => {
  const slider = await Slider.findById(req.params.id);
  if (!slider) {
    res.status(404);
    throw new Error("Slider introuvable");
  }
  await slider.deleteOne();
  res.json({ ok: true });
});

