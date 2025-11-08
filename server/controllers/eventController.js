import Event from "../models/Event.js";
import EventRole from "../models/EventRole.js";
import Registration from "../models/Registration.js";

// 🟢 Create Event (only organizers or admins)
export const createEvent = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      date, 
      location, 
      category,
      maxParticipants,
      isTeamEvent,
      maxTeamSize,
      noOfGirls,
      noOfBoys,
      requirements,
      tags
    } = req.body;
    const userId = req.user.id; // comes from middleware

    const eventData = {
      title,
      description,
      date,
      location,
      category: category || 'other',
      createdBy: userId,
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : 0,
      ...(isTeamEvent !== undefined && { isTeamEvent }),
      ...(maxTeamSize && { maxTeamSize: parseInt(maxTeamSize) }),
      ...(noOfGirls !== undefined && { noOfGirls: parseInt(noOfGirls) || 0 }),
      ...(noOfBoys !== undefined && { noOfBoys: parseInt(noOfBoys) || 0 }),
      ...(requirements && Array.isArray(requirements) && { requirements }),
      ...(tags && Array.isArray(tags) && { tags }),
    };

    const event = await Event.create(eventData);

    // Add role mapping (organizer)
    await EventRole.create({
      userId,
      eventId: event._id,
      role: "organizer",
    });

    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🟣 Get all events
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("createdBy", "name email").sort({ createdAt: -1 });
    // Format events for frontend
    const formattedEvents = events.map(event => ({
      ...event.toObject(),
      type: event.isTeamEvent ? 'team' : 'individual',
      currentParticipants: event.participantsCount || 0,
      startDate: event.date,
      organizer: event.createdBy ? {
        name: event.createdBy.name,
        email: event.createdBy.email
      } : null,
      requirements: event.requirements || [],
      tags: event.tags || []
    }));
    res.status(200).json({ events: formattedEvents });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🔵 Get event by ID
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id).populate("createdBy", "name email");
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    // Format event for frontend
    const formattedEvent = {
      ...event.toObject(),
      type: event.isTeamEvent ? 'team' : 'individual',
      currentParticipants: event.participantsCount || 0,
      startDate: event.date,
      organizer: event.createdBy ? {
        name: event.createdBy.name,
        email: event.createdBy.email
      } : null,
      requirements: event.requirements || [],
      tags: event.tags || []
    };
    
    res.status(200).json({ event: formattedEvent });
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

// 🏠 Get hosted events
export const getHostedEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const events = await Event.find({ createdBy: userId }).populate("createdBy", "name email").sort({ createdAt: -1 });
    // Format events for frontend
    const formattedEvents = events.map(event => ({
      ...event.toObject(),
      type: event.isTeamEvent ? 'team' : 'individual',
      currentParticipants: event.participantsCount || 0,
      startDate: event.date,
      organizer: event.createdBy ? {
        name: event.createdBy.name,
        email: event.createdBy.email
      } : null,
      requirements: event.requirements || [],
      tags: event.tags || []
    }));
    res.status(200).json({ events: formattedEvents });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 👥 Get participated events
export const getParticipatedEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find registrations for this user
    const registrations = await Registration.find({ user: userId }).populate({
      path: "event",
      populate: { path: "createdBy", select: "name email" }
    });
    
    // Format events for frontend
    const events = registrations
      .filter(r => r.event) // Filter out any null events
      .map((r) => {
        const event = r.event;
        return {
          ...event.toObject(),
          type: event.isTeamEvent ? 'team' : 'individual',
          currentParticipants: event.participantsCount || 0,
          startDate: event.date,
          organizer: event.createdBy ? {
            name: event.createdBy.name,
            email: event.createdBy.email
          } : null
        };
      });
    
    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
