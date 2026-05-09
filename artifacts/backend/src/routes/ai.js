import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import { protect, requireRole } from "../middleware/auth.js";
import CandidateProfile from "../models/CandidateProfile.js";
import Job from "../models/Job.js";

const router = Router();

function getAI() {
  if (!process.env.AI_INTEGRATIONS_GEMINI_BASE_URL) {
    throw Object.assign(new Error("AI not configured"), { status: 503 });
  }
  return new GoogleGenAI({
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
    apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  });
}

// POST /api/ai/chat — general job portal chatbot (public)
router.post("/chat", async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ message: "Message required" });

  const ai = getAI();
  const systemInstruction = `You are Recruweb's AI career assistant — helpful, professional, and encouraging.
Help with: job searching, resume writing, interview prep, career guidance, and using the Recruweb platform.
Focus on the Indian job market, especially Noida and Delhi NCR. Be concise and practical.`;

  const contents = [
    ...history.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
    { role: "user", parts: [{ text: message }] },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
    config: { systemInstruction, maxOutputTokens: 8192 },
  });

  res.json({ response: response.text });
});

// POST /api/ai/resume-analyze — score and analyze resume text
router.post("/resume-analyze", protect, requireRole("candidate"), async (req, res) => {
  const { resumeText, targetRole } = req.body;
  if (!resumeText) return res.status(400).json({ message: "Resume text required" });

  const ai = getAI();
  const prompt = `Analyze this resume for a "${targetRole || "professional"}" role. Respond ONLY with valid JSON matching this schema exactly:
{
  "score": <number 0-100>,
  "atsRating": "<Excellent|Good|Fair|Poor>",
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "improvements": ["<area1>", "<area2>", "<area3>"],
  "suggestions": ["<suggestion1>", "<suggestion2>", "<suggestion3>"],
  "summary": "<2-3 sentence overall assessment>"
}

Resume:
${resumeText}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { responseMimeType: "application/json", maxOutputTokens: 8192 },
  });

  let result;
  try { result = JSON.parse(response.text); }
  catch { result = { score: 0, error: "Parse error", raw: response.text?.slice(0, 200) }; }
  res.json(result);
});

// POST /api/ai/resume-generate — generate resume from profile
router.post("/resume-generate", protect, requireRole("candidate"), async (req, res) => {
  const { template = "modern" } = req.body;
  const profile = await CandidateProfile.findOne({ userId: req.user._id });
  if (!profile) return res.status(404).json({ message: "Profile not found. Please complete your profile first." });

  const ai = getAI();
  const templateDescriptions = {
    modern: "Modern Professional: clean sections, impactful bullet points, achievement-focused",
    ats: "ATS-Friendly Minimal: keyword-rich, simple formatting, optimized for applicant tracking systems",
    creative: "Creative Design: compelling narrative summary, showcasing personality and unique value proposition",
  };

  const prompt = `Create a complete, professional resume using the ${templateDescriptions[template] || templateDescriptions.modern} style.

Candidate Data:
- Full Name: ${req.user.name}
- Email: ${req.user.email}
- Phone: ${profile.phone || "Not provided"}
- Location: ${profile.location || "India"}
- Current Title: ${profile.currentTitle || "Professional"}
- Professional Summary: ${profile.bio || "Dedicated professional seeking new opportunities"}
- Key Skills: ${(profile.skills || []).join(", ") || "Listed below"}
- Education: ${profile.education || "Not provided"}
- Work Experience: ${profile.experience || "Not provided"}

Generate a polished, complete resume. Use strong action verbs, quantify achievements where possible, and make it compelling. Format it clearly with section headers.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { maxOutputTokens: 8192 },
  });

  res.json({ resume: response.text, template, generatedAt: new Date().toISOString() });
});

// POST /api/ai/job-match — AI-powered job recommendations for candidate
router.post("/job-match", protect, requireRole("candidate"), async (req, res) => {
  const profile = await CandidateProfile.findOne({ userId: req.user._id });
  if (!profile) return res.status(404).json({ message: "Complete your profile to get job matches" });

  const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 }).limit(30);
  if (!jobs.length) return res.json({ matches: [] });

  const ai = getAI();
  const prompt = `Match the top 6 most suitable jobs for this candidate. Return ONLY valid JSON array.

Candidate Profile:
- Title: ${profile.currentTitle || "Not set"}
- Skills: ${(profile.skills || []).join(", ") || "Not set"}
- Location: ${profile.location || "India"}
- About: ${profile.bio || "Seeking opportunities"}

Available Jobs:
${jobs.map(j => `ID:${j._id} | "${j.title}" at ${j.company} | ${j.location} | Skills: ${(j.skills || []).join(", ")}`).join("\n")}

Return JSON:
[{"jobId":"...","title":"...","company":"...","location":"...","matchScore":<50-100>,"reason":"<one sentence why this matches>"}]`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { responseMimeType: "application/json", maxOutputTokens: 8192 },
  });

  let matches;
  try { matches = JSON.parse(response.text); }
  catch { matches = []; }
  res.json({ matches });
});

// POST /api/ai/interview-prep — generate interview Q&A
router.post("/interview-prep", protect, async (req, res) => {
  const { jobTitle, jobDescription, count = 10 } = req.body;
  if (!jobTitle) return res.status(400).json({ message: "Job title required" });

  const ai = getAI();
  const prompt = `Generate ${Math.min(count, 15)} realistic interview questions with ideal answers for a "${jobTitle}" role.
${jobDescription ? `\nJob description: ${jobDescription}` : ""}

Return ONLY valid JSON array:
[{"question":"...","answer":"...","type":"behavioral|technical|situational","difficulty":"easy|medium|hard"}]`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { responseMimeType: "application/json", maxOutputTokens: 8192 },
  });

  let questions;
  try { questions = JSON.parse(response.text); }
  catch { questions = []; }
  res.json({ questions, jobTitle });
});

// POST /api/ai/rank-candidates — rank applicants for a job by fit score (employer only)
router.post("/rank-candidates", protect, requireRole("employer"), async (req, res) => {
  const { jobTitle, jobDescription, jobRequirements, jobSkills, candidates } = req.body;
  if (!jobTitle || !candidates?.length) return res.status(400).json({ message: "jobTitle and candidates required" });

  const ai = getAI();
  const prompt = `You are an expert technical recruiter. Rank the following candidates for the role of "${jobTitle}".

Job Description: ${jobDescription || "Not provided"}
Required Skills: ${Array.isArray(jobSkills) ? jobSkills.join(", ") : jobSkills || "Not specified"}
Requirements: ${jobRequirements || "Not provided"}

Candidates:
${candidates.map((c, i) => `
[${i + 1}] ID: ${c.id}
Name: ${c.name || "Unknown"}
Current Title: ${c.currentTitle || "N/A"}
Skills: ${Array.isArray(c.skills) ? c.skills.join(", ") : "None listed"}
Experience: ${c.experience || "Not provided"}
Education: ${c.education || "Not provided"}
Summary: ${c.bio || "No summary"}
`).join("\n")}

Return ONLY valid JSON array with all candidates ranked from best to worst fit:
[{"id":"<candidate_id>","score":<0-100>,"reason":"<one concise sentence explaining the match score>"}]`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { responseMimeType: "application/json", maxOutputTokens: 8192 },
  });

  let ranked;
  try { ranked = JSON.parse(response.text); }
  catch { ranked = candidates.map(c => ({ id: c.id, score: 50, reason: "Could not analyze" })); }

  res.json({ ranked, total: ranked.length });
});

export default router;

