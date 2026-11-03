import Activity from "../models/Activity.js";
import Note from "../models/Note.js";
import ProjectFile from "../models/ProjectFile.js";

export const getProjectActivity = async (req, res) => {
  try {
    const activities = await Activity.find({
      project: req.project._id,
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(30);

    return res.status(200).json({ activities });
  } catch (error) {
    console.error("Activity error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch activity",
    });
  }
};

export const getProjectStats = async (req, res) => {
  try {
    const projectId = req.project._id;

    const [
      notesCount,
      filesCount,
      noteContributions,
      fileContributions,
    ] = await Promise.all([
      Note.countDocuments({ project: projectId }),
      ProjectFile.countDocuments({ project: projectId }),

      Note.aggregate([
        { $match: { project: projectId } },
        {
          $group: {
            _id: "$author",
            count: { $sum: 1 },
          },
        },
      ]),

      ProjectFile.aggregate([
        { $match: { project: projectId } },
        {
          $group: {
            _id: "$uploadedBy",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const members = await req.project.populate([
      { path: "owner", select: "name email" },
      { path: "members.user", select: "name email" },
    ]);

    const team = [];

    const owner = members.owner;

    if (owner) {
      team.push({
        userId: String(owner._id),
        name: owner.name,
        email: owner.email,
      });
    }

    for (const member of members.members) {
      const memberUser = member.user;

      if (!memberUser) continue;

      if (!team.some((person) =>
        person.userId === String(memberUser._id)
      )) {
        team.push({
          userId: String(memberUser._id),
          name: memberUser.name,
          email: memberUser.email,
          role: member.role,
        });
      }
    }

    const noteMap = new Map(
      noteContributions.map((item) => [
        String(item._id),
        item.count,
      ])
    );

    const fileMap = new Map(
      fileContributions.map((item) => [
        String(item._id),
        item.count,
      ])
    );

    const contributions = team.map((member) => {
      const notes = noteMap.get(member.userId) || 0;
      const files = fileMap.get(member.userId) || 0;

      return {
        ...member,
        notes,
        files,
        total: notes + files,
      };
    });

    return res.status(200).json({
      stats: {
        notes: notesCount,
        files: filesCount,
        members: team.length,
      },
      contributions,
    });
  } catch (error) {
    console.error("Stats error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch project statistics",
    });
  }
};