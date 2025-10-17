import Event from "../models/Event.js";
import EventRole from "../models/EventRole.js";

// 🟢 Create Event (only organizers or admins)
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, category } = req.body;
    const userId = req.user.id; // comes from middleware (we'll add next)

    const event = await Event.create({
      title,
      description,
      date,
      location,
      category,
      createdBy: userId,
    });

    // Add role mapping (organizer)
    await EventRole.create({
      userId,
      eventId: event._id,
      role: "organizer",
    });

    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🟣 Get all events
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("createdBy", "name email");
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🔵 Get events by user (for dashboard)
export const getUserEvents = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find event roles for this user
    const roles = await EventRole.find({ userId }).populate("eventId");

    const hostedEvents = roles
      .filter((r) => r.role === "organizer")
      .map((r) => r.eventId);
    const participatedEvents = roles
      .filter((r) => r.role === "participant")
      .map((r) => r.eventId);

    res.status(200).json({ hostedEvents, participatedEvents });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
