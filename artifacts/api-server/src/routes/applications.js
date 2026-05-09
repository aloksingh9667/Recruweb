import { Router } from "express";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import CandidateProfile from "../models/CandidateProfile.js";
import { protect, requireRole } from "../middleware/auth.js";
import { getSignedResumeUrl } from "../lib/cloudinary.js";

const router = Router();

// POST /api/applications — candidate only
router.post("/", protect, requireRole("candidate"), async (req, res) => {
  const { jobId, coverLetter } = req.body;
  if (!jobId) return res.status(400).json({ message: "jobId required" });

  const job = await Job.findById(jobId);
  if (!job || !job.isActive) return res.status(404).json({ message: "Job not found" });

  const existing = await Application.findOne({ jobId, candidateId: req.user._id });
  if (existing) return res.status(400).json({ message: "Already applied to this job" });

  const application = await Application.create({
    jobId,
    candidateId: req.user._id,
    coverLetter,
  });

  await Job.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } });

  res.status(201).json(application.toJSON());
});

// GET /api/applications/my — candidate only
router.get("/my", protect, requireRole("candidate"), async (req, res) => {
  const applications = await Application.find({ candidateId: req.user._id })
    .populate("jobId")
    .sort({ createdAt: -1 });

  const result = applications.map((a) => {
    const obj = a.toJSON();
    if (a.jobId) obj.job = a.jobId.toJSON();
    return obj;
  });

  res.json({ applications: result, total: result.length });
});

// GET /api/applications/job/:jobId — employer only (must own job)
router.get("/job/:jobId", protect, requireRole("employer"), async (req, res) => {
  const job = await Job.findOne({ _id: req.params.jobId, employerId: req.user._id });
  if (!job) return res.status(403).json({ message: "Not authorized to view these applications" });

  const applications = await Application.find({ jobId: req.params.jobId })
    .populate("candidateId")
    .sort({ createdAt: -1 });

  const result = await Promise.all(
    applications.map(async (a) => {
      const obj = a.toJSON();
      if (a.candidateId) {
        const profile = await CandidateProfile.findOne({ userId: a.candidateId._id });
        if (profile) {
          const profileObj = profile.toJSON();
          profileObj.name = a.candidateId.name;
          profileObj.email = a.candidateId.email;

          // Generate signed URL if candidate has a resume
          if (profile.resumePublicId) {
            try {
              profileObj.resumeUrl = await getSignedResumeUrl(profile.resumePublicId);
            } catch {
              profileObj.resumeUrl = null;
            }
          }
          obj.candidate = profileObj;
        }
      }
      return obj;
    })
  );

  res.json({ applications: result, total: result.length });
});

// PUT /api/applications/:applicationId/status — employer only
router.put("/:applicationId/status", protect, requireRole("employer"), async (req, res) => {
  const { status } = req.body;
  const allowed = ["pending", "reviewed", "shortlisted", "rejected", "hired"];
  if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

  const application = await Application.findById(req.params.applicationId).populate("jobId");
  if (!application) return res.status(404).json({ message: "Application not found" });

  // Ensure employer owns the job
  if (application.jobId.employerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  application.status = status;
  await application.save();
  res.json(application.toJSON());
});

export default router;
