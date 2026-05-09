import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  location: { type: String, required: true },
  category: { type: String, required: true },
  employmentType: {
    type: String,
    enum: ["full-time", "part-time", "contract", "internship", "remote"],
    required: true,
  },
  description: { type: String, required: true },
  requirements: { type: String },
  salaryRange: { type: String },
  skills: [{ type: String }],
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isActive: { type: Boolean, default: true },
  applicantCount: { type: Number, default: 0 },
}, { timestamps: true });

jobSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  obj.employerId = obj.employerId.toString();
  return obj;
};

export default mongoose.model("Job", jobSchema);
