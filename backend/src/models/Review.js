import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    authorName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    isPublished: { type: Boolean, default: true },
    featuredOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Review = mongoose.model("Review", reviewSchema);
