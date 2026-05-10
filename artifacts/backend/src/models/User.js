import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true, sparse: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ["candidate", "employer", "admin"], required: true },
  isBanned: { type: Boolean, default: false },
  company: { type: String },
  fieldOfInterest: { type: String },
  experienceLevel: { type: String },
  currentLocation: { type: String },
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  obj.id = obj._id.toString();
  return obj;
};

export default mongoose.model("User", userSchema);
