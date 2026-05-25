import { UPLOAD_DIR } from "./config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { authRouter } from "./routes/auth";
import { projectsRouter } from "./routes/projects";
import { releasesRouter } from "./routes/releases";
import { filesRouter } from "./routes/files";
import { statsRouter } from "./routes/stats";
import { adminRouter } from "./routes/admin";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000", credentials: true }));
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/releases", releasesRouter);
app.use("/api/files", filesRouter);
app.use("/api/stats", statsRouter);
app.use("/api/admin", adminRouter);

app.use("/uploads", express.static(UPLOAD_DIR));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ ok: false, error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
