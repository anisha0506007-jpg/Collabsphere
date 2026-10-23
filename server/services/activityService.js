
import Activity from "../models/Activity.js";

export const logActivity = async ({
  projectId,
  userId,
  action,
  details = "",
}) => {
  try {
    await Activity.create({
      project: projectId,
      user: userId,
      action,
      details: details.slice(0, 250),
    });
  } catch (error) {
    console.error("Activity logging failed:", error.message);
  }
};
