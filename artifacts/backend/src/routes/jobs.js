import { Router } from "express";
import Job from "../models/Job.js";
import EmployerProfile from "../models/EmployerProfile.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = Router();

const JOB_FIELDS = [
  "title", "location", "category", "employmentType", "description",
  "requirements", "salaryRange", "skills", "experienceRequired",
  "openings", "industry", "department", "roleCategory", "role",
  "education", "shiftTiming", "workingDays", "keyResponsibilities",
  "companyDescription", "companyWebsite", "companySize", "companyAddress",
  "companyRating", "companyReviews", "perks", "screeningQuestions",
  "contactEmail", "contactPhone", "isActive",
];

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

// GET /api/jobs/role-counts — public, returns live counts per search keyword
router.get("/role-counts", async (req, res) => {
  const roles = [
    "Full Stack Developer", "Front End Developer", "Data Scientist",
    "Mobile", "DevOps Engineer", "Product Manager", "Technical Lead", "Engineering Manager",
  ];
  const counts = await Promise.all(
    roles.map(role =>
      Job.countDocuments({
        isActive: true,
        $or: [
          { title: { $regex: role, $options: "i" } },
          { description: { $regex: role, $options: "i" } },
        ],
      })
    )
  );
  const result = {};
  roles.forEach((r, i) => { result[r] = counts[i]; });
  res.json(result);
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

// GET /api/jobs/saved/my — candidate only
router.get("/saved/my", protect, requireRole("candidate"), async (req, res) => {
  const jobs = await Job.find({ savedBy: req.user._id, isActive: true }).sort({ createdAt: -1 });
  res.json({ jobs: jobs.map((j) => j.toJSON()), total: jobs.length });
});

// GET /api/jobs/:jobId — with employer profile enrichment
router.get("/:jobId", async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) return res.status(404).json({ message: "Job not found" });

  const jobData = job.toJSON();

  const empProfile = await EmployerProfile.findOne({ userId: job.employerId });
  if (empProfile) {
    jobData.employer = {
      company: empProfile.company || jobData.company,
      industry: empProfile.industry,
      companySize: empProfile.size,
      website: empProfile.website,
      description: empProfile.description,
      location: empProfile.location,
    };
  }

  res.json(jobData);
});

// POST /api/jobs — employer only
router.post("/", protect, requireRole("employer"), async (req, res) => {
  const profile = await EmployerProfile.findOne({ userId: req.user._id });
  const company = req.body.company || profile?.company || req.user.name;

  const jobData = { company, employerId: req.user._id };
  JOB_FIELDS.forEach(f => { if (req.body[f] !== undefined) jobData[f] = req.body[f]; });

  const job = await Job.create(jobData);
  res.status(201).json(job.toJSON());
});

// PUT /api/jobs/:jobId — employer only (own job)
router.put("/:jobId", protect, requireRole("employer"), async (req, res) => {
  const job = await Job.findOne({ _id: req.params.jobId, employerId: req.user._id });
  if (!job) return res.status(404).json({ message: "Job not found" });

  JOB_FIELDS.forEach(f => { if (req.body[f] !== undefined) job[f] = req.body[f]; });
  if (req.body.company) job.company = req.body.company;
  await job.save();
  res.json(job.toJSON());
});

// DELETE /api/jobs/:jobId — employer only (own job)
router.delete("/:jobId", protect, requireRole("employer"), async (req, res) => {
  const job = await Job.findOneAndDelete({ _id: req.params.jobId, employerId: req.user._id });
  if (!job) return res.status(404).json({ message: "Job not found" });
  res.json({ success: true, message: "Job deleted" });
});

// POST /api/jobs/:jobId/save — candidate only
router.post("/:jobId/save", protect, requireRole("candidate"), async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) return res.status(404).json({ message: "Job not found" });
  const alreadySaved = job.savedBy.some(id => id.toString() === req.user._id.toString());
  if (!alreadySaved) {
    job.savedBy.push(req.user._id);
    await job.save();
  }
  res.json({ success: true, saved: true });
});

// DELETE /api/jobs/:jobId/save — candidate only
router.delete("/:jobId/save", protect, requireRole("candidate"), async (req, res) => {
  await Job.findByIdAndUpdate(req.params.jobId, { $pull: { savedBy: req.user._id } });
  res.json({ success: true, saved: false });
});

export default router;
