import mongoose from "mongoose";
import Passenger from "../models/Passenger.js";
import Booking from "../models/Booking.js";

/**
 * @desc    Get all passengers for a booking
 * @route   GET /api/passengers/:bookingId
 * @access  Private (Owner or Admin)
 */
export const getPassengersByBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    if (!mongoose.isValidObjectId(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID format",
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Authorization check
    if (
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access passenger records for this booking",
      });
    }

    const passengers = await Passenger.find({ booking: bookingId });

    res.status(200).json({
      success: true,
      count: passengers.length,
      passengers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update passenger details
 * @route   PUT /api/passengers/:id
 * @access  Private (Owner or Admin)
 */
export const updatePassenger = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid passenger ID format",
      });
    }

    const passenger = await Passenger.findById(id);
    if (!passenger) {
      return res.status(404).json({
        success: false,
        message: "Passenger record not found",
      });
    }

    // Verify booking ownership
    const booking = await Booking.findById(passenger.booking);
    if (
      booking &&
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this passenger record",
      });
    }

    const { name, age, gender, email, phone, idNumber } = req.body;
    if (name) passenger.name = name.trim();
    if (age !== undefined) passenger.age = Number(age);
    if (gender) passenger.gender = gender;
    if (email !== undefined) passenger.email = email.trim();
    if (phone !== undefined) passenger.phone = phone.trim();
    if (idNumber) passenger.idNumber = idNumber.trim();

    const updatedPassenger = await passenger.save();

    res.status(200).json({
      success: true,
      message: "Passenger details updated successfully",
      passenger: updatedPassenger,
    });
  } catch (error) {
    next(error);
  }
};
