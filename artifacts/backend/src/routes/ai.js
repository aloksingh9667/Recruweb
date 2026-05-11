import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import { protect, requireRole } from "../middleware/auth.js";
import CandidateProfile from "../models/CandidateProfile.js";
import { logger } from "../lib/logger.js";

const router = Router();

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
  const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
  if (!apiKey) throw Object.assign(new Error("Gemini API key not configured"), { status: 503 });
  const opts = { apiKey };
  if (baseUrl) opts.baseUrl = baseUrl;
  return new GoogleGenAI(opts);
}

async function gemini(prompt, maxTokens = 512) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { maxOutputTokens: maxTokens },
  });
  return response.text;
}

async function geminiChat(contents, systemInstruction, maxTokens = 512) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents,
    config: { systemInstruction, maxOutputTokens: maxTokens },
  });
  return response.text;
}

function parseJSON(text, fallback) {
  try {
    return JSON.parse(text.trim().replace(/```json|```/g, "").trim());
  } catch {
    return fallback;
  }
}

function fallbackReply(msg) {
  const m = (msg || "").toLowerCase();
  if (m.includes("resume") || m.includes("cv"))
    return "A strong resume should highlight your skills, experience, and achievements. Keep it to 1-2 pages, use action verbs, and tailor it to each job description.";
  if (m.includes("interview"))
    return "Prepare for interviews by researching the company, practicing common HR and technical questions, and having concrete examples ready using the STAR method.";
  if (m.includes("salary") || m.includes("ctc") || m.includes("package"))
    return "Salary negotiation tip: research industry benchmarks on platforms like LinkedIn and AmbitionBox, then confidently quote a range based on your skills and experience.";
  if (m.includes("fresher") || m.includes("fresh graduate"))
    return "As a fresher, focus on building projects, internships, and certifications. Apply on Recruweb for entry-level roles and keep your profile complete for better visibility.";
  if (m.includes("job") || m.includes("work") || m.includes("hiring") || m.includes("vacancy"))
    return "Browse our Jobs page to find the latest openings. Use filters for location, experience, and salary to narrow your search!";
  return "Hi! I'm here to help with your career — jobs, resumes, interview prep, and more. What would you like to know?";
}

// POST /api/ai/chat
router.post("/chat", async (req, res) => {
  const { message, history = [], systemHint } = req.body;
  if (!message) return res.status(400).json({ message: "Message required" });

  const systemInstruction = systemHint || `You are Recruweb's AI career assistant — helpful, professional, and friendly. Help with: job searching, resume tips, interview prep, career guidance, and using Recruweb. Focus on Indian job market. Be concise (max 120 words). Use bullet points for lists.`;

  const contents = [
    ...history.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
    { role: "user", parts: [{ text: message }] },
  ];

  let reply;
  try {
    reply = await geminiChat(contents, systemInstruction, 400);
  } catch (err) {
    logger.warn({ err }, "Gemini chat failed, using fallback reply");
    reply = fallbackReply(message);
  }

  let suggestions = ["Show me jobs in my field", "How to improve my resume?", "Interview tips for freshers?"];
  try {
    const raw = await gemini(
      `Given this job seeker conversation, suggest exactly 3 short follow-up questions they might ask next. Return ONLY a JSON array of 3 strings (max 7 words each). User asked: "${message.slice(0, 100)}"`,
      100
    );
    const parsed = parseJSON(raw, []);
    if (Array.isArray(parsed) && parsed.length >= 3) suggestions = parsed.slice(0, 3).map(s => String(s).trim());
  } catch {}

  res.json({ response: reply, suggestions });
});

// POST /api/ai/resume-analyze
router.post("/resume-analyze", protect, requireRole("candidate"), async (req, res) => {
  const { resumeText, targetRole } = req.body;
  if (!resumeText) return res.status(400).json({ message: "Resume text required" });

  const raw = await gemini(`Analyze this resume for a "${targetRole || "professional"}" role. Respond ONLY with valid JSON:
{"score":<0-100>,"atsRating":"<Excellent|Good|Fair|Poor>","strengths":["...","...","..."],"improvements":["...","...","..."],"suggestions":["...","...","..."],"summary":"<2-3 sentences>"}

Resume: ${resumeText.slice(0, 3000)}`, 800);

  const fallback = {
    score: 65, atsRating: "Good",
    strengths: ["Clear formatting", "Relevant experience", "Contact info present"],
    improvements: ["Add measurable achievements", "Include target role keywords", "Expand skills section"],
    suggestions: ["Use action verbs", "Quantify accomplishments", "Tailor per job"],
    summary: "Resume looks decent. With minor improvements it can be much more competitive.",
  };
  res.json(parseJSON(raw, fallback));
});

// POST /api/ai/job-match
router.post("/job-match", protect, requireRole("candidate"), async (req, res) => {
  const { jobDescription, skills = [], experience = "" } = req.body;
  if (!jobDescription) return res.status(400).json({ message: "Job description required" });

  const profile = await CandidateProfile.findOne({ userId: req.user._id });
  const candidateSkills = skills.length ? skills : (profile?.skills || []);

  const raw = await gemini(`Compare candidate with job. Return ONLY valid JSON:
{"matchScore":<0-100>,"matchingSkills":["..."],"missingSkills":["..."],"recommendation":"<2 sentences>","tips":["...","...","..."]}

Candidate skills: ${candidateSkills.join(", ")}
Experience: ${experience || "Not specified"}
Job: ${jobDescription.slice(0, 1200)}`, 512);

  res.json(parseJSON(raw, { matchScore: 70, matchingSkills: candidateSkills.slice(0, 3), missingSkills: [], recommendation: "Good fit for this role.", tips: ["Highlight relevant skills", "Prepare for technical round", "Research the company"] }));
});

// POST /api/ai/interview-prep
router.post("/interview-prep", protect, async (req, res) => {
  const { company, role, type = "technical" } = req.body;
  if (!company || !role) return res.status(400).json({ message: "Company and role required" });

  const raw = await gemini(`Generate ${type} interview prep for ${role} at ${company}. Return ONLY valid JSON:
{"questions":[{"question":"...","answer":"...","difficulty":"easy|medium|hard"}],"tips":["...","...","..."],"companyInsights":"<2-3 sentences>"}
Include 5 questions.`, 1000);

  res.json(parseJSON(raw, {
    questions: [{ question: `Tell me about yourself and why ${company}?`, answer: "Structure around experience, skills, and fit.", difficulty: "easy" }],
    tips: ["Research the company", "Practice problem-solving", "Prepare questions to ask"],
    companyInsights: `${company} values innovation and teamwork. Expect technical + HR rounds.`,
  }));
});

export default router;
