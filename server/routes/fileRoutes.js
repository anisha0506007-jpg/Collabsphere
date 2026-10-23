
import express from "express";
import mongoose from "mongoose";

import { protect } from "../middleware/authMiddleware.js";
import { loadProject } from "../middleware/projectAccess.js";
import { upload } from "../middleware/uploadMiddleware.js";

import {
  uploadProjectFile,
  getProjectFiles,
  downloadProjectFile,
  deleteProjectFile,
} from "../controllers/fileController.js";

const router = express.Router();

router.use(protect);

const requireEditor = (req, res, next) => {
  if (req.projectRole === "viewer") {
    return res.status(403).json({
      message: "Viewers cannot upload or delete files",
    });
  }

  next();
};

const validateFileId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.fileId)) {
    return res.status(400).json({
      message: "Invalid file ID",
    });
  }

  next();
};

router.get("/:projectId", loadProject, getProjectFiles);

router.post(
  "/:projectId",
  loadProject,
  requireEditor,
  upload.single("file"),
  uploadProjectFile
);

router.get(
  "/:projectId/:fileId",
  loadProject,
  validateFileId,
  downloadProjectFile
);

router.delete(
  "/:projectId/:fileId",
  loadProject,
  requireEditor,
  validateFileId,
  deleteProjectFile
);

export default router;
