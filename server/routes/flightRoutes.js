import express from "express";
import {
  getFlights,
  getFlightById,
  createFlight,
  updateFlight,
  deleteFlight,
} from "../controllers/flightController.js";
import { getSeatsByFlight, getSeatAvailability } from "../controllers/seatController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getFlights);
router.get("/:id", getFlightById);

// Seat endpoints nested under flight
router.get("/:id/seats", getSeatsByFlight);
router.get("/:id/seats/availability", getSeatAvailability);

// Admin-only routes
router.post("/", protect, adminOnly, createFlight);
router.put("/:id", protect, adminOnly, updateFlight);
router.delete("/:id", protect, adminOnly, deleteFlight);

export default router;
