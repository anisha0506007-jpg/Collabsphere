import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db.js";

import projectRoutes from "./routes/projectRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import geminiRoutes from "./routes/geminiRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import shareRoutes from "./routes/shareRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(express.json({ limit: "1mb" }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to CollabSphere API",
    status: "running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/share", shareRoutes);
app.use("/api/public", publicRoutes);

app.use((err, req, res, next) => {
  console.error(err);

  if (err.name === "MulterError") {
    return res.status(400).json({
      message: err.message,
    });
  }

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      message: "Origin not allowed",
    });
  }

  return res.status(500).json({
    message: "Internal server error",
  });
});

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();