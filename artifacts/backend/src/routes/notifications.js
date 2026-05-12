import { Router } from "express";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// GET /api/notifications — list for current user (latest 30)
router.get("/", protect, async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();
  const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
  res.json({ notifications, unreadCount });
});

// PATCH /api/notifications/read-all — mark all as read
router.patch("/read-all", protect, async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true });
});

// PATCH /api/notifications/:id/read — mark one as read
router.patch("/:id/read", protect, async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isRead: true }
  );
  res.json({ success: true });
});

// DELETE /api/notifications — clear all notifications for user
router.delete("/", protect, async (req, res) => {
  await Notification.deleteMany({ userId: req.user._id });
  res.json({ success: true });
});

export default router;
