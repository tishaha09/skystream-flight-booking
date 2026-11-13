import express from "express";
import {
  getPassengersByBooking,
  updatePassenger,
} from "../controllers/passengerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:bookingId", protect, getPassengersByBooking);
router.put("/:id", protect, updatePassenger);

export default router;
