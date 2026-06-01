import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    brand: { type: String, default: "" },
    category: { type: String, default: "" },
    countInStock: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },
    isFeatured: { type: Boolean, default: false },
    featuredOrder: { type: Number, default: 0 },
    isDealOfDay: { type: Boolean, default: false },
    dealOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", category: "text", brand: "text" });

export const Product = mongoose.model("Product", productSchema);

