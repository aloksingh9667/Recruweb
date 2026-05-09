import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Resumes stored in a private folder — not public by default
const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "recruweb/resumes",
    resource_type: "raw",
    type: "private", // private so random URLs don't work
    allowed_formats: ["pdf", "doc", "docx"],
    public_id: (req, file) => {
      const ts = Date.now();
      const name = file.originalname.replace(/\.[^/.]+$/, "").replace(/\s+/g, "_");
      return `${req.user.id}_${name}_${ts}`;
    },
  },
});

export const uploadResume = multer({
  storage: resumeStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF and Word documents are allowed"));
  },
});

// Generate a time-limited signed URL for a private Cloudinary resource
export async function getSignedResumeUrl(publicId) {
  return cloudinary.utils.private_download_url(publicId, "pdf", {
    expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    resource_type: "raw",
  });
}

export { cloudinary };
