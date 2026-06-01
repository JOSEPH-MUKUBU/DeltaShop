import mongoose from "mongoose";

export async function connectDb() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI manquant (définis-le dans .env)");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
}

