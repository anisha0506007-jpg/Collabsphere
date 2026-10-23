
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { loadProject } from "../middleware/projectAccess.js";
import { askAI } from "../controllers/aiController.js";

const router = express.Router();

router.use(protect);

router.post("/:projectId/ask", loadProject, askAI);

export default router;
