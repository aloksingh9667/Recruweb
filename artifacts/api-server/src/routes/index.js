import { Router } from "express";
import authRouter from "./auth.js";
import jobsRouter from "./jobs.js";
import applicationsRouter from "./applications.js";
import candidatesRouter from "./candidates.js";
import employersRouter from "./employers.js";

const router = Router();

router.get("/healthz", (req, res) => res.json({ status: "ok" }));
router.use("/auth", authRouter);
router.use("/jobs", jobsRouter);
router.use("/applications", applicationsRouter);
router.use("/candidates", candidatesRouter);
router.use("/employers", employersRouter);

export default router;
