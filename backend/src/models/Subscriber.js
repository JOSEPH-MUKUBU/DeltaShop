import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  source: {
    type: String,
    default: "website"
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
subscriberSchema.index({ email: 1 });
subscriberSchema.index({ isActive: 1 });

export const Subscriber = mongoose.model("Subscriber", subscriberSchema);
