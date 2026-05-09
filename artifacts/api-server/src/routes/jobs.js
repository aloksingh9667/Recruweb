import { Router } from "express";
import Job from "../models/Job.js";
import EmployerProfile from "../models/EmployerProfile.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = Router();

// GET /api/jobs — public
router.get("/", async (req, res) => {
  const { search, location, category, employmentType, page = 1, limit = 10 } = req.query;
  const filter = { isActive: true };
  if (search) filter.$or = [
    { title: { $regex: search, $options: "i" } },
    { company: { $regex: search, $options: "i" } },
    { description: { $regex: search, $options: "i" } },
  ];
  if (location) filter.location = { $regex: location, $options: "i" };
  if (category) filter.category = category;
  if (employmentType) filter.employmentType = employmentType;

  const skip = (Number(page) - 1) * Number(limit);
  const [jobs, total] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Job.countDocuments(filter),
  ]);

  res.json({
    jobs: jobs.map((j) => j.toJSON()),
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
  });
});

// GET /api/jobs/stats/summary — public
router.get("/stats/summary", async (req, res) => {
  const [totalJobs, byCategory, byType, recentJobs] = await Promise.all([
    Job.countDocuments({ isActive: true }),
    Job.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { category: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]),
    Job.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$employmentType", count: { $sum: 1 } } },
      { $project: { type: "$_id", count: 1, _id: 0 } },
    ]),
    Job.find({ isActive: true }).sort({ createdAt: -1 }).limit(5),
  ]);

  res.json({ totalJobs, byCategory, byType, recentJobs: recentJobs.map((j) => j.toJSON()) });
});

// GET /api/jobs/employer/my — employer only
router.get("/employer/my", protect, requireRole("employer"), async (req, res) => {
  const jobs = await Job.find({ employerId: req.user._id }).sort({ createdAt: -1 });
  res.json({ jobs: jobs.map((j) => j.toJSON()), total: jobs.length });
});

// GET /api/jobs/:jobId
router.get("/:jobId", async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) return res.status(404).json({ message: "Job not found" });
  res.json(job.toJSON());
});

// POST /api/jobs — employer only
router.post("/", protect, requireRole("employer"), async (req, res) => {
  const { title, location, category, employmentType, description, requirements, salaryRange, skills } = req.body;
  const profile = await EmployerProfile.findOne({ userId: req.user._id });
  const company = profile?.company || req.user.name;

  const job = await Job.create({
    title, location, category, employmentType, description,
    requirements, salaryRange, skills, company,
    employerId: req.user._id,
  });
  res.status(201).json(job.toJSON());
});

// PUT /api/jobs/:jobId — employer only (own job)
router.put("/:jobId", protect, requireRole("employer"), async (req, res) => {
  const job = await Job.findOne({ _id: req.params.jobId, employerId: req.user._id });
  if (!job) return res.status(404).json({ message: "Job not found" });

  Object.assign(job, req.body);
  await job.save();
  res.json(job.toJSON());
});

// DELETE /api/jobs/:jobId — employer only (own job)
router.delete("/:jobId", protect, requireRole("employer"), async (req, res) => {
  const job = await Job.findOneAndDelete({ _id: req.params.jobId, employerId: req.user._id });
  if (!job) return res.status(404).json({ message: "Job not found" });
  res.json({ success: true, message: "Job deleted" });
});

export default router;
