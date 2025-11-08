import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
    // Individual registration details
    registrationType: {
      type: String,
      enum: ["individual", "team"],
      default: "individual",
    },
    participantDetails: {
      name: String,
      email: String,
      phone: String,
    },
    // Team registration details
    teamParticipants: [{
      name: String,
      email: String,
      phone: String,
    }],
  },
  { timestamps: true }
);

// Prevent duplicate registration (one user per event)
registrationSchema.index({ user: 1, event: 1 }, { unique: true });

const Registration = mongoose.model("Registration", registrationSchema);

export default Registration;
