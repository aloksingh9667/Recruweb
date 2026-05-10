import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import CandidateProfile from "../models/CandidateProfile.js";
import EmployerProfile from "../models/EmployerProfile.js";
import { protect } from "../middleware/auth.js";

const router = Router();

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, phone, password, role, company, fieldOfInterest, experienceLevel, currentLocation } = req.body;
  if (!name || !email || !password || !role)
    return res.status(400).json({ message: "All fields required" });
  if (!["candidate", "employer"].includes(role))
    return res.status(400).json({ message: "Role must be candidate or employer" });

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: "Email already registered" });

  const user = await User.create({
    name, email, password, role,
    phone: phone || undefined,
    company: company || undefined,
    fieldOfInterest: fieldOfInterest || undefined,
    experienceLevel: experienceLevel || undefined,
    currentLocation: currentLocation || undefined,
  });

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
  const { email, phone, password, role } = req.body;

  if (!password) return res.status(400).json({ message: "Password is required" });

  let user;
  if (phone) {
    user = await User.findOne({ phone });
    if (!user) return res.status(401).json({ message: "No account found with this phone number" });
  } else if (email) {
    user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
  } else {
    return res.status(400).json({ message: "Email or phone required" });
  }

  if (!(await user.comparePassword(password)))
    return res.status(401).json({ message: "Invalid credentials" });

  if (user.isBanned)
    return res.status(403).json({ message: "Account suspended. Contact support@recruweb.in" });

  // Soft role check — just warn if mismatch (don't block)
  if (role && user.role !== "admin" && user.role !== role) {
    return res.status(401).json({ message: `This account is registered as a ${user.role}. Please select the correct role.` });
  }

  const token = signToken(user._id);
  res.json({ token, user: user.toJSON() });
});

// GET /api/auth/me
router.get("/me", protect, (req, res) => res.json(req.user.toJSON()));

// PUT /api/auth/update-profile
router.put("/update-profile", protect, async (req, res) => {
  const { name, phone, currentLocation, fieldOfInterest, experienceLevel } = req.body;
  if (!name || name.trim().length < 2)
    return res.status(400).json({ message: "Name must be at least 2 characters" });

  req.user.name = name.trim();
  if (phone !== undefined) req.user.phone = phone || undefined;
  if (currentLocation !== undefined) req.user.currentLocation = currentLocation || undefined;
  if (fieldOfInterest !== undefined) req.user.fieldOfInterest = fieldOfInterest || undefined;
  if (experienceLevel !== undefined) req.user.experienceLevel = experienceLevel || undefined;
  await req.user.save();
  res.json(req.user.toJSON());
});

// PUT /api/auth/change-password
router.put("/change-password", protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: "Current and new password required" });
  if (newPassword.length < 6)
    return res.status(400).json({ message: "Password must be at least 6 characters" });

  const user = await User.findById(req.user._id);
  const valid = await user.comparePassword(currentPassword);
  if (!valid) return res.status(400).json({ message: "Current password is incorrect" });

  user.password = newPassword;
  await user.save();
  res.json({ message: "Password changed successfully" });
});

export default router;
