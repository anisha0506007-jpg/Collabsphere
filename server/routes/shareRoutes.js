
import express from "express";
import {
  enableProjectSharing,
  disableProjectSharing,
} from "../controllers/shareController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  loadProject,
  requireProjectOwner,
} from "../middleware/projectAccess.js";

const router = express.Router();

router.use(protect);

router.post(
  "/:projectId/enable",
  loadProject,
  requireProjectOwner,
  enableProjectSharing
);

router.delete(
  "/:projectId/disable",
  loadProject,
  requireProjectOwner,
  disableProjectSharing
);

export default router;
