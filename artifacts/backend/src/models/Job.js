import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  location: { type: String, required: true },
  category: { type: String, required: true },
  employmentType: {
    type: String,
    enum: ["full-time", "part-time", "contract", "internship", "remote", "hybrid"],
    required: true,
  },
  description: { type: String, required: true },
  requirements: { type: String },
  salaryRange: { type: String },
  skills: [{ type: String }],
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  experienceRequired: { type: String },

  openings: { type: Number, default: 1 },
  industry: { type: String },
  department: { type: String },
  roleCategory: { type: String },
  role: { type: String },
  education: { type: String },
  shiftTiming: { type: String },
  workingDays: { type: String },
  keyResponsibilities: { type: String },

  companyDescription: { type: String },
  companyWebsite: { type: String },
  companySize: { type: String },
  companyAddress: { type: String },
  companyRating: { type: Number, min: 0, max: 5 },
  companyReviews: { type: Number, default: 0 },

  perks: [{ type: String }],
  screeningQuestions: [{ type: String }],
  contactEmail: { type: String },
  contactPhone: { type: String },

  isActive: { type: Boolean, default: true },
  applicantCount: { type: Number, default: 0 },
  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  adminStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },
}, { timestamps: true });

jobSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  obj.employerId = obj.employerId.toString();
  return obj;
};

export default mongoose.model("Job", jobSchema);
