import Team from "../models/Team.js";
import Event from "../models/Event.js";
import { nanoid } from "nanoid";

// 🎯 Create a new team for a team event
export const createTeam = async (req, res) => {
  try {
    const { eventId, teamName } = req.body;
    const userId = req.user.id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!event.isTeamEvent)
      return res
        .status(400)
        .json({ message: "This event does not allow team registration" });

    // Check if user already created a team for this event
    const existingTeam = await Team.findOne({ leader: userId, event: eventId });
    if (existingTeam)
      return res.status(400).json({ message: "You already created a team for this event" });

    const teamCode = nanoid(6); // unique short code for joining

    const newTeam = await Team.create({
      name: teamName,
      leader: userId,
      members: [userId],
      event: eventId,
      teamCode,
    });

    res.status(201).json({
      message: "Team created successfully",
      team: newTeam,
    });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🙋 Join a team using teamCode
export const joinTeam = async (req, res) => {
  try {
    const { teamCode } = req.params;
    const userId = req.user.id;

    const team = await Team.findOne({ teamCode });
    if (!team) return res.status(404).json({ message: "Invalid team code" });

    const event = await Event.findById(team.event);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Check if user already in another team for this event
    const alreadyInTeam = await Team.findOne({
      event: team.event,
      members: userId,
    });

    if (alreadyInTeam)
      return res
        .status(400)
        .json({ message: "You are already part of another team for this event" });


    if (team.members.includes(userId))
      return res.status(400).json({ message: "You already joined this team" });

    if (team.members.length >= event.maxTeamSize)
      return res.status(400).json({ message: "Team is already full" });

    team.members.push(userId);
    await team.save();

    res.status(200).json({ message: "Joined team successfully", team });
  } catch (error) {
    console.error("Error joining team:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 👀 Get all teams a user is part of
export const getMyTeams = async (req, res) => {
  try {
    const userId = req.user.id;
    const teams = await Team.find({ members: userId })
      .populate("event", "title isTeamEvent")
      .populate("leader", "name email");

    res.status(200).json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ❌ Remove a member from team (only leader can do this)
export const removeMember = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const userId = req.user.id;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (team.leader.toString() !== userId)
      return res.status(403).json({ message: "Only team leader can remove members" });

    if (!team.members.includes(memberId))
      return res.status(400).json({ message: "Member not in this team" });

    // Prevent removing leader themselves
    if (memberId === userId)
      return res.status(400).json({ message: "Leader cannot remove themselves" });

    team.members = team.members.filter(
      (member) => member.toString() !== memberId
    );
    await team.save();

    res.status(200).json({ message: "Member removed successfully", team });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🗑️ Delete team (only leader can delete)
export const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (team.leader.toString() !== userId)
      return res.status(403).json({ message: "Only leader can delete this team" });

    await team.deleteOne();

    res.status(200).json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("Error deleting team:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
