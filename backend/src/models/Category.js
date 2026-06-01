import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

categorySchema.index({ name: "text", description: "text" });

export const Category = mongoose.model("Category", categorySchema);
