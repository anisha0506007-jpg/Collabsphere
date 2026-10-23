
import Project from "../models/Project.js";
import User from "../models/User.js";
import { logActivity } from "../services/activityService.js";

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.project._id)
      .populate("owner", "name email")
      .populate("members.user", "name email");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    return res.status(200).json({
      project,
      role: req.projectRole,
    });
  } catch (error) {
    console.error("Get project error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch project details",
    });
  }
};

export const addProjectMember = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        message: "Member email is required",
      });
    }

    if (!["editor", "viewer"].includes(role)) {
      return res.status(400).json({
        message: "Role must be editor or viewer",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const memberUser = await User.findOne({
      email: normalizedEmail,
    }).select("_id name email");

    if (!memberUser) {
      return res.status(404).json({
        message: "No registered user found with this email",
      });
    }

    const project = req.project;

    const ownerId = String(
      project.owner?._id || project.owner
    );

    if (ownerId === String(memberUser._id)) {
      return res.status(400).json({
        message: "The project owner already has full access",
      });
    }

    const alreadyMember = project.members.some((member) => {
      const memberId = member.user?._id || member.user;

      return String(memberId) === String(memberUser._id);
    });

    if (alreadyMember) {
      return res.status(409).json({
        message: "This user is already a project member",
      });
    }

    project.members.push({
      user: memberUser._id,
      role,
    });

    await project.save();

    await logActivity({
      projectId: project._id,
      userId: req.user.userId,
      action: "member_added",
      details: `Added member: ${memberUser.name} (${role})`,
    });

    const updatedProject = await Project.findById(project._id)
      .populate("owner", "name email")
      .populate("members.user", "name email");

    return res.status(201).json({
      message: "Project member added successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Add project member error:", error.message);

    return res.status(500).json({
      message: "Failed to add project member",
    });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Project name is required",
      });
    }

    const project = await Project.create({
      name: name.trim(),
      description:
        typeof description === "string"
          ? description.trim()
          : "",
      owner: req.user.userId,
      members: [],
    });

    await logActivity({
      projectId: project._id,
      userId: req.user.userId,
      action: "project_created",
      details: `Created project: ${project.name}`,
    });

    const populatedProject = await Project.findById(project._id)
      .populate("owner", "name email")
      .populate("members.user", "name email");

    return res.status(201).json({
      message: "Project created successfully",
      project: populatedProject,
      role: "owner",
    });
  } catch (error) {
    console.error("Create project error:", error.message);

    return res.status(500).json({
      message: "Failed to create project",
    });
  }
};

export const getProjects = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const projects = await Project.find({
      $or: [
        { owner: currentUserId },
        { "members.user": currentUserId },
      ],
    })
      .populate("owner", "name email")
      .populate("members.user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Get projects error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch projects",
    });
  }
};
