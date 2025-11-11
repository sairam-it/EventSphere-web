import Registration from "../models/Registration.js";
import Event from "../models/Event.js";
import Team from "../models/Team.js";

// ✅ Register for an event
export const registerForEvent = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const { eventId, id } = req.params; // Support both :eventId and :id route params
    const actualEventId = eventId || id;
    const { type, name, email, phone, numberOfParticipants, participants, teamName } = req.body;
    
    // Phone validation helper
    const validatePhoneNumber = (phoneNum) => {
      const phoneDigits = String(phoneNum).replace(/\D/g, '');
      return phoneDigits.length === 10;
    };

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

      // Validate phone number (exactly 10 digits)
      if (!validatePhoneNumber(phone)) {
        return res.status(400).json({ message: "Phone number must be exactly 10 digits." });
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
      // Validate team name
      if (!teamName || !teamName.trim()) {
        return res.status(400).json({ message: "Team name is required." });
      }

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

      // Validate all phone numbers (exactly 10 digits)
      const invalidPhones = participants.filter(p => !validatePhoneNumber(p.phone));
      if (invalidPhones.length > 0) {
        return res.status(400).json({ message: "All phone numbers must be exactly 10 digits." });
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
        name: teamName.trim(),
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
        teamName: teamName.trim(),
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

// 📋 Get event registrations (host only)
export const getEventRegistrations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId, id } = req.params;
    const actualEventId = eventId || id;

    // Check if event exists
    const event = await Event.findById(actualEventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user is the event host
    if (event.createdBy.toString() !== userId) {
      return res.status(403).json({ message: "Only the event host can view registrations." });
    }

    // Get all registrations for this event
    const registrations = await Registration.find({ event: actualEventId })
      .populate("user", "name email")
      .sort({ registeredAt: -1 });

    // Format registrations for frontend
    const formattedRegistrations = registrations.map(reg => {
      if (reg.registrationType === 'individual') {
        return {
          id: reg._id,
          type: 'individual',
          name: reg.participantDetails?.name || reg.user?.name,
          email: reg.participantDetails?.email || reg.user?.email,
          phone: reg.participantDetails?.phone,
          registeredAt: reg.registeredAt,
        };
      } else {
        // Team registration - return team info and all participants
        return {
          id: reg._id,
          type: 'team',
          teamName: reg.teamName,
          participants: reg.teamParticipants || [],
          registeredAt: reg.registeredAt,
        };
      }
    });

    res.status(200).json({ registrations: formattedRegistrations });
  } catch (error) {
    console.error('Get event registrations error:', error);
    res.status(500).json({ message: "Error fetching event registrations", error: error.message });
  }
};
