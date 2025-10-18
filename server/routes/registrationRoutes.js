import express from "express";
import {
  registerForEvent,
  unregisterFromEvent,
  getMyRegistrations,
} from "../controllers/registrationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Register for an event
router.post("/:eventId/register", protect, registerForEvent);

// ❌ Unregister from an event
router.delete("/:eventId/unregister", protect, unregisterFromEvent);

// 📜 Get user's registered events
router.get("/my-registrations", protect, getMyRegistrations);

export default router;
