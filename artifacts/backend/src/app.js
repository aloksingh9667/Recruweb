import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { logger } from "./lib/logger.js";
import router from "./routes/index.js";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

app.use(pinoHttp({ logger }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.use(
  "/admin",
  createProxyMiddleware({
    target: "http://127.0.0.1:3002",
    changeOrigin: true,
    ws: true,
    on: {
      error: (err, req, res) => {
        logger.warn({ err }, "Admin proxy error");
        if (res && !res.headersSent) {
          res.status(502).json({ message: "Admin panel unavailable" });
        }
      },
    },
  }),
);

app.use((err, req, res, next) => {
  logger.error({ err }, "Unhandled error");
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

export default app;
