import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createTeam, joinTeam, getMyTeams, removeMember, deleteTeam } from "../controllers/teamController.js";

const router = express.Router();

// 🏗️ Create a new team for a team event
router.post("/create", protect, createTeam);

// 🙋 Join an existing team using code
router.post("/join/:teamCode", protect, joinTeam);

// 👀 Get all teams user is part of
router.get("/my-teams", protect, getMyTeams);

// Remove member (only leader)
router.delete("/:teamId/remove/:memberId", protect, removeMember);

// Delete team (only leader)
router.delete("/:teamId", protect, deleteTeam);

export default router;
