import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import { mkdirSync } from "fs";
import { fileURLToPath } from "url";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

const uploadDirectory = path.resolve(
  currentDirectory,
  "../uploads"
);

mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${extension}`);
  },
});

const allowedExtensions = [
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".txt",
  ".md",
  ".docx",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".py",
  ".html",
  ".css",
  ".json",
  ".java",
  ".c",
  ".cpp",
  ".cs",
  ".php",
  ".sql",
  ".xml",
  ".yml",
  ".yaml",
  ".sh",
];

const allowedMimeTypes = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/plain",
  "text/markdown",
  "text/javascript",
  "application/javascript",
  "application/json",
  "text/html",
  "text/css",
  "application/xml",
  "text/xml",
  "application/x-python-code",
  "application/x-sh",
  "application/octet-stream",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    return cb(new Error("This file extension is not allowed"));
  }

 
  if (!file.mimetype) {
    return cb(new Error("Invalid file type"));
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
});