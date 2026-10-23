
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { loadProject } from "../middleware/projectAccess.js";

import {
  getProjectActivity,
  getProjectStats,
} from "../controllers/activityController.js";

const router = express.Router();

router.use(protect);

router.get("/:projectId", loadProject, getProjectActivity);
router.get("/:projectId/stats", loadProject, getProjectStats);

export default router;
