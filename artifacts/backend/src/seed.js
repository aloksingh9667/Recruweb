import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;

const userSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, phone: String,
  password: String, role: String, isBanned: { type: Boolean, default: false },
  company: String, fieldOfInterest: String, experienceLevel: String, currentLocation: String,
}, { timestamps: true });
const User = mongoose.models.User || mongoose.model("User", userSchema);

const jobSchema = new mongoose.Schema({
  title: String, company: String, location: String, type: String,
  salary: String, description: String, requirements: [String],
  skills: [String], category: String, experience: String,
  employerId: mongoose.Schema.Types.ObjectId, isActive: { type: Boolean, default: true },
  applicationCount: { type: Number, default: 0 }, views: { type: Number, default: 0 },
}, { timestamps: true });
const Job = mongoose.models.Job || mongoose.model("Job", jobSchema);

const candidateProfileSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId, headline: String, bio: String, skills: [String],
  experience: [{ company: String, role: String, duration: String, description: String }],
  education: [{ institution: String, degree: String, year: String }],
  location: String, resume: String,
}, { timestamps: true });
const CandidateProfile = mongoose.models.CandidateProfile || mongoose.model("CandidateProfile", candidateProfileSchema);

const employerProfileSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId, company: String, industry: String,
  size: String, description: String, website: String, location: String, logo: String,
}, { timestamps: true });
const EmployerProfile = mongoose.models.EmployerProfile || mongoose.model("EmployerProfile", employerProfileSchema);

const SEED_JOBS = [
  { title: "Senior React Developer", company: "TCS Digital", location: "Noida, UP", type: "Full-time", salary: "₹15-25 LPA", category: "IT & Software", experience: "3-6 years", skills: ["React", "Node.js", "TypeScript", "AWS"], requirements: ["3+ years React experience", "Strong JS fundamentals", "REST API integration", "Git proficiency"], description: "We are looking for a Senior React Developer to join our growing team at TCS Digital. You will be responsible for building scalable web applications, collaborating with cross-functional teams, and mentoring junior developers." },
  { title: "Data Scientist", company: "Infosys BPM", location: "Bangalore, Karnataka", type: "Full-time", salary: "₹12-18 LPA", category: "Data Science", experience: "2-5 years", skills: ["Python", "Machine Learning", "TensorFlow", "SQL", "Tableau"], requirements: ["Strong Python skills", "Experience with ML frameworks", "Statistical analysis", "Data visualization"], description: "Join our AI/ML team to build predictive models and data-driven solutions that impact millions of users." },
  { title: "Product Manager", company: "Flipkart", location: "Bangalore, Karnataka", type: "Full-time", salary: "₹20-35 LPA", category: "IT & Software", experience: "4-8 years", skills: ["Product Strategy", "Agile", "SQL", "User Research"], requirements: ["MBA or equivalent", "4+ years PM experience", "Data-driven decision making"], description: "Lead product strategy for Flipkart's core commerce platform. Define roadmaps, work with engineering and design, and deliver products used by 100M+ customers." },
  { title: "UI/UX Designer", company: "Zomato", location: "Gurugram, Haryana", type: "Full-time", salary: "₹10-16 LPA", category: "Design & Creative", experience: "2-4 years", skills: ["Figma", "Sketch", "Prototyping", "User Testing"], requirements: ["Strong portfolio", "Experience with Figma", "Mobile-first design"], description: "Design beautiful and intuitive experiences for Zomato's mobile and web platforms." },
  { title: "DevOps Engineer", company: "Amazon India", location: "Hyderabad, Telangana", type: "Full-time", salary: "₹18-28 LPA", category: "IT & Software", experience: "3-7 years", skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"], requirements: ["Strong AWS knowledge", "Kubernetes experience", "Infrastructure as code"], description: "Build and maintain highly available, scalable infrastructure for Amazon's Indian operations." },
  { title: "Marketing Manager", company: "Paytm", location: "Noida, UP", type: "Full-time", salary: "₹12-20 LPA", category: "Marketing & Communications", experience: "3-6 years", skills: ["Digital Marketing", "SEO", "Analytics", "Campaign Management"], requirements: ["3+ years marketing experience", "Google Analytics expertise"], description: "Drive Paytm's marketing initiatives across digital channels." },
  { title: "Financial Analyst", company: "HDFC Bank", location: "Mumbai, Maharashtra", type: "Full-time", salary: "₹8-14 LPA", category: "Finance & Accounting", experience: "1-4 years", skills: ["Financial Modeling", "Excel", "Python", "SQL"], requirements: ["CA/MBA Finance preferred", "Advanced Excel skills"], description: "Analyze financial data, prepare reports, and support investment decisions for India's largest private bank." },
  { title: "HR Business Partner", company: "Wipro", location: "Pune, Maharashtra", type: "Full-time", salary: "₹10-18 LPA", category: "Human Resources", experience: "4-7 years", skills: ["HR Strategy", "Talent Management", "Employee Relations", "HRIS"], requirements: ["MBA HR preferred", "4+ years HRBP experience"], description: "Partner with business leaders to develop and implement HR strategies." },
  { title: "Backend Engineer (Python)", company: "Razorpay", location: "Bangalore, Karnataka", type: "Full-time", salary: "₹16-24 LPA", category: "IT & Software", experience: "2-5 years", skills: ["Python", "Django", "PostgreSQL", "Redis", "Microservices"], requirements: ["Strong Python skills", "Database design experience", "API development"], description: "Build robust payment infrastructure at scale at Razorpay." },
  { title: "Sales Executive", company: "Ola", location: "Delhi NCR", type: "Full-time", salary: "₹5-8 LPA", category: "Sales & Business Development", experience: "0-3 years", skills: ["Sales", "Communication", "CRM", "Negotiation"], requirements: ["Graduate in any field", "Excellent communication", "Self-motivated"], description: "Drive Ola's B2B sales in Delhi NCR. Onboard new driver partners and manage key accounts." },
  { title: "Content Writer (Tech)", company: "Byju's", location: "Delhi", type: "Full-time", salary: "₹6-10 LPA", category: "Marketing & Communications", experience: "1-3 years", skills: ["Technical Writing", "SEO", "Research", "Editing"], requirements: ["Excellent English skills", "SEO knowledge", "Portfolio required"], description: "Create engaging educational content for India's largest ed-tech platform." },
  { title: "Civil Engineer", company: "L&T Construction", location: "Noida, UP", type: "Full-time", salary: "₹6-12 LPA", category: "Engineering (Non-IT)", experience: "2-5 years", skills: ["AutoCAD", "Project Management", "Structural Analysis", "MS Project"], requirements: ["B.Tech Civil Engineering", "2+ years site experience", "AutoCAD proficiency"], description: "Join L&T's prestigious infrastructure projects across India." },
  { title: "Software Engineer (Java)", company: "Cognizant", location: "Chennai, Tamil Nadu", type: "Full-time", salary: "₹8-15 LPA", category: "IT & Software", experience: "2-5 years", skills: ["Java", "Spring Boot", "Microservices", "MySQL"], requirements: ["Strong Java skills", "Spring Boot experience", "REST APIs"], description: "Join Cognizant's engineering team to build enterprise-grade Java applications for global clients." },
  { title: "Nurse (ICU)", company: "Apollo Hospitals", location: "Delhi", type: "Full-time", salary: "₹5-9 LPA", category: "Healthcare", experience: "1-4 years", skills: ["Patient Care", "ICU Management", "Medication Administration", "BLS/ACLS"], requirements: ["B.Sc Nursing", "Valid nursing license", "ICU experience preferred"], description: "Provide critical care nursing at Apollo's premier ICU facilities in Delhi." },
  { title: "Machine Learning Engineer", company: "Google India", location: "Hyderabad, Telangana", type: "Full-time", salary: "₹30-50 LPA", category: "IT & Software", experience: "3-7 years", skills: ["Python", "TensorFlow", "PyTorch", "MLOps", "NLP"], requirements: ["MS/PhD in CS preferred", "3+ years ML experience", "Research publications a plus"], description: "Work on cutting-edge machine learning projects that impact billions of users worldwide." },
];

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
  { name: "Anita Singh", email: "anita@demo.recruweb.in", phone: "+919876543212", fieldOfInterest: "Human Resources", experienceLevel: "5-8 years", currentLocation: "Mumbai", skills: ["HR Strategy", "Talent Management", "HRIS"] },
  { name: "Vikram Patel", email: "vikram@demo.recruweb.in", phone: "+919876543213", fieldOfInterest: "Finance & Accounting", experienceLevel: "3-5 years", currentLocation: "Delhi", skills: ["Financial Analysis", "Excel", "Python", "Bloomberg"] },
  { name: "Kavya Nair", email: "kavya@demo.recruweb.in", phone: "+919876543214", fieldOfInterest: "Design & Creative", experienceLevel: "1-2 years", currentLocation: "Bangalore", skills: ["Figma", "Sketch", "Adobe XD", "User Research"] },
];

async function seed() {
  try {
    if (!MONGODB_URI) throw new Error("MONGODB_URI environment variable not set");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB Atlas");

    await User.deleteMany({ email: { $regex: /\.recruweb\.in$/ } });
    console.log("Cleared old seed data");

    const hashedPassword = await bcrypt.hash("Demo@1234", 12);

    const adminExists = await User.findOne({ email: "admin@recruweb.in" });
    if (!adminExists) {
      await User.create({ name: "Recruweb Admin", email: "admin@recruweb.in", password: hashedPassword, role: "admin" });
    }

    const employerUserMap = {};
    for (const emp of SEED_EMPLOYERS) {
      const user = await User.create({ name: emp.name, email: emp.email, password: hashedPassword, role: "employer", company: emp.company });
      await EmployerProfile.findOneAndUpdate(
        { userId: user._id },
        { userId: user._id, company: emp.company, industry: emp.industry, location: emp.location, description: `${emp.company} is a leading ${emp.industry} company.`, size: "1000-5000 employees" },
        { upsert: true }
      );
      employerUserMap[emp.company] = user;
    }
    console.log(`Created ${SEED_EMPLOYERS.length} employer accounts`);

    for (const cand of SEED_CANDIDATES) {
      const user = await User.create({ name: cand.name, email: cand.email, password: hashedPassword, role: "candidate", phone: cand.phone, fieldOfInterest: cand.fieldOfInterest, experienceLevel: cand.experienceLevel, currentLocation: cand.currentLocation });
      await CandidateProfile.findOneAndUpdate(
        { userId: user._id },
        { userId: user._id, skills: cand.skills, location: cand.currentLocation, bio: `Experienced professional in ${cand.fieldOfInterest}` },
        { upsert: true }
      );
    }
    console.log(`Created ${SEED_CANDIDATES.length} candidate accounts`);

    const existingJobTitles = (await Job.find({ title: { $in: SEED_JOBS.map(j => j.title) } })).map(j => j.title);
    let jobCount = 0;
    for (const jobData of SEED_JOBS) {
      if (existingJobTitles.includes(jobData.title)) continue;
      const employer = employerUserMap[jobData.company] || Object.values(employerUserMap)[0];
      await Job.create({ ...jobData, employerId: employer._id, isActive: true, applicationCount: Math.floor(Math.random() * 200) + 10, views: Math.floor(Math.random() * 2000) + 100 });
      jobCount++;
    }
    console.log(`Created ${jobCount} job listings`);

    console.log("\nSeed complete!");
    console.log("Demo Accounts (password: Demo@1234):");
    console.log("  Admin:     admin@recruweb.in");
    console.log("  Candidate: priya@demo.recruweb.in");
    console.log("  Employer:  hr@tcs.recruweb.in");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err.message);
    process.exit(1);
  }
}

seed();
