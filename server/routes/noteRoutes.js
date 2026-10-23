import express from "express";
import {
  createNote,
  updateNote,
  deleteNote,
} from "../controllers/noteController.js";

const router = express.Router();

router.post("/", createNote);
router.patch("/:noteId", updateNote);
router.delete("/:noteId", deleteNote);

export default router;