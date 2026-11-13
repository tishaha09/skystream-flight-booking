import express from "express";
import {
  getSeatsByFlight,
  getSeatAvailability,
} from "../controllers/seatController.js";

const router = express.Router({ mergeParams: true });

router.get("/:id/seats", getSeatsByFlight);
router.get("/:id/seats/availability", getSeatAvailability);

export default router;
