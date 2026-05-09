/**
 * Recruweb Admin Account Creation Script
 * Run: node --env-file=../../.env artifacts/backend/scripts/create-admin.js
 * Or:  MONGODB_URI="..." node artifacts/backend/scripts/create-admin.js
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("ERROR: Set MONGODB_URI env variable before running this script.");
  console.error("Example: MONGODB_URI=mongodb+srv://... node artifacts/backend/scripts/create-admin.js");
  process.exit(1);
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@recruweb.in";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123456";
const ADMIN_NAME = "Recruweb Admin";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: String,
  isBanned: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✓ Connected to MongoDB");

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      existing.role = "admin";
      existing.password = await bcrypt.hash(ADMIN_PASSWORD, 12);
      await existing.save();
      console.log(`✓ Updated ${ADMIN_EMAIL} → admin role`);
    } else {
      await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: await bcrypt.hash(ADMIN_PASSWORD, 12),
        role: "admin",
      });
      console.log("✓ Admin account created!");
    }

    console.log("\n╔══════════════════════════════╗");
    console.log("║     ADMIN LOGIN CREDENTIALS  ║");
    console.log("╠══════════════════════════════╣");
    console.log(`║  URL:      /admin/login       ║`);
    console.log(`║  Email:    ${ADMIN_EMAIL.padEnd(18)} ║`);
    console.log(`║  Password: Admin@123456       ║`);
    console.log("╚══════════════════════════════╝\n");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
