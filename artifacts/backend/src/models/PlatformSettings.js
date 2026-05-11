import mongoose from "mongoose";

const PlatformSettingsSchema = new mongoose.Schema({
  platformName:       { type: String, default: "Recruweb" },
  tagline:            { type: String, default: "India's fastest growing job portal" },
  contactEmail:       { type: String, default: "support@recruweb.in" },
  supportPhone:       { type: String, default: "+91-98765-43210" },
  jobApprovalMode:    { type: String, enum: ["auto", "manual"], default: "auto" },
  maintenanceMode:    { type: Boolean, default: false },
  allowGuestBrowsing: { type: Boolean, default: true },
  maxJobsPerEmployer: { type: Number, default: 50 },
  maxAppsPerCandidate:{ type: Number, default: 100 },
  aiEnabled:          { type: Boolean, default: true },
  newsLetterEnabled:  { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("PlatformSettings", PlatformSettingsSchema);
