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
    model: "gemini-2.0-flash-lite",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { maxOutputTokens: maxTokens },
  });
  return response.text;
}

async function geminiChat(contents, systemInstruction, maxTokens = 512) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-lite",
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

// POST /api/ai/resume-improve
router.post("/resume-improve", async (req, res) => {
  const { fullName, jobTitle, summary, experience = [], skills } = req.body;

  const expText = experience
    .filter(e => e.company || e.position)
    .map((e, i) => `Job ${i + 1}: ${e.position || "Role"} at ${e.company || "Company"} (${e.duration || ""})\nDescription: ${e.description || "(none)"}`)
    .join("\n\n");

  const prompt = `You are an expert resume writer. Rewrite the following resume content to be more impactful, professional, and ATS-optimized. Use strong action verbs, quantify achievements where possible, and keep it concise.

Name: ${fullName || "Candidate"}
Target Role: ${jobTitle || "Professional"}
Current Summary: ${summary || "(none)"}
Skills: ${skills || "(none)"}

Work Experience:
${expText || "(none provided)"}

Return ONLY valid JSON in this exact shape — no markdown, no explanation:
{
  "summary": "<improved 2-3 sentence professional summary>",
  "jobTitle": "<improved or same job title/headline>",
  "experience": [
    { "description": "<improved bullet-point style description for Job 1>" },
    { "description": "<improved description for Job 2>" }
  ]
}

Rules:
- Keep experience array in the same order as input
- If no experience provided, return empty array for experience
- Summary must be punchy and tailored to the target role
- Use present tense for current role, past tense for others`;

  const raw = await gemini(prompt, 1000);

  const fallback = {
    summary: summary || "Experienced professional with strong technical skills and a track record of delivering results.",
    jobTitle: jobTitle || "",
    experience: experience.map(e => ({ description: e.description || "" })),
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
router.post("/interview-prep", async (req, res) => {
  const { jobTitle, jobDescription, count = 10, company } = req.body;
  if (!jobTitle) return res.status(400).json({ message: "Job title required" });

  const n = Math.min(Math.max(parseInt(count) || 10, 3), 20);
  const companyCtx = company ? ` at ${company}` : "";
  const descCtx = jobDescription ? `\n\nJob Description:\n${jobDescription.slice(0, 1500)}` : "";

  const prompt = `You are a senior HR and technical interview expert. Generate exactly ${n} realistic, high-quality interview questions for a "${jobTitle}"${companyCtx} role.${descCtx}

Mix question types: behavioral, technical, and situational. Vary difficulty across easy, medium, and hard.

Return ONLY valid JSON — no markdown, no explanation:
{
  "questions": [
    {
      "question": "<full interview question>",
      "type": "<behavioral|technical|situational>",
      "difficulty": "<easy|medium|hard>",
      "answer": "<detailed ideal answer in 3-5 sentences using STAR method where applicable>",
      "tip": "<one-line coaching tip for answering this question>"
    }
  ],
  "tips": ["<interview tip 1>", "<interview tip 2>", "<interview tip 3>", "<interview tip 4>"],
  "overview": "<2-3 sentence overview of what to expect in a ${jobTitle} interview>"
}

Rules:
- Generate exactly ${n} questions
- Mix: ~40% technical, ~40% behavioral, ~20% situational
- Make answers detailed and actionable, not generic
- Tips should be practical and specific to the role`;

  const raw = await gemini(prompt, 3000);

  const fallback = {
    questions: Array.from({ length: n }, (_, i) => ({
      question: `Question ${i + 1}: Tell us about your experience relevant to this ${jobTitle} role.`,
      type: i % 3 === 0 ? "behavioral" : i % 3 === 1 ? "technical" : "situational",
      difficulty: i % 3 === 0 ? "easy" : i % 3 === 1 ? "medium" : "hard",
      answer: "Structure your answer using the STAR method: Situation, Task, Action, Result.",
      tip: "Take a moment to think before answering.",
    })),
    tips: [
      "Research the company thoroughly before the interview",
      "Prepare 2-3 concrete examples from your past experience",
      "Ask thoughtful questions at the end of each round",
      "Practice your answers out loud to build confidence",
    ],
    overview: `${jobTitle} interviews typically include a mix of technical and behavioral rounds. Prepare concrete examples using the STAR method.`,
  };

  res.json(parseJSON(raw, fallback));
});

// POST /api/ai/resume-tips-by-role
router.post("/resume-tips-by-role", async (req, res) => {
  const { category } = req.body;
  if (!category) return res.status(400).json({ message: "Category required" });

  const prompt = `You are an expert Indian recruitment consultant. Give highly specific, actionable resume tips for a candidate applying to "${category}" jobs in India.

Return ONLY valid JSON — no markdown, no explanation:
{
  "headline": "<short motivating headline for this category, e.g. 'Stand Out in IT/Software Roles'>",
  "tips": [
    { "title": "<short tip title>", "desc": "<1-2 sentence actionable advice specific to ${category} roles in India>" },
    { "title": "<short tip title>", "desc": "<1-2 sentence actionable advice>" },
    { "title": "<short tip title>", "desc": "<1-2 sentence actionable advice>" },
    { "title": "<short tip title>", "desc": "<1-2 sentence actionable advice>" },
    { "title": "<short tip title>", "desc": "<1-2 sentence actionable advice>" }
  ],
  "keywords": ["<top ATS keyword for ${category}>", "<keyword>", "<keyword>", "<keyword>", "<keyword>", "<keyword>"],
  "doList": ["<one specific DO for ${category} resume>", "<DO>", "<DO>"],
  "dontList": ["<one specific DON'T for ${category} resume>", "<DON'T>", "<DON'T>"]
}

Rules:
- Tips must be specific to "${category}" industry — not generic
- Keywords must be real ATS terms recruiters search for in this category
- Indian job market context (mention Indian companies/platforms where relevant)
- Keep each tip desc under 30 words`;

  const fallbacks = {
    "IT/Software": {
      headline: "Get Shortlisted for Top IT/Software Roles",
      tips: [
        { title: "Lead with a Tech Stack summary", desc: "Put your core languages and frameworks (React, Node.js, Python, AWS) prominently at the top — recruiters scan for these first." },
        { title: "Quantify project impact", desc: "Replace vague phrases with metrics: 'Reduced API latency by 40%' beats 'Improved performance'." },
        { title: "List GitHub / portfolio link", desc: "Add a GitHub profile or live project URL — MNCs and startups both verify it before calling." },
        { title: "Match the JD keywords exactly", desc: "Copy exact skill names from the job description (e.g. 'REST APIs', not just 'APIs') to pass ATS filters." },
        { title: "Separate 'Projects' from 'Experience'", desc: "For freshers or career switchers, a dedicated Projects section with tech used and outcome beats a thin experience section." },
      ],
      keywords: ["REST API", "Agile", "CI/CD", "Microservices", "Cloud (AWS/GCP/Azure)", "Git"],
      doList: ["List certifications (AWS, Google Cloud, Cisco)", "Mention SDLC methodologies you've used", "Include open-source contributions"],
      dontList: ["List outdated technologies like VB6 or Flash", "Use one resume for all roles — tailor per JD", "Skip version numbers (write 'React 18', not just 'React')"],
    },
    "Sales": {
      headline: "Craft a Sales Resume That Closes Interviews",
      tips: [
        { title: "Lead with revenue numbers", desc: "State your targets and achievement: '₹1.2 Cr quarterly target, achieved 118%' — hiring managers look for this immediately." },
        { title: "Name the industries you've sold into", desc: "B2B SaaS, FMCG, pharma, real estate — specify your sector experience so recruiters know your domain fit." },
        { title: "Include CRM tools you've used", desc: "Mention Salesforce, Zoho CRM, or HubSpot by name — companies filter for tool experience." },
        { title: "Show promotions or incentive awards", desc: "List 'Top Performer Q3 FY24' or 'President's Club' — these validate your track record without needing references." },
        { title: "Keep it to one page if under 5 years", desc: "Sales resumes should be punchy; a long resume suggests poor communication skills — which is ironic for a sales role." },
      ],
      keywords: ["Revenue growth", "Lead generation", "Pipeline management", "B2B/B2C", "CRM", "Quota attainment"],
      doList: ["Quantify every role with numbers", "Mention territory or region managed", "List key accounts won"],
      dontList: ["Use passive language like 'responsible for sales'", "Skip incentive/bonus achievements", "Omit channel (inside sales vs field sales)"],
    },
  };

  const raw = await gemini(prompt, 1000);
  const fallback = fallbacks[category] || {
    headline: `Resume Tips for ${category} Roles`,
    tips: [
      { title: "Tailor your resume per JD", desc: "Copy exact keywords from the job description to pass ATS filters used by top Indian employers." },
      { title: "Lead with a strong summary", desc: "Write 2-3 lines that match your profile to the role — recruiters spend 6 seconds on first scan." },
      { title: "Quantify your achievements", desc: "Replace 'managed a team' with 'managed a team of 8, delivered project 2 weeks ahead of schedule'." },
      { title: "Keep formatting clean and ATS-safe", desc: "Avoid tables, columns, and images — many Indian company ATS systems can't parse them correctly." },
      { title: "Add a LinkedIn and relevant certifications", desc: "Include your LinkedIn URL and any industry certifications to boost credibility with HR teams." },
    ],
    keywords: ["Results-driven", "Cross-functional", "Stakeholder management", "Process improvement", "Team leadership", "KPI"],
    doList: ["One-page resume if under 5 years experience", "Use bullet points, not paragraphs", "Include location and notice period"],
    dontList: ["Use a photo or date of birth (not required in India for most roles)", "Use jargon without context", "Ignore spelling and grammar"],
  };

  res.json({ category, ...parseJSON(raw, fallback) });
});

export default router;
