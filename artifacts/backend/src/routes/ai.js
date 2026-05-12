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
    model: "gemini-1.5-flash-8b",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { maxOutputTokens: maxTokens },
  });
  return response.text;
}

async function geminiChat(contents, systemInstruction, maxTokens = 512) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash-8b",
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

  if (m.includes("resume") || m.includes("cv")) {
    return `Here are key resume tips for Indian job seekers:\n\n• **1–2 pages max** — keep it concise and relevant\n• **Strong Summary** — write 2-3 lines matching the job role\n• **Quantify achievements** — "Reduced costs by 30%" beats "Improved efficiency"\n• **ATS keywords** — copy exact terms from the job description\n• **Skills section** — list technical + soft skills clearly\n• **No photo or DOB** needed for most Indian companies\n\nWant tips for a specific field like IT, Sales, or HR?`;
  }

  if (m.includes("interview")) {
    return `Interview tips to crack your next round:\n\n• **Research the company** — know their product, culture, recent news\n• **STAR method** — Situation, Task, Action, Result for behavioral questions\n• **Common questions** — "Tell me about yourself", "Why this company?", "Strengths/Weaknesses"\n• **Technical prep** — revise fundamentals + practice on paper\n• **Ask questions** — always prepare 2–3 questions for the interviewer\n• **Dress formally** for first rounds even if the company is casual\n\nWant mock questions for a specific role?`;
  }

  if (m.includes("salary") || m.includes("ctc") || m.includes("package") || m.includes("negotiate")) {
    return `Salary negotiation tips for Indian professionals:\n\n• **Research benchmarks** — check AmbitionBox, LinkedIn, Glassdoor for your role + city\n• **Quote a range** — give a band (e.g. ₹8–10 LPA) based on your skills\n• **Never quote first** — let the employer name a number if possible\n• **Consider the full package** — bonus, ESOPs, health insurance add to CTC\n• **Use offers as leverage** — a competing offer is the strongest negotiation tool\n• **Be confident, not aggressive** — frame it as seeking fair market value`;
  }

  if (m.includes("fresher") || m.includes("no experience") || m.includes("fresh graduate") || m.includes("first job")) {
    return `Tips for freshers landing their first job:\n\n• **Build projects** — 2–3 solid personal/college projects beat a blank resume\n• **Certifications** — Google, AWS, Coursera, NPTEL certs add credibility\n• **LinkedIn profile** — keep it updated with a professional photo and skills\n• **Campus placements** — use your college's placement cell actively\n• **Entry-level platforms** — Recruweb, Internshala, Naukri Fresh for fresher-friendly roles\n• **Apply in bulk** — at least 10–15 applications per week\n\nWhat field are you looking for jobs in?`;
  }

  if (m.includes("wfh") || m.includes("work from home") || m.includes("remote")) {
    return `Work from home jobs are very popular! Tips:\n\n• **Check our Jobs page** — filter by "Remote" or "WFH" job type\n• **Top WFH fields** — IT/Software, Digital Marketing, Content Writing, Data Entry, Customer Support\n• **Reliable setup** — good internet + a quiet space is essential\n• **Show WFH experience** — mention any remote internships/projects on your resume\n• **Time management** — remote employers value self-starters who deliver on time`;
  }

  if (m.includes("job") || m.includes("vacancy") || m.includes("opening") || m.includes("hiring") || m.includes("career")) {
    return `Ready to find your next opportunity?\n\n• **Browse Jobs** — visit our Jobs page for 1000s of live listings\n• **Use filters** — search by location, experience, salary, and category\n• **Apply early** — fresh jobs get more attention in first 48 hours\n• **Complete your profile** — employers prefer candidates with 100% profiles\n• **Set job alerts** — get notified when new matching jobs are posted\n\nTell me what type of job or location you're looking for and I'll help!`;
  }

  if (m.includes("noida") || m.includes("delhi") || m.includes("ncr") || m.includes("gurgaon") || m.includes("faridabad")) {
    return `Noida & Delhi NCR is one of India's biggest job markets! 🏙️\n\n• **Top sectors** — IT/Software, BPO, Finance, FMCG, Manufacturing\n• **Popular hiring zones** — Sector 62, 63, 125 (Noida), Cyber City (Gurgaon)\n• **Average IT salary** — ₹4–15 LPA depending on experience\n• **Commute** — many companies offer shuttle + metro-friendly offices\n\nBrowse our Jobs page with "Noida" or "Delhi" filter to see all openings!`;
  }

  return `Hi! I'm your Recruweb AI career assistant. I can help you with:\n\n• Finding jobs in India\n• Resume writing tips\n• Interview preparation\n• Salary guidance\n• Career advice for freshers\n\nWhat would you like to know? Type your question or click a suggestion below!`;
}

function fallbackSuggestions(msg) {
  const m = (msg || "").toLowerCase();
  if (m.includes("resume") || m.includes("cv"))
    return ["Resume tips for IT jobs", "How to write a summary?", "ATS-friendly resume format"];
  if (m.includes("interview"))
    return ["Common HR interview questions", "STAR method examples", "Technical interview tips"];
  if (m.includes("salary") || m.includes("ctc"))
    return ["How to negotiate salary?", "Average IT salary in Noida", "When to ask for a raise?"];
  if (m.includes("fresher") || m.includes("first job"))
    return ["Best jobs for freshers", "How to build a portfolio?", "Certifications that help freshers"];
  return ["Find jobs in my city", "How to write a good resume?", "Interview tips for IT roles"];
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

  let suggestions = fallbackSuggestions(message);
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

  const fallback = {
    score: 65, atsRating: "Good",
    strengths: ["Clear formatting", "Relevant experience listed", "Contact information present"],
    improvements: ["Add measurable achievements with numbers", "Include role-specific keywords", "Expand skills section"],
    suggestions: ["Use action verbs to start bullet points", "Quantify accomplishments (%, ₹, numbers)", "Tailor resume for each job"],
    summary: "Your resume has a solid foundation. Adding metrics and job-specific keywords will make it significantly more competitive.",
  };

  try {
    const raw = await gemini(`Analyze this resume for a "${targetRole || "professional"}" role. Respond ONLY with valid JSON:
{"score":<0-100>,"atsRating":"<Excellent|Good|Fair|Poor>","strengths":["...","...","..."],"improvements":["...","...","..."],"suggestions":["...","...","..."],"summary":"<2-3 sentences>"}

Resume: ${resumeText.slice(0, 3000)}`, 800);
    res.json(parseJSON(raw, fallback));
  } catch (err) {
    logger.warn({ err }, "Gemini resume-analyze failed, using fallback");
    res.json(fallback);
  }
});

// POST /api/ai/resume-improve
router.post("/resume-improve", async (req, res) => {
  const { fullName, jobTitle, summary, experience = [], skills } = req.body;

  const fallback = {
    summary: summary || "Experienced professional with strong technical skills and a proven track record of delivering results in fast-paced environments.",
    jobTitle: jobTitle || "",
    experience: experience.map(e => ({ description: e.description || "" })),
  };

  try {
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
    res.json(parseJSON(raw, fallback));
  } catch (err) {
    logger.warn({ err }, "Gemini resume-improve failed, using fallback");
    res.json(fallback);
  }
});

// POST /api/ai/job-match
router.post("/job-match", protect, requireRole("candidate"), async (req, res) => {
  const { jobDescription, skills = [], experience = "" } = req.body;
  if (!jobDescription) return res.status(400).json({ message: "Job description required" });

  const profile = await CandidateProfile.findOne({ userId: req.user._id });
  const candidateSkills = skills.length ? skills : (profile?.skills || []);

  const fallback = {
    matchScore: 70,
    matchingSkills: candidateSkills.slice(0, 3),
    missingSkills: [],
    recommendation: "Your profile looks like a good fit. Complete your profile with more skills to get a precise match score.",
    tips: ["Highlight relevant skills in your resume", "Prepare for a technical screening round", "Research the company before applying"],
  };

  try {
    const raw = await gemini(`Compare candidate with job. Return ONLY valid JSON:
{"matchScore":<0-100>,"matchingSkills":["..."],"missingSkills":["..."],"recommendation":"<2 sentences>","tips":["...","...","..."]}

Candidate skills: ${candidateSkills.join(", ")}
Experience: ${experience || "Not specified"}
Job: ${jobDescription.slice(0, 1200)}`, 512);
    res.json(parseJSON(raw, fallback));
  } catch (err) {
    logger.warn({ err }, "Gemini job-match failed, using fallback");
    res.json(fallback);
  }
});

// POST /api/ai/interview-prep
router.post("/interview-prep", async (req, res) => {
  const { jobTitle, jobDescription, count = 10, company } = req.body;
  if (!jobTitle) return res.status(400).json({ message: "Job title required" });

  const n = Math.min(Math.max(parseInt(count) || 10, 3), 20);
  const companyCtx = company ? ` at ${company}` : "";
  const descCtx = jobDescription ? `\n\nJob Description:\n${jobDescription.slice(0, 1500)}` : "";

  const fallback = {
    questions: [
      { question: `Tell me about yourself and why you're applying for the ${jobTitle} role.`, type: "behavioral", difficulty: "easy", answer: "Structure your answer: current role → key achievements → why this opportunity. Keep it under 2 minutes.", tip: "Practice out loud before the interview." },
      { question: `What relevant experience do you have for this ${jobTitle} position?`, type: "behavioral", difficulty: "easy", answer: "Use the STAR method: describe a specific Situation, your Task, the Actions you took, and the Result achieved.", tip: "Prepare 2–3 concrete examples in advance." },
      { question: "Describe a challenging project and how you handled it.", type: "behavioral", difficulty: "medium", answer: "Focus on your decision-making process, teamwork, and what you learned. End with a positive outcome.", tip: "Pick a real challenge — authenticity resonates with interviewers." },
      { question: "Where do you see yourself in 3–5 years?", type: "behavioral", difficulty: "easy", answer: "Show ambition aligned with the company's growth. Mention skills you want to develop and leadership you aspire to.", tip: "Research the company's growth trajectory before answering." },
      { question: "Why do you want to work at our company?", type: "behavioral", difficulty: "medium", answer: "Mention specific things: the company's product, culture, mission, or recent achievement. Show you've done research.", tip: "Check LinkedIn, Glassdoor, and the company website beforehand." },
      { question: "What are your greatest strengths?", type: "behavioral", difficulty: "easy", answer: "Pick 2–3 strengths directly relevant to the role. Back each with a brief example.", tip: "Don't just list — demonstrate with a real-life example." },
      { question: "What is your biggest weakness?", type: "behavioral", difficulty: "medium", answer: "Choose a real but manageable weakness, explain the impact, and — critically — what you're doing to improve it.", tip: "Avoid clichés like 'I'm a perfectionist'." },
      { question: "How do you handle tight deadlines or pressure?", type: "situational", difficulty: "medium", answer: "Describe your prioritization approach: list tasks, estimate effort, communicate blockers early, and deliver incrementally.", tip: "Give a specific past example to make this credible." },
      { question: "Tell me about a time you worked in a team and faced conflict.", type: "behavioral", difficulty: "hard", answer: "Use STAR: describe the conflict objectively, your role in resolving it, and the positive outcome for the team.", tip: "Focus on your actions, not blaming others." },
      { question: "Do you have any questions for us?", type: "behavioral", difficulty: "easy", answer: "Always ask! Good questions: role growth path, team structure, biggest challenges, what success looks like in 6 months.", tip: "Prepare at least 3 questions — it shows genuine interest." },
    ].slice(0, n),
    tips: [
      "Research the company's products, mission, and recent news before the interview",
      "Prepare 3–5 examples from past experience using the STAR method",
      "Dress formally even for video calls — first impressions matter",
      "Arrive 10 minutes early or join the video call 2 minutes before scheduled time",
    ],
    overview: `${jobTitle} interviews typically include HR screening, technical rounds, and a managerial discussion. Prepare concrete examples and brush up on core concepts.`,
  };

  try {
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
}`;

    const raw = await gemini(prompt, 3000);
    res.json(parseJSON(raw, fallback));
  } catch (err) {
    logger.warn({ err }, "Gemini interview-prep failed, using fallback");
    res.json(fallback);
  }
});

const matchCache = new Map();
const MATCH_TTL = 15 * 60 * 1000;

// POST /api/ai/match-score
router.post("/match-score", protect, requireRole("candidate"), async (req, res) => {
  const { jobId } = req.body;
  if (!jobId) return res.status(400).json({ message: "jobId required" });

  const userId = req.user.id || req.user._id;
  const cacheKey = `${userId}:${jobId}`;

  const cached = matchCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < MATCH_TTL) {
    return res.json({ ...cached.data, cached: true });
  }

  const [Job, CandidateProfileModel] = await Promise.all([
    import("../models/Job.js").then(m => m.default),
    import("../models/CandidateProfile.js").then(m => m.default),
  ]);

  const [job, profile] = await Promise.all([
    Job.findById(jobId).select("title skills experienceRequired category requirements").lean(),
    CandidateProfileModel.findOne({ userId }).select("skills experience currentTitle education").lean(),
  ]);

  if (!job) return res.status(404).json({ message: "Job not found" });

  const fallback = {
    score: 55,
    strengths: ["Some relevant skills match the role", "Experience level is appropriate"],
    gaps: ["Complete your profile for accurate scoring", "Add more skills to improve match"],
    verdict: "Update your profile to get a precise score",
  };

  try {
    const jobSkills  = (job.skills || []).slice(0, 8).join(", ") || "not specified";
    const candSkills = (profile?.skills || []).slice(0, 10).join(", ") || "not specified";
    const candExp    = profile?.experience || "fresher";
    const candTitle  = profile?.currentTitle || "candidate";
    const jobExp     = job.experienceRequired || "any";

    const prompt =
      `Job title: "${job.title}". Required skills: ${jobSkills}. Exp needed: ${jobExp}.\n` +
      `Candidate skills: ${candSkills}. Candidate exp: ${candExp}. Current title: ${candTitle}.\n` +
      `Give match score 0-100 and brief analysis. Return ONLY JSON, no markdown:\n` +
      `{"score":N,"strengths":["max 10 words","max 10 words"],"gaps":["max 10 words","max 10 words"],"verdict":"max 12 words"}`;

    const raw = await gemini(prompt, 150);
    const data = parseJSON(raw, fallback);
    if (typeof data.score === "number") data.score = Math.max(0, Math.min(100, data.score));
    matchCache.set(cacheKey, { ts: Date.now(), data });
    res.json(data);
  } catch (err) {
    logger.warn({ err }, "Gemini match-score failed, using fallback");
    res.json(fallback);
  }
});

// POST /api/ai/cover-letter
router.post("/cover-letter", protect, requireRole("candidate"), async (req, res) => {
  const { jobId } = req.body;
  if (!jobId) return res.status(400).json({ message: "jobId required" });

  const userId = req.user.id || req.user._id;
  const [Job, User] = await Promise.all([
    import("../models/Job.js").then(m => m.default),
    import("../models/User.js").then(m => m.default),
  ]);

  const [job, profile, user] = await Promise.all([
    Job.findById(jobId).select("title company category skills experienceRequired").lean(),
    CandidateProfile.findOne({ userId }).select("skills experience currentTitle").lean(),
    User.findById(userId).select("name").lean(),
  ]);

  if (!job) return res.status(404).json({ message: "Job not found" });

  const name       = user?.name || "the applicant";
  const candTitle  = profile?.currentTitle || "professional";
  const candSkills = (profile?.skills || []).slice(0, 5).join(", ") || "various skills";
  const candExp    = profile?.experience ? ` with ${profile.experience} experience` : "";
  const jobSkills  = (job.skills || []).slice(0, 3).join(", ");

  const fallbackLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the ${job.title} position at ${job.company}. With my background as a ${candTitle}${candExp} and expertise in ${candSkills}, I am confident I can make a meaningful contribution to your team.

Throughout my career, I have consistently delivered results by applying my skills effectively and collaborating with cross-functional teams. I am particularly drawn to ${job.company} because of its reputation for innovation and growth in the industry.

I would welcome the opportunity to discuss how my experience aligns with your requirements. Thank you for considering my application.

Warm regards,
${name}`;

  try {
    const prompt =
      `Write a professional 3-paragraph cover letter for ${name}, a ${candTitle}${candExp}.\n` +
      `Role: "${job.title}" at ${job.company}. My skills: ${candSkills}.${jobSkills ? ` Role needs: ${jobSkills}.` : ""}\n` +
      `Indian professional tone. Under 140 words. Only the letter body — no address/date/subject.`;

    const text = await gemini(prompt, 280);
    res.json({ coverLetter: (text || "").trim() });
  } catch (err) {
    logger.warn({ err }, "Gemini cover-letter failed, using fallback");
    res.json({ coverLetter: fallbackLetter.trim() });
  }
});

// POST /api/ai/resume-tips-by-role
router.post("/resume-tips-by-role", async (req, res) => {
  const { category } = req.body;
  if (!category) return res.status(400).json({ message: "Category required" });

  const builtinFallbacks = {
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

  const genericFallback = {
    headline: `Stand Out in ${category} Roles`,
    tips: [
      { title: "Tailor your resume per JD", desc: "Copy exact keywords from the job description to pass ATS filters used by top Indian employers." },
      { title: "Lead with a strong summary", desc: "Write 2-3 lines that match your profile to the role — recruiters spend 6 seconds on first scan." },
      { title: "Quantify your achievements", desc: "Replace 'managed a team' with 'managed a team of 8, delivered project 2 weeks ahead of schedule'." },
      { title: "Keep formatting clean and ATS-safe", desc: "Avoid tables, columns, and images — many Indian company ATS systems can't parse them correctly." },
      { title: "Add LinkedIn and certifications", desc: "Include your LinkedIn URL and any industry certifications to boost credibility with HR teams." },
    ],
    keywords: ["Results-driven", "Cross-functional", "Stakeholder management", "Process improvement", "Team leadership", "KPI"],
    doList: ["One-page resume if under 5 years experience", "Use bullet points, not paragraphs", "Include location and notice period"],
    dontList: ["Use a photo or date of birth (not required in India for most roles)", "Use jargon without context", "Ignore spelling and grammar"],
  };

  const fallback = builtinFallbacks[category] || genericFallback;

  try {
    const prompt = `You are an expert Indian recruitment consultant. Give highly specific, actionable resume tips for a candidate applying to "${category}" jobs in India.

Return ONLY valid JSON — no markdown, no explanation:
{
  "headline": "<short motivating headline for this category>",
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
}`;

    const raw = await gemini(prompt, 1000);
    res.json({ category, ...parseJSON(raw, fallback) });
  } catch (err) {
    logger.warn({ err }, "Gemini resume-tips-by-role failed, using fallback");
    res.json({ category, ...fallback });
  }
});

export default router;
