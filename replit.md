# Recruweb

A full-stack recruitment platform connecting job seekers with employers, focused on Noida & Delhi NCR (Recruweb Resources Pvt. Ltd.).

## Run & Operate

- API server: `pnpm --filter @workspace/api-server run dev` (port 8080, mapped to `/api`)
- Frontend: `pnpm --filter @workspace/recruweb run dev` (port 21329, mapped to `/`)
- Both run automatically via Replit workflows

## Stack

- **Backend:** Node.js + Express 5, MongoDB + Mongoose, pure JavaScript (no TypeScript)
- **Frontend:** React + Vite, JSX only (no TypeScript), Tailwind + shadcn UI, wouter routing, TanStack Query
- **Auth:** JWT (stored in localStorage as `recruweb_token`), bcryptjs password hashing
- **Uploads:** Cloudinary private storage for resumes (signed URLs on demand)

## Where things live

- `artifacts/api-server/src/` — Express backend (JavaScript)
  - `app.js` — Express app setup, CORS, routes mount
  - `index.js` — Server entry point, MongoDB connect
  - `routes/` — auth, jobs, applications, candidates, employers
  - `models/` — User, Job, Application, CandidateProfile, EmployerProfile (Mongoose)
  - `middleware/auth.js` — JWT verify, requireRole
  - `lib/db.js` — MongoDB connection; `lib/cloudinary.js` — Cloudinary config; `lib/logger.js` — pino logger
- `artifacts/recruweb/src/` — React frontend (JSX)
  - `App.jsx` — Router + providers
  - `contexts/AuthContext.jsx` — JWT auth context
  - `lib/api.js` — fetch wrapper with auth headers
  - `pages/` — Home, Login, Register, Jobs, JobDetail, CandidateDashboard, CandidateProfile, EmployerDashboard, EmployerJobs, EmployerJobForm, JobApplications, EmployerProfile
  - `components/` — NavBar, JobCard, ProtectedRoute, shadcn UI

## Architecture decisions

- Express 5 handles async route errors natively — no `express-async-errors` needed
- Resumes stored as Cloudinary `private` type; employers get time-limited signed URLs only for applications to their own jobs
- JWT role system: `candidate` or `employer` — routes enforce this via `requireRole` middleware
- No TypeScript, no codegen, no Zod on the backend — plain JS with Mongoose validation
- Frontend uses `zod` + `react-hook-form` for client-side form validation only

## Product

- **Candidates:** Register, search/filter jobs, apply with cover letter, upload resume (PDF/DOCX), track application status
- **Employers:** Post/edit/delete jobs, view applicants per job, download resumes (signed URL), update application status (pending → reviewed → shortlisted → rejected → hired)
- **Public:** Browse all jobs, search by keyword/location/category/type, view job details

## User preferences

- JavaScript only for backend — no TypeScript files in api-server
- Express 5 (no express-async-errors)
- MongoDB (Mongoose), not PostgreSQL/Drizzle

## Gotchas

- Do NOT add `express-async-errors` — incompatible with Express 5
- Resume upload uses multer-storage-cloudinary with `type: "private"` — never public
- Employer resume access: signed URL generated in `GET /api/applications/job/:jobId` only if `req.user.role === "employer"` and job belongs to them
- All frontend files are `.jsx` — never `.tsx`
