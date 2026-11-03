import Note from "../models/Note.js";
import { logActivity } from "../services/activityService.js";

export const createNote = async (req, res) => {
  try {
    const { title, content = "" } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        message: "Note title is required",
      });
    }

    const note = await Note.create({
      title: title.trim(),
      content,
      project: req.project._id,
      author: req.user.userId,
    });

    await logActivity({
      projectId: req.project._id,
      userId: req.user.userId,
      action: "note_created",
      details: `Created note: ${note.title}`,
    });

    return res.status(201).json({
      message: "Note created successfully",
      note,
    });
  } catch (error) {
    console.error("Create note error:", error.message);

    return res.status(500).json({
      message: "Failed to create note",
    });
  }
};

export const getProjectNotes = async (req, res) => {
  try {
    const notes = await Note.find({
      project: req.project._id,
    })
      .populate("author", "name email")
      .sort({ updatedAt: -1 });

    return res.status(200).json({ notes });
  } catch (error) {
    console.error("Get notes error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch notes",
    });
  }
};

export const getSingleNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.noteId,
      project: req.project._id,
    }).populate("author", "name email");

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    return res.status(200).json({ note });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch note",
    });
  }
};

export const updateNote = async (req, res) => {
  try {
    const { title, content } = req.body;

    const note = await Note.findOne({
      _id: req.params.noteId,
      project: req.project._id,
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          message: "Note title cannot be empty",
        });
      }

      note.title = title.trim();
    }

    if (content !== undefined) {
      note.content = content;
    }

    await note.save();

    await logActivity({
      projectId: req.project._id,
      userId: req.user.userId,
      action: "note_updated",
      details: `Updated note: ${note.title}`,
    });

    return res.status(200).json({
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    console.error("Update note error:", error.message);

    return res.status(500).json({
      message: "Failed to update note",
    });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.noteId,
      project: req.project._id,
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    await logActivity({
      projectId: req.project._id,
      userId: req.user.userId,
      action: "note_deleted",
      details: `Deleted note: ${note.title}`,
    });

    return res.status(200).json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Delete note error:", error.message);

    return res.status(500).json({
      message: "Failed to delete note",
    });
  }
};