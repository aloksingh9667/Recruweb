import mongoose from "mongoose";
import { logger } from "./logger.js";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  console.error("DEBUG MONGODB_URI scheme:", uri ? uri.substring(0, 30) : "UNDEFINED/EMPTY");
  if (!uri) throw new Error("MONGODB_URI env var required");
  await mongoose.connect(uri);
  logger.info("MongoDB connected");
}
