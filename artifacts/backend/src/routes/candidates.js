import { Router } from "express";
import CandidateProfile from "../models/CandidateProfile.js";
import { protect, requireRole } from "../middleware/auth.js";
import { uploadResume, getSignedResumeUrl } from "../lib/cloudinary.js";

const router = Router();

// GET /api/candidates/profile
router.get("/profile", protect, requireRole("candidate"), async (req, res) => {
  let profile = await CandidateProfile.findOne({ userId: req.user._id });
  if (!profile) profile = await CandidateProfile.create({ userId: req.user._id });

  const obj = profile.toJSON();
  obj.name = req.user.name;
  obj.email = req.user.email;

  // Generate fresh signed URL if resume exists
  if (profile.resumePublicId) {
    try {
      obj.resumeUrl = await getSignedResumeUrl(profile.resumePublicId);
    } catch {
      obj.resumeUrl = null;
    }
  }

  res.json(obj);
});

// PUT /api/candidates/profile
router.put("/profile", protect, requireRole("candidate"), async (req, res) => {
  const { phone, location, currentTitle, bio, skills, education, experience } = req.body;
  const profile = await CandidateProfile.findOneAndUpdate(
    { userId: req.user._id },
    { phone, location, currentTitle, bio, skills, education, experience },
    { new: true, upsert: true }
  );

  const obj = profile.toJSON();
  obj.name = req.user.name;
  obj.email = req.user.email;
  res.json(obj);
});

// POST /api/candidates/resume — multipart upload
router.post(
  "/resume",
  protect,
  requireRole("candidate"),
  uploadResume.single("resume"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const publicId = req.file.filename || req.file.public_id;

    await CandidateProfile.findOneAndUpdate(
      { userId: req.user._id },
      { resumePublicId: publicId, resumeUrl: null },
      { upsert: true }
    );

    const signedUrl = await getSignedResumeUrl(publicId);

    res.json({
      resumeUrl: signedUrl,
      resumePublicId: publicId,
      message: "Resume uploaded successfully",
    });
  }
);

// GET /api/candidates/saved-jobs
router.get("/saved-jobs", protect, requireRole("candidate"), async (req, res) => {
  const profile = await CandidateProfile.findOne({ userId: req.user._id }).populate("savedJobs");
  const savedJobs = profile?.savedJobs || [];
  res.json({ savedJobs });
});

// POST /api/candidates/saved-jobs/:jobId
router.post("/saved-jobs/:jobId", protect, requireRole("candidate"), async (req, res) => {
  const { jobId } = req.params;
  const profile = await CandidateProfile.findOneAndUpdate(
    { userId: req.user._id },
    { $addToSet: { savedJobs: jobId } },
    { upsert: true, new: true }
  );
  res.json({ message: "Job saved", savedJobsCount: profile.savedJobs.length });
});

// DELETE /api/candidates/saved-jobs/:jobId
router.delete("/saved-jobs/:jobId", protect, requireRole("candidate"), async (req, res) => {
  const { jobId } = req.params;
  const profile = await CandidateProfile.findOneAndUpdate(
    { userId: req.user._id },
    { $pull: { savedJobs: jobId } },
    { new: true }
  );
  res.json({ message: "Job removed", savedJobsCount: profile?.savedJobs?.length || 0 });
});

// GET /api/candidates/saved-jobs/ids — lightweight: just IDs for checking bookmark state
router.get("/saved-jobs/ids", protect, requireRole("candidate"), async (req, res) => {
  const profile = await CandidateProfile.findOne({ userId: req.user._id }).select("savedJobs");
  res.json({ savedJobIds: (profile?.savedJobs || []).map(id => id.toString()) });
});

export default router;
