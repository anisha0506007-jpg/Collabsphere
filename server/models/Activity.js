
import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      enum: [
        "project_created",
        "member_added",
        "note_created",
        "note_updated",
        "note_deleted",
        "file_uploaded",
        "file_deleted",
      ],
      required: true,
    },

    details: {
      type: String,
      maxlength: 250,
      default: "",
    },
  },
  { timestamps: true }
);

activitySchema.index({ project: 1, createdAt: -1 });

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;
