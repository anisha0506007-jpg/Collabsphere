import path from "path";
import { fileURLToPath } from "url";
import { unlink } from "fs/promises";
import ProjectFile from "../models/ProjectFile.js";
import { logActivity } from "../services/activityService.js";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
const uploadDirectory = path.resolve(currentDirectory, "../uploads");

export const uploadProjectFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select a file",
      });
    }

    const file = await ProjectFile.create({
      originalName: path.basename(req.file.originalname),
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      project: req.project._id,
      uploadedBy: req.user.userId,
    });

    await logActivity({
      projectId: req.project._id,
      userId: req.user.userId,
      action: "file_uploaded",
      details: `Uploaded file: ${file.originalName}`,
    });

    return res.status(201).json({
      message: "File uploaded successfully",
      file,
    });
  } catch (error) {
    if (req.file) {
      await unlink(req.file.path).catch(() => {});
    }

    console.error("Upload file error:", error.message);

    return res.status(500).json({
      message: "Failed to upload file",
    });
  }
};

export const getProjectFiles = async (req, res) => {
  try {
    const files = await ProjectFile.find({
      project: req.project._id,
    })
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ files });
  } catch (error) {
    console.error("Get files error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch files",
    });
  }
};

export const downloadProjectFile = async (req, res) => {
  try {
    const file = await ProjectFile.findOne({
      _id: req.params.fileId,
      project: req.project._id,
    });

    if (!file) {
      return res.status(404).json({
        message: "File not found",
      });
    }

    const filePath = path.join(uploadDirectory, file.storedName);

    return res.download(filePath, file.originalName, (error) => {
      if (error && !res.headersSent) {
        console.error("Download file error:", error.message);

        res.status(500).json({
          message: "Failed to download file",
        });
      }
    });
  } catch (error) {
    console.error("Download file error:", error.message);

    return res.status(500).json({
      message: "Failed to download file",
    });
  }
};

export const deleteProjectFile = async (req, res) => {
  try {
    const file = await ProjectFile.findOne({
      _id: req.params.fileId,
      project: req.project._id,
    });

    if (!file) {
      return res.status(404).json({
        message: "File not found",
      });
    }

    const filePath = path.join(uploadDirectory, file.storedName);

    await unlink(filePath).catch((error) => {
      if (error.code !== "ENOENT") {
        throw error;
      }
    });

    await file.deleteOne();

    await logActivity({
      projectId: req.project._id,
      userId: req.user.userId,
      action: "file_deleted",
      details: `Deleted file: ${file.originalName}`,
    });

    return res.status(200).json({
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete file error:", error.message);

    return res.status(500).json({
      message: "Failed to delete file",
    });
  }
};
