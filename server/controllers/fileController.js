import path from "path";
import { fileURLToPath } from "url";
import { unlink, readFile } from "fs/promises";

import ProjectFile from "../models/ProjectFile.js";
import { logActivity } from "../services/activityService.js";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

const uploadDirectory = path.resolve(
  currentDirectory,
  "../uploads"
);

const codeExtensions = [
  ".js", ".jsx", ".ts", ".tsx", ".py",
  ".html", ".css", ".json", ".java",
  ".c", ".cpp", ".cs", ".php",
  ".sql", ".xml", ".yml", ".yaml",
  ".sh", ".txt", ".md",
];

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

    console.error("Upload error:", error.message);

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

export const previewProjectFile = async (req, res) => {
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

    const extension = path.extname(file.originalName).toLowerCase();
    const filePath = path.join(uploadDirectory, file.storedName);

    const isCodeFile = codeExtensions.includes(extension);

    if (isCodeFile) {
      const content = await readFile(filePath, "utf8");

      return res.status(200).json({
        type: "code",
        name: file.originalName,
        content,
      });
    }

    const isImage = [
      ".png", ".jpg", ".jpeg", ".webp",
    ].includes(extension);

    if (isImage) {
      res.type(file.mimeType || "application/octet-stream");
      res.setHeader("Content-Disposition", "inline");
      return res.sendFile(filePath);
    }

    if (extension === ".pdf") {
      res.type("application/pdf");
      res.setHeader("Content-Disposition", "inline");
      return res.sendFile(filePath);
    }

    if (extension === ".docx") {
      return res.status(200).json({
        type: "unsupported",
        name: file.originalName,
        message: "DOCX preview is not available. Please download this file.",
      });
    }

    return res.status(200).json({
      type: "unsupported",
      name: file.originalName,
      message: "Preview is not available for this file type.",
    });
  } catch (error) {
    console.error("Preview error:", error.message);

    return res.status(500).json({
      message: "Could not preview this file",
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
        console.error("Download error:", error.message);

        res.status(500).json({
          message: "Failed to download file",
        });
      }
    });
  } catch (error) {
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
    console.error("Delete error:", error.message);

    return res.status(500).json({
      message: "Failed to delete file",
    });
  }
};