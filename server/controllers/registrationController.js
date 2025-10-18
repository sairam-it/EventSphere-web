import Registration from "../models/Registration.js";
import Event from "../models/Event.js";

// ✅ Register for an event
export const registerForEvent = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const { eventId } = req.params;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Prevent admin from registering
    if (req.user.role === "admin") {
      return res.status(403).json({ message: "Admins cannot register for events." });
    }

    // Create new registration
    const registration = new Registration({
      user: userId,
      event: eventId,
    });

    await registration.save();

    res.status(201).json({ message: "Successfully registered for the event!" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already registered for this event." });
    }
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
