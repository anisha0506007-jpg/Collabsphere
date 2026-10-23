
import Activity from "../models/Activity.js";
import Note from "../models/Note.js";
import ProjectFile from "../models/ProjectFile.js";

export const getProjectActivity = async (req, res) => {
  try {
    const activities = await Activity.find({
      project: req.project._id,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(30);

    return res.status(200).json({ activities });
  } catch (error) {
    console.error("Get activity error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch project activity",
    });
  }
};

export const getProjectStats = async (req, res) => {
  try {
    const projectId = req.project._id;

    const [notesCount, filesCount] = await Promise.all([
      Note.countDocuments({ project: projectId }),
      ProjectFile.countDocuments({ project: projectId }),
    ]);

    return res.status(200).json({
      stats: {
        notes: notesCount,
        files: filesCount,
        members: req.project.members.length,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch project statistics",
    });
  }
};
