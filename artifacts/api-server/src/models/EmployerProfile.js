import mongoose from "mongoose";

const employerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  company: { type: String, required: true },
  industry: { type: String },
  companySize: { type: String },
  location: { type: String },
  website: { type: String },
  description: { type: String },
}, { timestamps: true });

employerProfileSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  obj.userId = obj.userId.toString();
  return obj;
};

export default mongoose.model("EmployerProfile", employerProfileSchema);
