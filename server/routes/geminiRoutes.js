import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { loadProject } from "../middleware/projectAccess.js";

import {
  explainWithGemini,
  generateDocsWithGemini,
  generateReadmeWithGemini,
} from "../controllers/geminiController.js";

const router = express.Router();

router.use(protect);

const loadProjectFromBody = (req, res, next) => {
  req.params.projectId = req.body.projectId;
  return loadProject(req, res, next);
};

router.post(
  "/explain",
  loadProjectFromBody,
  explainWithGemini
);

router.post(
  "/docs",
  loadProjectFromBody,
  generateDocsWithGemini
);

router.post(
  "/readme",
  loadProjectFromBody,
  generateReadmeWithGemini
);

export default router;