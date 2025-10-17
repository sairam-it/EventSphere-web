import mongoose from "mongoose";

const eventRoleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    role: {
      type: String,
      enum: ["organizer", "participant"],
      default: "participant",
    },
  },
  { timestamps: true }
);

export default mongoose.model("EventRole", eventRoleSchema);
