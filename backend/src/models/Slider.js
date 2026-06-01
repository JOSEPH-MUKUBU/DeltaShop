import mongoose from "mongoose";

const sliderSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "" },
    image: { type: String, required: true },
    link: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Slider = mongoose.model("Slider", sliderSchema);

