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

// GET /api/admin/users/:id  (detail view)
router.get("/users/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  const [profile, appCount, jobCount] = await Promise.all([
    user.role === "candidate"
      ? CandidateProfile.findOne({ userId: req.params.id }).lean()
      : EmployerProfile.findOne({ userId: req.params.id }).lean(),
    user.role === "candidate" ? Application.countDocuments({ candidateId: req.params.id }) : 0,
    user.role === "employer" ? Job.countDocuments({ employerId: req.params.id }) : 0,
  ]);
  res.json({ user: user.toJSON(), profile, appCount, jobCount });
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

// GET /api/admin/employers  (with job counts)
router.get("/employers", async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const filter = { role: "employer" };
  if (search) filter.$or = [
    { name: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
  ];
  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);
  const userIds = users.map(u => u._id);
  const [profiles, jobCounts] = await Promise.all([
    EmployerProfile.find({ userId: { $in: userIds } }).lean(),
    Job.aggregate([
      { $match: { employerId: { $in: userIds } } },
      { $group: { _id: "$employerId", total: { $sum: 1 }, active: { $sum: { $cond: ["$isActive", 1, 0] } } } },
    ]),
  ]);
  const profileMap = Object.fromEntries(profiles.map(p => [String(p.userId), p]));
  const jobMap = Object.fromEntries(jobCounts.map(j => [String(j._id), { total: j.total, active: j.active }]));
  const employers = users.map(u => ({
    ...u.toJSON(),
    profile: profileMap[String(u._id)] || null,
    jobCount: jobMap[String(u._id)]?.total || 0,
    activeJobCount: jobMap[String(u._id)]?.active || 0,
  }));
  res.json({ employers, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
});

// GET /api/admin/employers/:id/jobs
router.get("/employers/:id/jobs", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const [jobs, total] = await Promise.all([
    Job.find({ employerId: req.params.id }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Job.countDocuments({ employerId: req.params.id }),
  ]);
  res.json({ jobs: jobs.map(j => j.toJSON()), total });
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
    { location: { $regex: search, $options: "i" } },
  ];
  const skip = (Number(page) - 1) * Number(limit);
  const [jobs, total] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Job.countDocuments(filter),
  ]);
  // enrich with applicant count
  const jobIds = jobs.map(j => j._id);
  const appCounts = await Application.aggregate([
    { $match: { jobId: { $in: jobIds } } },
    { $group: { _id: "$jobId", count: { $sum: 1 } } },
  ]);
  const appMap = Object.fromEntries(appCounts.map(a => [String(a._id), a.count]));
  res.json({
    jobs: jobs.map(j => ({ ...j.toJSON(), applicantCount: appMap[String(j._id)] || 0 })),
    total, page: Number(page), totalPages: Math.ceil(total / Number(limit)),
  });
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

// PUT /api/admin/jobs/:id/toggle-active
router.put("/jobs/:id/toggle-active", async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: "Job not found" });
  job.isActive = !job.isActive;
  await job.save();
  res.json(job.toJSON());
});

// DELETE /api/admin/jobs/:id
router.delete("/jobs/:id", async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.id);
  if (!job) return res.status(404).json({ message: "Job not found" });
  await Application.deleteMany({ jobId: req.params.id });
  res.json({ success: true, message: "Job deleted" });
});

// GET /api/admin/applications  (with search + status filter)
router.get("/applications", async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  let pipeline = [];

  pipeline.push({
    $lookup: { from: "jobs", localField: "jobId", foreignField: "_id", as: "jobId" },
  });
  pipeline.push({ $unwind: { path: "$jobId", preserveNullAndEmptyArrays: true } });
  pipeline.push({
    $lookup: { from: "users", localField: "candidateId", foreignField: "_id", as: "candidateId" },
  });
  pipeline.push({ $unwind: { path: "$candidateId", preserveNullAndEmptyArrays: true } });

  const matchStage = {};
  if (status && status !== "all") matchStage.status = status;
  if (search) {
    matchStage.$or = [
      { "candidateId.name": { $regex: search, $options: "i" } },
      { "candidateId.email": { $regex: search, $options: "i" } },
      { "jobId.title": { $regex: search, $options: "i" } },
      { "jobId.company": { $regex: search, $options: "i" } },
    ];
  }
  if (Object.keys(matchStage).length) pipeline.push({ $match: matchStage });

  const countPipeline = [...pipeline, { $count: "total" }];
  pipeline.push({ $sort: { createdAt: -1 } });
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: Number(limit) });
  pipeline.push({
    $project: {
      status: 1, createdAt: 1, coverLetter: 1,
      "jobId._id": 1, "jobId.title": 1, "jobId.company": 1,
      "candidateId._id": 1, "candidateId.name": 1, "candidateId.email": 1,
    },
  });

  const [applications, countResult] = await Promise.all([
    Application.aggregate(pipeline),
    Application.aggregate(countPipeline),
  ]);
  const total = countResult[0]?.total || 0;
  res.json({ applications, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
});

export default router;
