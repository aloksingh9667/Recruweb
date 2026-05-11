import { Router } from "express";
import authRouter from "./auth.js";
import jobsRouter from "./jobs.js";
import applicationsRouter from "./applications.js";
import candidatesRouter from "./candidates.js";
import employersRouter from "./employers.js";
import adminRouter from "./admin.js";
import aiRouter from "./ai.js";
import publicRouter from "./public.js";

const router = Router();

router.get("/healthz", (req, res) => res.json({ status: "ok", service: "Recruweb Backend" }));
router.use("/auth", authRouter);
router.use("/jobs", jobsRouter);
router.use("/applications", applicationsRouter);
router.use("/candidates", candidatesRouter);
router.use("/employers", employersRouter);
router.use("/admin", adminRouter);
router.use("/ai", aiRouter);
router.use("/", publicRouter);

export default router;
