import app from "./app.js";
import { connectDB } from "./lib/db.js";
import { logger } from "./lib/logger.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const port = Number(process.env.PORT);
if (!port) throw new Error("PORT env var required");

await connectDB();

async function autoSeed() {
  try {
    const User = mongoose.model("User");
    const CandidateProfile = mongoose.model("CandidateProfile");
    const EmployerProfile = mongoose.model("EmployerProfile");
    const Job = mongoose.model("Job");

    const existingCandidate = await User.findOne({ email: "priya@demo.recruweb.in" });
    if (existingCandidate) return;

    logger.info("Auto-seeding default demo accounts...");
    const hashedPassword = await bcrypt.hash("Demo@1234", 12);

    const adminExists = await User.findOne({ email: "admin@recruweb.in" });
    if (!adminExists) {
      await User.create({ name: "Recruweb Admin", email: "admin@recruweb.in", password: hashedPassword, role: "admin" });
    }

    const SEED_EMPLOYERS = [
      { name: "TCS HR Team", email: "hr@tcs.recruweb.in", company: "TCS Digital", industry: "IT Services", location: "Noida, UP" },
      { name: "Infosys Talent", email: "talent@infosys.recruweb.in", company: "Infosys BPM", industry: "IT Services", location: "Bangalore" },
      { name: "Flipkart Hiring", email: "hiring@flipkart.recruweb.in", company: "Flipkart", industry: "E-commerce", location: "Bangalore" },
      { name: "Zomato HR", email: "hr@zomato.recruweb.in", company: "Zomato", industry: "FoodTech", location: "Gurugram" },
      { name: "Amazon Recruiter", email: "recruit@amazon.recruweb.in", company: "Amazon India", industry: "E-commerce", location: "Hyderabad" },
      { name: "Paytm HR", email: "hr@paytm.recruweb.in", company: "Paytm", industry: "FinTech", location: "Noida" },
      { name: "HDFC Bank HR", email: "hr@hdfc.recruweb.in", company: "HDFC Bank", industry: "Banking", location: "Mumbai" },
      { name: "Wipro Talent", email: "talent@wipro.recruweb.in", company: "Wipro", industry: "IT Services", location: "Pune" },
      { name: "Razorpay HR", email: "hr@razorpay.recruweb.in", company: "Razorpay", industry: "FinTech", location: "Bangalore" },
      { name: "Ola Hiring", email: "hr@ola.recruweb.in", company: "Ola", industry: "Mobility", location: "Delhi" },
      { name: "Byju's HR", email: "hr@byjus.recruweb.in", company: "Byju's", industry: "EdTech", location: "Delhi" },
      { name: "L&T HR", email: "hr@lt.recruweb.in", company: "L&T Construction", industry: "Construction", location: "Noida" },
      { name: "Cognizant HR", email: "hr@cognizant.recruweb.in", company: "Cognizant", industry: "IT Services", location: "Chennai" },
      { name: "Apollo HR", email: "hr@apollo.recruweb.in", company: "Apollo Hospitals", industry: "Healthcare", location: "Delhi" },
      { name: "Google HR", email: "hr@google.recruweb.in", company: "Google India", industry: "Technology", location: "Hyderabad" },
    ];

    const SEED_CANDIDATES = [
      { name: "Priya Sharma", email: "priya@demo.recruweb.in", phone: "+919876543210", fieldOfInterest: "Information Technology", experienceLevel: "3-5 years", currentLocation: "Noida", skills: ["React", "Node.js", "Python", "SQL"] },
      { name: "Rahul Gupta", email: "rahul@demo.recruweb.in", phone: "+919876543211", fieldOfInterest: "Data Science & Analytics", experienceLevel: "1-2 years", currentLocation: "Bangalore", skills: ["Python", "Machine Learning", "TensorFlow"] },
    ];

    const SEED_JOBS = [
      { title: "Senior React Developer", company: "TCS Digital", location: "Noida, UP", employmentType: "full-time", salaryRange: "₹15-25 LPA", category: "IT/Software", experienceRequired: "3-6 years", skills: ["React", "Node.js", "TypeScript", "AWS"], description: "We are looking for a Senior React Developer to join our growing team at TCS Digital." },
      { title: "Data Scientist", company: "Infosys BPM", location: "Bangalore, Karnataka", employmentType: "full-time", salaryRange: "₹12-18 LPA", category: "Data Science", experienceRequired: "2-5 years", skills: ["Python", "Machine Learning", "TensorFlow", "SQL"], description: "Join our AI/ML team to build predictive models." },
      { title: "Product Manager", company: "Flipkart", location: "Bangalore, Karnataka", employmentType: "full-time", salaryRange: "₹20-35 LPA", category: "IT/Software", experienceRequired: "4-8 years", skills: ["Product Strategy", "Agile", "SQL"], description: "Lead product strategy for Flipkart's core commerce platform." },
      { title: "UI/UX Designer", company: "Zomato", location: "Gurugram, Haryana", employmentType: "full-time", salaryRange: "₹10-16 LPA", category: "Design", experienceRequired: "2-4 years", skills: ["Figma", "Sketch", "Prototyping"], description: "Design beautiful and intuitive experiences for Zomato's mobile and web platforms." },
      { title: "DevOps Engineer", company: "Amazon India", location: "Hyderabad, Telangana", employmentType: "full-time", salaryRange: "₹18-28 LPA", category: "IT/Software", experienceRequired: "3-7 years", skills: ["AWS", "Docker", "Kubernetes", "CI/CD"], description: "Build and maintain highly available, scalable infrastructure." },
      { title: "Marketing Manager", company: "Paytm", location: "Noida, UP", employmentType: "full-time", salaryRange: "₹12-20 LPA", category: "Marketing", experienceRequired: "3-6 years", skills: ["Digital Marketing", "SEO", "Analytics"], description: "Drive Paytm's marketing initiatives across digital channels." },
      { title: "Financial Analyst", company: "HDFC Bank", location: "Mumbai, Maharashtra", employmentType: "full-time", salaryRange: "₹8-14 LPA", category: "Finance", experienceRequired: "1-4 years", skills: ["Financial Modeling", "Excel", "Python"], description: "Analyze financial data for India's largest private bank." },
      { title: "HR Business Partner", company: "Wipro", location: "Pune, Maharashtra", employmentType: "full-time", salaryRange: "₹10-18 LPA", category: "HR", experienceRequired: "4-7 years", skills: ["HR Strategy", "Talent Management"], description: "Partner with business leaders to implement HR strategies." },
      { title: "Backend Engineer (Python)", company: "Razorpay", location: "Bangalore, Karnataka", employmentType: "full-time", salaryRange: "₹16-24 LPA", category: "IT/Software", experienceRequired: "2-5 years", skills: ["Python", "Django", "PostgreSQL", "Redis"], description: "Build robust payment infrastructure at scale at Razorpay." },
      { title: "Sales Executive", company: "Ola", location: "Delhi NCR", employmentType: "full-time", salaryRange: "₹5-8 LPA", category: "Sales", experienceRequired: "0-3 years", skills: ["Sales", "Communication", "CRM"], description: "Drive Ola's B2B sales in Delhi NCR." },
      { title: "Machine Learning Engineer", company: "Google India", location: "Hyderabad, Telangana", employmentType: "full-time", salaryRange: "₹30-50 LPA", category: "IT/Software", experienceRequired: "3-7 years", skills: ["Python", "TensorFlow", "PyTorch", "MLOps"], description: "Work on cutting-edge ML projects at Google." },
      { title: "Software Engineer (Java)", company: "Cognizant", location: "Chennai, Tamil Nadu", employmentType: "full-time", salaryRange: "₹8-15 LPA", category: "IT/Software", experienceRequired: "2-5 years", skills: ["Java", "Spring Boot", "Microservices", "MySQL"], description: "Build enterprise-grade Java applications for global clients." },
    ];

    const employerUserMap = {};
    for (const emp of SEED_EMPLOYERS) {
      const existingEmp = await User.findOne({ email: emp.email });
      if (existingEmp) { employerUserMap[emp.company] = existingEmp; continue; }
      const user = await User.create({ name: emp.name, email: emp.email, password: hashedPassword, role: "employer", company: emp.company });
      await EmployerProfile.findOneAndUpdate(
        { userId: user._id },
        { userId: user._id, company: emp.company, industry: emp.industry, location: emp.location, description: `${emp.company} is a leading ${emp.industry} company.`, size: "1000-5000 employees" },
        { upsert: true }
      );
      employerUserMap[emp.company] = user;
    }

    for (const cand of SEED_CANDIDATES) {
      const existingCand = await User.findOne({ email: cand.email });
      if (existingCand) continue;
      const user = await User.create({ name: cand.name, email: cand.email, password: hashedPassword, role: "candidate", phone: cand.phone, fieldOfInterest: cand.fieldOfInterest, experienceLevel: cand.experienceLevel, currentLocation: cand.currentLocation });
      await CandidateProfile.findOneAndUpdate(
        { userId: user._id },
        { userId: user._id, skills: cand.skills, location: cand.currentLocation, bio: `Experienced professional in ${cand.fieldOfInterest}` },
        { upsert: true }
      );
    }

    const existingJobCount = await Job.countDocuments();
    if (existingJobCount === 0) {
      for (const jobData of SEED_JOBS) {
        const employer = employerUserMap[jobData.company] || Object.values(employerUserMap)[0];
        if (!employer) continue;
        await Job.create({ ...jobData, employerId: employer._id, isActive: true, applicantCount: Math.floor(Math.random() * 200) + 10 });
      }
    }

    logger.info("Auto-seed complete. Demo accounts ready.");
  } catch (err) {
    logger.warn({ err: err.message }, "Auto-seed skipped or failed (non-fatal)");
  }
}

await autoSeed();

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error starting server");
    process.exit(1);
  }
  logger.info({ port }, "Recruweb API server listening");
});
