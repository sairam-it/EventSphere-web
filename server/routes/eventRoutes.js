import express from "express";
import {
  createEvent,
  getAllEvents,
  getUserEvents,
} from "../controllers/eventController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a new event (organizer)
router.post("/create", protect, createEvent);

// Get all events (public)
router.get("/", getAllEvents);

// Get logged-in user's events (hosted + participated)
router.get("/my-events", protect, getUserEvents);

export default router;
