import express from "express";
import {
  createEvent,
  getAllEvents,
  getUserEvents,
  getEventById,
  getHostedEvents,
  getParticipatedEvents,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import { registerForEvent, getEventRegistrations } from "../controllers/registrationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a new event (organizer)
router.post("/create", protect, createEvent);

// Get all events (public)
router.get("/", getAllEvents);

// Get logged-in user's events (hosted + participated)
router.get("/my-events", protect, getUserEvents);

// Get hosted events
router.get("/hosted", protect, getHostedEvents);

// Get participated events
router.get("/participated", protect, getParticipatedEvents);

// Update event (host only)
router.put("/:id", protect, updateEvent);

// Delete event (host only)
router.delete("/:id", protect, deleteEvent);

// Register for event
router.post("/:id/register", protect, registerForEvent);

// Get event registrations (host only)
router.get("/:id/registrations", protect, getEventRegistrations);

// Get event by ID (public) - must be last to avoid route conflicts
router.get("/:id", getEventById);

export default router;
