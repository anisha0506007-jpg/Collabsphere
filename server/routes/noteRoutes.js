import express from "express";
import mongoose from "mongoose";

import { protect } from "../middleware/authMiddleware.js";
import { loadProject } from "../middleware/projectAccess.js";

import {
  createNote,
  getProjectNotes,
  getSingleNote,
  updateNote,
  deleteNote,
} from "../controllers/noteController.js";

const router = express.Router();

router.use(protect);

const requireEditor = (req, res, next) => {
  if (req.projectRole === "viewer") {
    return res.status(403).json({
      message: "Viewers cannot create or modify notes",
    });
  }

  next();
};

const validateNoteId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.noteId)) {
    return res.status(400).json({
      message: "Invalid note ID",
    });
  }

  next();
};

router.get("/:projectId", loadProject, getProjectNotes);

router.post(
  "/:projectId",
  loadProject,
  requireEditor,
  createNote
);

router.get(
  "/:projectId/:noteId",
  loadProject,
  validateNoteId,
  getSingleNote
);

router.patch(
  "/:projectId/:noteId",
  loadProject,
  requireEditor,
  validateNoteId,
  updateNote
);

router.delete(
  "/:projectId/:noteId",
  loadProject,
  requireEditor,
  validateNoteId,
  deleteNote
);

export default router;