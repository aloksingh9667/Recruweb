import { Router } from "express";
import Contact from "../models/Contact.js";
import Subscriber from "../models/Subscriber.js";

const router = Router();

// POST /api/contact
router.post("/contact", async (req, res) => {
  const { name, email, phone, subject, message, type } = req.body;
  if (!name || !email || !subject || !message)
    return res.status(400).json({ message: "name, email, subject and message are required" });
  const contact = await Contact.create({ name, email, phone, subject, message, type: type || "general" });
  res.status(201).json({ success: true, id: contact._id });
});

// POST /api/subscribe
router.post("/subscribe", async (req, res) => {
  const { email, source } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });
  try {
    await Subscriber.create({ email, source: source || "footer" });
    res.status(201).json({ success: true, message: "Subscribed successfully" });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: "Already subscribed" });
    throw e;
  }
});

export default router;
