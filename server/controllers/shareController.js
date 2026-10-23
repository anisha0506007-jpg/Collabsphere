
import { createHash, randomBytes } from "node:crypto";
import Project from "../models/Project.js";

// Generate a public link for a project
export const enableProjectSharing = async (req, res) => {
  try {
    const token = randomBytes(32).toString("hex");

    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    req.project.shareEnabled = true;
    req.project.shareTokenHash = tokenHash;

    await req.project.save();

    const clientUrl =
      process.env.CLIENT_URL || "http://localhost:5173";

    const shareUrl = `${clientUrl}/public/${token}`;

    return res.status(200).json({
      message: "Public sharing enabled",
      shareUrl,
    });
  } catch (error) {
    console.error("Enable sharing error:", error.message);

    return res.status(500).json({
      message: "Could not enable project sharing",
    });
  }
};

// Disable public sharing
export const disableProjectSharing = async (req, res) => {
  try {
    req.project.shareEnabled = false;
    req.project.shareTokenHash = null;

    await req.project.save();

    return res.status(200).json({
      message: "Public sharing disabled",
    });
  } catch (error) {
    console.error("Disable sharing error:", error.message);

    return res.status(500).json({
      message: "Could not disable project sharing",
    });
  }
};

// Fetch only the public project information
export const getPublicProject = async (req, res) => {
  try {
    const { token } = req.params;

    // Our generated tokens contain 64 hexadecimal characters.
    if (!/^[a-f0-9]{64}$/i.test(token)) {
      return res.status(404).json({
        message: "Public project not found or sharing is disabled",
      });
    }

    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    const project = await Project.findOne({
      shareEnabled: true,
      shareTokenHash: tokenHash,
    }).select("name description createdAt updatedAt");

    if (!project) {
      return res.status(404).json({
        message: "Public project not found or sharing is disabled",
      });
    }

    return res.status(200).json({ project });
  } catch (error) {
    console.error("Get public project error:", error.message);

    return res.status(500).json({
      message: "Could not load public project",
    });
  }
};
