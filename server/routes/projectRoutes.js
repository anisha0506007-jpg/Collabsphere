import express from "express";

import {
  createProject,
  getProjects,
  getProjectById,
  addProjectMember,
} from "../controllers/projectController.js";

import { protect } from "../middleware/authMiddleware.js";

import {
  loadProject,
  requireProjectOwner,
} from "../middleware/projectAccess.js";

const router = express.Router();

router.use(protect);

router.post("/", createProject);
router.get("/", getProjects);

router.get("/:projectId", loadProject, getProjectById);

router.post(
  "/:projectId/members",
  loadProject,
  requireProjectOwner,
  addProjectMember
);

export default router;