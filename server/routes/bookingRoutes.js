import express from "express";
import {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
} from "../controllers/bookingController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Specific routes before param routes
router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);
router.get("/", protect, adminOnly, getAllBookings);

router.get("/:id", protect, getBookingById);
router.put("/:id", protect, updateBooking);
router.delete("/:id", protect, cancelBooking);

// Admin update status
router.put("/:id/status", protect, adminOnly, updateBookingStatus);

export default router;
