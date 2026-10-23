
import Project from "../models/Project.js";

export const loadProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    const userId = String(req.user.userId);
    const ownerId = String(project.owner?._id || project.owner);

    const isOwner = ownerId === userId;

    const member = project.members.find((item) => {
      const memberId = String(item.user?._id || item.user);
      return memberId === userId;
    });

    const isMember = Boolean(member);

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "You do not have access to this project.",
      });
    }

    req.project = project;
    req.projectRole = isOwner ? "owner" : member.role;

    next();
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid project ID.",
      });
    }

    next(error);
  }
};

export const requireProjectOwner = (req, res, next) => {
  try {
    const userId = String(req.user.userId);
    const ownerId = String(req.project.owner?._id || req.project.owner);

    if (ownerId !== userId) {
      return res.status(403).json({
        message: "Only the project owner can perform this action.",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
