import Registration from "../models/Registration.js";
import Event from "../models/Event.js";
import Team from "../models/Team.js";

// ✅ Register for an event
export const registerForEvent = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const { eventId, id } = req.params; // Support both :eventId and :id route params
    const actualEventId = eventId || id;
    const { type, name, email, phone, numberOfParticipants, participants } = req.body;

    // Check if event exists
    const event = await Event.findById(actualEventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Prevent admin from registering
    if (req.user.role === "admin") {
      return res.status(403).json({ message: "Admins cannot register for events." });
    }

    // Check if already registered
    const existingRegistration = await Registration.findOne({ user: userId, event: actualEventId });
    if (existingRegistration) {
      return res.status(400).json({ message: "You have already registered for this event." });
    }

    // Handle individual registration
    if (type === 'individual' || !type) {
      if (!name || !email || !phone) {
        return res.status(400).json({ message: "Name, email, and phone are required for individual registration." });
      }

      // Check if event is full
      if (event.maxParticipants && event.participantsCount >= event.maxParticipants) {
        return res.status(400).json({ message: "Event is full." });
      }

      // Create registration
      const registration = new Registration({
        user: userId,
        event: actualEventId,
        registrationType: 'individual',
        participantDetails: {
          name,
          email,
          phone,
        },
      });

      await registration.save();

      // Update event participants count
      await Event.findByIdAndUpdate(actualEventId, {
        $inc: { participantsCount: 1 }
      });

      res.status(201).json({ message: "Successfully registered for the event!" });
    } 
    // Handle team registration
    else if (type === 'team') {
      if (!participants || !Array.isArray(participants) || participants.length === 0) {
        return res.status(400).json({ message: "Team participants are required." });
      }

      if (event.maxTeamSize && participants.length > event.maxTeamSize) {
        return res.status(400).json({ message: `Team size cannot exceed ${event.maxTeamSize} members.` });
      }

      // Validate all participants have required fields
      const isValid = participants.every(p => p.name && p.email && p.phone);
      if (!isValid) {
        return res.status(400).json({ message: "All participants must have name, email, and phone." });
      }

      // Check if event has capacity for team
      const teamSize = participants.length;
      if (event.maxParticipants && (event.participantsCount + teamSize) > event.maxParticipants) {
        return res.status(400).json({ message: "Event does not have enough capacity for this team." });
      }

      // Create team if needed (using Team model)
      const { nanoid } = await import("nanoid");
      
      const teamCode = nanoid(6);
      const team = await Team.create({
        name: `Team ${teamCode}`,
        leader: userId,
        members: [userId], // Initially just the leader
        event: actualEventId,
        teamCode,
      });

      // Create registration for the leader
      const registration = new Registration({
        user: userId,
        event: actualEventId,
        registrationType: 'team',
        team: team._id,
        teamParticipants: participants,
      });

      await registration.save();

      // Update event participants count
      await Event.findByIdAndUpdate(actualEventId, {
        $inc: { participantsCount: teamSize }
      });

      res.status(201).json({ 
        message: "Successfully registered team for the event!",
        teamCode: team.teamCode,
        teamId: team._id
      });
    } else {
      return res.status(400).json({ message: "Invalid registration type." });
    }
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already registered for this event." });
    }
    console.error('Registration error:', error);
    res.status(500).json({ message: "Error registering for event", error: error.message });
  }
};

// ❌ Unregister from an event
export const unregisterFromEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;

    const registration = await Registration.findOneAndDelete({ user: userId, event: eventId });

    if (!registration) {
      return res.status(404).json({ message: "You are not registered for this event." });
    }

    res.json({ message: "Successfully unregistered from event." });
  } catch (error) {
    res.status(500).json({ message: "Error unregistering from event", error: error.message });
  }
};

// 📜 Get user's registered events
export const getMyRegistrations = async (req, res) => {
  try {
    const userId = req.user.id;

    const registrations = await Registration.find({ user: userId }).populate("event");

    res.json({ events: registrations.map((r) => r.event) });
  } catch (error) {
    res.status(500).json({ message: "Error fetching registrations", error: error.message });
  }
};
