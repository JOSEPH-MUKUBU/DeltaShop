import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    roles: [{ type: String, enum: ["admin", "product_manager", "order_manager", "user_manager", "viewer"], default: "viewer" }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);

