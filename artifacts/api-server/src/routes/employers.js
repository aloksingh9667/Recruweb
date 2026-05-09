import { Router } from "express";
import EmployerProfile from "../models/EmployerProfile.js";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = Router();

// GET /api/employers/profile
router.get("/profile", protect, requireRole("employer"), async (req, res) => {
  let profile = await EmployerProfile.findOne({ userId: req.user._id });
  if (!profile) profile = await EmployerProfile.create({ userId: req.user._id, company: req.user.name });

  const obj = profile.toJSON();
  obj.name = req.user.name;
  obj.email = req.user.email;
  res.json(obj);
});

// PUT /api/employers/profile
router.put("/profile", protect, requireRole("employer"), async (req, res) => {
  const { company, industry, companySize, location, website, description } = req.body;
  const profile = await EmployerProfile.findOneAndUpdate(
    { userId: req.user._id },
    { company, industry, companySize, location, website, description },
    { new: true, upsert: true }
  );

  const obj = profile.toJSON();
  obj.name = req.user.name;
  obj.email = req.user.email;
  res.json(obj);
});

// GET /api/employers/dashboard
router.get("/dashboard", protect, requireRole("employer"), async (req, res) => {
  const myJobs = await Job.find({ employerId: req.user._id });
  const jobIds = myJobs.map((j) => j._id);

  const [totalApplications, statusBreakdown, recentApplications] = await Promise.all([
    Application.countDocuments({ jobId: { $in: jobIds } }),
    Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Application.find({ jobId: { $in: jobIds } })
      .populate("jobId")
      .populate("candidateId", "name email")
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  const statusMap = {};
  statusBreakdown.forEach((s) => (statusMap[s._id] = s.count));

  const recentMapped = recentApplications.map((a) => {
    const obj = a.toJSON();
    if (a.jobId) obj.job = a.jobId.toJSON();
    if (a.candidateId) obj.candidate = { name: a.candidateId.name, email: a.candidateId.email };
    return obj;
  });

  res.json({
    totalJobs: myJobs.length,
    activeJobs: myJobs.filter((j) => j.isActive).length,
    totalApplications,
    pendingApplications: statusMap["pending"] || 0,
    shortlistedApplications: statusMap["shortlisted"] || 0,
    recentApplications: recentMapped,
  });
});

export default router;
