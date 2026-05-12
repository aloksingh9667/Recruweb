import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type:      { type: String, enum: ["application_received", "status_changed"], required: true },
    title:     { type: String, required: true },
    message:   { type: String, required: true },
    isRead:    { type: Boolean, default: false },
    metadata:  { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
