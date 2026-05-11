import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  jobId:       { type: mongoose.Schema.Types.ObjectId, ref: "Job",  required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["pending", "reviewed", "shortlisted", "interview_scheduled", "rejected", "hired"],
    default: "pending",
  },
  coverLetter: { type: String },

  // ── Application form details ──
  fullName:            { type: String },
  mobile:              { type: String },
  email:               { type: String },
  address:             { type: String },
  positionApplied:     { type: String },
  preferredLocation:   { type: String },
  expectedSalary:      { type: String },
  joiningAvailability: { type: String },
  highestQualification:{ type: String },
  collegeName:         { type: String },
  passingYear:         { type: String },
  totalExperience:     { type: String },
  currentCompany:      { type: String },
  currentSalary:       { type: String },
  skills:              [{ type: String }],
  resumeAttached:      { type: Boolean, default: false },
}, { timestamps: true });

applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

applicationSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id      = obj._id.toString();
  obj.jobId   = obj.jobId.toString();
  obj.candidateId = obj.candidateId.toString();
  return obj;
};

export default mongoose.model("Application", applicationSchema);
