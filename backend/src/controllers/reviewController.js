import asyncHandler from "express-async-handler";
import { Review } from "../models/Review.js";

export const listPublicReviews = asyncHandler(async (req, res) => {
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit || "3", 10)));

  const reviews = await Review.find({ isPublished: true })
    .sort({ featuredOrder: -1, createdAt: -1 })
    .limit(limit);

  const total = await Review.countDocuments({ isPublished: true });
  const avg = await Review.aggregate([
    { $match: { isPublished: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" }
      }
    }
  ]);

  res.json({
    reviews,
    total,
    averageRating: Number(avg?.[0]?.averageRating || 0)
  });
});
