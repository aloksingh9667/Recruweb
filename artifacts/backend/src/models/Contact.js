import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  email:   { type: String, required: true, trim: true, lowercase: true },
  phone:   { type: String, trim: true, default: "" },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  type:    { type: String, enum: ["general","support","employer","partnership"], default: "general" },
  isRead:  { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Contact", ContactSchema);
