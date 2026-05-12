import { Router } from "express";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import CandidateProfile from "../models/CandidateProfile.js";
import EmployerProfile from "../models/EmployerProfile.js";
import Notification from "../models/Notification.js";
import { protect, requireRole } from "../middleware/auth.js";
import { getSignedResumeUrl } from "../lib/cloudinary.js";
import { sendApplicationReceivedEmail, sendStatusChangedEmail } from "../lib/email.js";

const router = Router();

const STATUS_LABELS = {
  pending:             "Pending Review",
  reviewed:            "Under Review",
  shortlisted:         "Shortlisted",
  interview_scheduled: "Interview Scheduled",
  hired:               "Hired — Congratulations!",
  rejected:            "Application Not Selected",
};

// POST /api/applications — candidate only
router.post("/", protect, requireRole("candidate"), async (req, res) => {
  const {
    jobId, coverLetter,
    fullName, mobile, email, address,
    positionApplied, preferredLocation, expectedSalary, joiningAvailability,
    highestQualification, collegeName, passingYear,
    totalExperience, currentCompany, currentSalary,
    skills, resumeAttached,
  } = req.body;

  if (!jobId) return res.status(400).json({ message: "jobId required" });

  const job = await Job.findById(jobId).populate("employerId");
  if (!job || !job.isActive) return res.status(404).json({ message: "Job not found" });

  const existing = await Application.findOne({ jobId, candidateId: req.user._id });
  if (existing) return res.status(400).json({ message: "Already applied to this job" });

  const application = await Application.create({
    jobId, candidateId: req.user._id, coverLetter,
    fullName, mobile, email, address,
    positionApplied, preferredLocation, expectedSalary, joiningAvailability,
    highestQualification, collegeName, passingYear,
    totalExperience, currentCompany, currentSalary,
    skills: Array.isArray(skills) ? skills : (skills ? skills.split(",").map(s => s.trim()).filter(Boolean) : []),
    resumeAttached: !!resumeAttached,
  });
  await Job.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } });

  // ── Notify employer ──────────────────────────────────────────────────────
  const candidateName = req.user.name || fullName || "A candidate";
  const employerUserId = job.employerId?._id || job.employerId;
  const employerUser   = employerUserId ? await User.findById(employerUserId).lean() : null;

  if (employerUserId) {
    await Notification.create({
      userId:  employerUserId,
      type:    "application_received",
      title:   "New Application Received",
      message: `${candidateName} applied for ${job.title}`,
      metadata: { jobId: job._id, jobTitle: job.title, candidateName, applicationId: application._id },
    });
  }

  if (employerUser?.email) {
    const employerProfile = await EmployerProfile.findOne({ userId: employerUserId }).lean();
    sendApplicationReceivedEmail({
      to:            employerUser.email,
      employerName:  employerProfile?.companyName || employerUser.name || "Employer",
      candidateName,
      jobTitle:      job.title,
      applicationId: application._id,
    }).catch(() => {});
  }

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

// GET /api/applications/job/:jobId — employer only, with optional filters
router.get("/job/:jobId", protect, requireRole("employer"), async (req, res) => {
  const job = await Job.findOne({ _id: req.params.jobId, employerId: req.user._id });
  if (!job) return res.status(403).json({ message: "Not authorized" });

  const { skills, keyword, experience, education, status } = req.query;

  let applications = await Application.find({
    jobId: req.params.jobId,
    ...(status && status !== "all" ? { status } : {}),
  })
    .populate("candidateId")
    .sort({ createdAt: -1 });

  const result = await Promise.all(
    applications.map(async (a) => {
      const obj = a.toJSON();
      if (!a.candidateId) return obj;

      const profile = await CandidateProfile.findOne({ userId: a.candidateId._id });
      if (profile) {
        const profileObj = profile.toJSON();
        profileObj.name = a.candidateId.name;
        profileObj.email = a.candidateId.email;
        profileObj.user = { name: a.candidateId.name, email: a.candidateId.email };

        if (profile.resumePublicId) {
          try { profileObj.resumeUrl = await getSignedResumeUrl(profile.resumePublicId); }
          catch { profileObj.resumeUrl = null; }
        }
        obj.candidate = profileObj;
      } else {
        obj.candidate = {
          name: a.candidateId.name,
          email: a.candidateId.email,
          user: { name: a.candidateId.name, email: a.candidateId.email },
          skills: [],
        };
      }
      return obj;
    })
  );

  let filtered = result;

  if (skills) {
    const skillList = skills.toLowerCase().split(",").map(s => s.trim()).filter(Boolean);
    filtered = filtered.filter(app => {
      const candSkills = (app.candidate?.skills || []).map(s => s.toLowerCase());
      return skillList.some(s => candSkills.some(cs => cs.includes(s)));
    });
  }

  if (keyword) {
    const kw = keyword.toLowerCase();
    filtered = filtered.filter(app => {
      const searchable = [
        app.candidate?.bio || "",
        app.candidate?.experience || "",
        app.candidate?.education || "",
        app.candidate?.currentTitle || "",
        app.coverLetter || "",
        (app.candidate?.skills || []).join(" "),
      ].join(" ").toLowerCase();
      return searchable.includes(kw);
    });
  }

  if (experience) {
    const expLower = experience.toLowerCase();
    filtered = filtered.filter(app => {
      const exp = (app.candidate?.experience || "").toLowerCase();
      return exp.includes(expLower);
    });
  }

  if (education) {
    const eduLower = education.toLowerCase();
    filtered = filtered.filter(app => {
      const edu = (app.candidate?.education || "").toLowerCase();
      return edu.includes(eduLower);
    });
  }

  res.json({ applications: filtered, total: filtered.length });
});

// GET /api/applications/employer/all — employer only: all applications across all jobs
router.get("/employer/all", protect, requireRole("employer"), async (req, res) => {
  const myJobs = await Job.find({ employerId: req.user._id }).select("_id title location salary").lean();
  const jobIds = myJobs.map(j => j._id);

  const applications = await Application.find({ jobId: { $in: jobIds } })
    .populate("candidateId")
    .sort({ createdAt: -1 });

  const jobMap = {};
  myJobs.forEach(j => { jobMap[j._id.toString()] = j; });

  const result = await Promise.all(
    applications.map(async (a) => {
      const obj = a.toJSON();
      obj.job = jobMap[a.jobId.toString()] || null;
      if (!a.candidateId) return obj;

      const profile = await CandidateProfile.findOne({ userId: a.candidateId._id });
      if (profile) {
        const profileObj = profile.toJSON();
        profileObj.name = a.candidateId.name;
        profileObj.email = a.candidateId.email;
        profileObj.user = { name: a.candidateId.name, email: a.candidateId.email };
        if (profile.resumePublicId) {
          try { profileObj.resumeUrl = await getSignedResumeUrl(profile.resumePublicId); }
          catch { profileObj.resumeUrl = null; }
        }
        obj.candidate = profileObj;
      } else {
        obj.candidate = {
          name: a.candidateId.name,
          email: a.candidateId.email,
          user: { name: a.candidateId.name, email: a.candidateId.email },
          skills: [],
        };
      }
      return obj;
    })
  );

  res.json({ applications: result, jobs: myJobs, total: result.length });
});

// PUT /api/applications/:applicationId/status — employer only
router.put("/:applicationId/status", protect, requireRole("employer"), async (req, res) => {
  const { status } = req.body;
  const allowed = ["pending", "reviewed", "shortlisted", "interview_scheduled", "rejected", "hired"];
  if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

  const application = await Application.findById(req.params.applicationId).populate("jobId");
  if (!application) return res.status(404).json({ message: "Application not found" });

  if (application.jobId.employerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  application.status = status;
  await application.save();

  // ── Notify candidate ─────────────────────────────────────────────────────
  const candidateUser = await User.findById(application.candidateId).lean();
  const jobTitle = application.jobId?.title || "a position";
  const statusLabel = STATUS_LABELS[status] || status;

  if (candidateUser) {
    await Notification.create({
      userId:  candidateUser._id,
      type:    "status_changed",
      title:   statusLabel,
      message: `Your application for ${jobTitle} has been updated to: ${statusLabel}`,
      metadata: {
        jobId:         application.jobId._id,
        jobTitle,
        status,
        applicationId: application._id,
      },
    });

    const employerProfile = await EmployerProfile.findOne({ userId: req.user._id }).lean();
    const company = employerProfile?.companyName || "";

    sendStatusChangedEmail({
      to:            candidateUser.email,
      candidateName: candidateUser.name,
      jobTitle,
      company,
      status,
    }).catch(() => {});
  }

  res.json(application.toJSON());
});

export default router;
