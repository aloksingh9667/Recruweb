import mongoose from "mongoose";

const candidateProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  phone: { type: String },
  location: { type: String },
  currentTitle: { type: String },
  bio: { type: String },
  skills: [{ type: String }],
  education: { type: String },
  experience: { type: String },
  resumeUrl: { type: String },       // Signed URL (generated on demand)
  resumePublicId: { type: String },  // Cloudinary public_id for private asset
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
}, { timestamps: true });

candidateProfileSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  obj.userId = obj.userId.toString();
  return obj;
};

export default mongoose.model("CandidateProfile", candidateProfileSchema);
