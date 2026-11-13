import mongoose from "mongoose";
import Seat from "../models/Seat.js";
import Flight from "../models/Flight.js";

/**
 * @desc    Get all seats for a specific flight
 * @route   GET /api/flights/:id/seats
 * @access  Public
 */
export const getSeatsByFlight = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid flight ID format",
      });
    }

    const flight = await Flight.findById(id);
    if (!flight) {
      return res.status(404).json({
        success: false,
        message: "Flight not found",
      });
    }

    // Retrieve seats sorted in natural row order (e.g., 1A, 1B ... 10F)
    const seats = await Seat.find({ flight: id });

    // Custom sort by row number, then column letter
    seats.sort((a, b) => {
      const matchA = a.seatNumber.match(/^(\d+)([A-Z]+)$/);
      const matchB = b.seatNumber.match(/^(\d+)([A-Z]+)$/);
      if (matchA && matchB) {
        const rowDiff = parseInt(matchA[1], 10) - parseInt(matchB[1], 10);
        if (rowDiff !== 0) return rowDiff;
        return matchA[2].localeCompare(matchB[2]);
      }
      return a.seatNumber.localeCompare(b.seatNumber);
    });

    res.status(200).json({
      success: true,
      count: seats.length,
      seats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get seat availability summary for a flight
 * @route   GET /api/flights/:id/seats/availability
 * @access  Public
 */
export const getSeatAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid flight ID format",
      });
    }

    const flight = await Flight.findById(id);
    if (!flight) {
      return res.status(404).json({
        success: false,
        message: "Flight not found",
      });
    }

    const seats = await Seat.find({ flight: id });
    const available = seats.filter((s) => s.status === "available");
    const booked = seats.filter((s) => s.status === "booked");

    res.status(200).json({
      success: true,
      flightId: id,
      totalSeats: seats.length,
      availableCount: available.length,
      bookedCount: booked.length,
      availableSeats: available.map((s) => s.seatNumber),
      bookedSeats: booked.map((s) => s.seatNumber),
    });
  } catch (error) {
    next(error);
  }
};
