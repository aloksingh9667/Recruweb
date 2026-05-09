import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import CandidateProfile from "../models/CandidateProfile.js";
import EmployerProfile from "../models/EmployerProfile.js";
import { protect } from "../middleware/auth.js";

const router = Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password, role, company } = req.body;
  if (!name || !email || !password || !role)
    return res.status(400).json({ message: "All fields required" });

  const existing = await User.findOne({ email });
  if (existing)
    return res.status(400).json({ message: "Email already registered" });

  const user = await User.create({ name, email, password, role, company: company || undefined });

  if (role === "candidate") {
    await CandidateProfile.create({ userId: user._id });
  } else if (role === "employer") {
    await EmployerProfile.create({ userId: user._id, company: company || name });
  }

  const token = signToken(user._id);
  res.status(201).json({ token, user: user.toJSON() });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken(user._id);
  res.json({ token, user: user.toJSON() });
});

// GET /api/auth/me
router.get("/me", protect, (req, res) => {
  res.json(req.user.toJSON());
});

export default router;
