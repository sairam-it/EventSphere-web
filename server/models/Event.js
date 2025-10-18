import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // organizer (creator)
    },
    category: {
      type: String,
      enum: ["technical", "cultural", "workshop", "social", "other"],
      default: "other",
    },
    participantsCount: {
      type: Number,
      default: 0,
    },
    isTeamEvent: {
      type: Boolean,
      default: false,
    },
    maxTeamSize: {
      type: Number,
      default: 5,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
