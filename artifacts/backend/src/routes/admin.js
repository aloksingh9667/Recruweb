import { Router } from "express";
import User from "../models/User.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import CandidateProfile from "../models/CandidateProfile.js";
import EmployerProfile from "../models/EmployerProfile.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(protect, requireRole("admin"));

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  const [
    totalUsers, totalEmployers, totalCandidates,
    totalJobs, activeJobs, totalApplications,
    recentUsers, recentJobs, applicationsByStatus, jobsByCategory,
  ] = await Promise.all([
    User.countDocuments({ role: { $ne: "admin" } }),
    User.countDocuments({ role: "employer" }),
    User.countDocuments({ role: "candidate" }),
    Job.countDocuments(),
    Job.countDocuments({ isActive: true }),
    Application.countDocuments(),
    User.find({ role: { $ne: "admin" } }).sort({ createdAt: -1 }).limit(5).select("-password"),
    Job.find().sort({ createdAt: -1 }).limit(5),
    Application.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { status: "$_id", count: 1, _id: 0 } },
    ]),
    Job.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { category: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]),
  ]);

  res.json({
    totalUsers, totalEmployers, totalCandidates,
    totalJobs, activeJobs, totalApplications,
    applicationsByStatus, jobsByCategory,
    recentUsers: recentUsers.map(u => u.toJSON()),
    recentJobs: recentJobs.map(j => j.toJSON()),
  });
});

// GET /api/admin/users
router.get("/users", async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const filter = { role: { $ne: "admin" } };
  if (role && role !== "all") filter.role = role;
  if (search) filter.$or = [
    { name: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
  ];
  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);
  res.json({ users: users.map(u => u.toJSON()), total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
});

// PUT /api/admin/users/:id/toggle-ban
router.put("/users/:id/toggle-ban", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.isBanned = !user.isBanned;
  await user.save();
  res.json(user.toJSON());
});

// DELETE /api/admin/users/:id
router.delete("/users/:id", async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  await Promise.all([
    CandidateProfile.deleteOne({ userId: req.params.id }),
    EmployerProfile.deleteOne({ userId: req.params.id }),
    Application.deleteMany({ candidateId: req.params.id }),
    Job.deleteMany({ employerId: req.params.id }),
  ]);
  res.json({ success: true, message: "User deleted" });
});

// GET /api/admin/jobs
router.get("/jobs", async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status === "active") filter.isActive = true;
  else if (status === "inactive") filter.isActive = false;
  else if (status === "pending") filter.adminStatus = "pending";
  else if (status === "rejected") filter.adminStatus = "rejected";
  if (search) filter.$or = [
    { title: { $regex: search, $options: "i" } },
    { company: { $regex: search, $options: "i" } },
  ];
  const skip = (Number(page) - 1) * Number(limit);
  const [jobs, total] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Job.countDocuments(filter),
  ]);
  res.json({ jobs: jobs.map(j => j.toJSON()), total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
});

// PUT /api/admin/jobs/:id/approve
router.put("/jobs/:id/approve", async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, { adminStatus: "approved", isActive: true }, { new: true });
  if (!job) return res.status(404).json({ message: "Job not found" });
  res.json(job.toJSON());
});

// PUT /api/admin/jobs/:id/reject
router.put("/jobs/:id/reject", async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, { adminStatus: "rejected", isActive: false }, { new: true });
  if (!job) return res.status(404).json({ message: "Job not found" });
  res.json(job.toJSON());
});

// DELETE /api/admin/jobs/:id
router.delete("/jobs/:id", async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.id);
  if (!job) return res.status(404).json({ message: "Job not found" });
  await Application.deleteMany({ jobId: req.params.id });
  res.json({ success: true, message: "Job deleted" });
});

// GET /api/admin/applications
router.get("/applications", async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const [applications, total] = await Promise.all([
    Application.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
      .populate("jobId", "title company")
      .populate("candidateId", "name email"),
    Application.countDocuments(),
  ]);
  res.json({ applications: applications.map(a => a.toJSON()), total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
});

export default router;
