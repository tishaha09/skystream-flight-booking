import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Flight from "../models/Flight.js";
import Seat from "../models/Seat.js";
import Passenger from "../models/Passenger.js";
import Notification from "../models/Notification.js";
import { calculateFareBreakdown, FARE_TYPES } from "../config/fareTypes.js";

/**
 * @desc    Create a new flight booking with transaction
 * @route   POST /api/bookings
 * @access  Private (User)
 */
export const createBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      flightId,
      selectedSeats: rawSelectedSeats,
      seats: rawSeats,
      passengers,
      fareType = "Regular",
    } = req.body;

    // Accept either selectedSeats or seats field
    const selectedSeats = rawSelectedSeats || rawSeats;

    // 1. Basic validation
    if (!flightId || !selectedSeats || !passengers) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Please provide flightId, selectedSeats, and passenger details",
      });
    }

    if (!mongoose.isValidObjectId(flightId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Invalid flight ID format",
      });
    }

    if (!Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "At least one seat must be selected",
      });
    }

    if (!Array.isArray(passengers) || passengers.length !== selectedSeats.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Number of passengers must match the number of selected seats",
      });
    }

    // Validate individual passenger fields and concession eligibility
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.name || p.age === undefined || !p.gender || !p.idNumber) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Passenger #${i + 1} is missing required details (name, age, gender, idNumber)`,
        });
      }

      // Concession validation
      if (fareType === "Senior Citizen" && Number(p.age) < 60) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Senior Citizen concession requires passengers to be at least 60 years of age. Passenger #${i + 1} (${p.name}) is ${p.age} years old.`,
        });
      }
    }

    // 2. Validate Flight exists and has enough seats
    const flight = await Flight.findById(flightId).session(session);
    if (!flight) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Flight not found",
      });
    }

    if (flight.status === "cancelled") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "This flight has been cancelled and cannot be booked",
      });
    }

    if (flight.availableSeats < selectedSeats.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Only ${flight.availableSeats} seat(s) available on this flight`,
      });
    }

    // 3. Verify selected seats in database
    const seatDocs = await Seat.find({
      flight: flightId,
      seatNumber: { $in: selectedSeats },
    }).session(session);

    if (seatDocs.length !== selectedSeats.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "One or more selected seats do not exist on this aircraft",
      });
    }

    // Check if any seat is already booked
    const alreadyBooked = seatDocs.filter((s) => s.status === "booked");
    if (alreadyBooked.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        success: false,
        message: `Seat(s) ${alreadyBooked.map((s) => s.seatNumber).join(", ")} are already booked. Please choose other seats.`,
      });
    }

    // 4. Calculate total fare strictly from database price and concession discount
    const fareBreakdown = calculateFareBreakdown(flight.price, selectedSeats.length, fareType);

    // 5. Create Booking placeholder
    const booking = new Booking({
      user: req.user._id,
      flight: flight._id,
      selectedSeats,
      fareType: fareBreakdown.fareType,
      fareBreakdown,
      totalAmount: fareBreakdown.totalAmount,
      bookingStatus: "confirmed",
      bookingDate: new Date(),
    });

    await booking.save({ session });

    // 6. Create passenger records linked to this booking
    const passengerDocs = [];
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      const passenger = new Passenger({
        booking: booking._id,
        name: p.name.trim(),
        age: Number(p.age),
        gender: p.gender,
        email: p.email ? p.email.trim() : req.user.email,
        phone: p.phone ? p.phone.trim() : req.user.phone || "",
        idNumber: p.idNumber.trim(),
        seatNumber: selectedSeats[i],
      });
      await passenger.save({ session });
      passengerDocs.push(passenger._id);
    }

    booking.passengers = passengerDocs;
    await booking.save({ session });

    // 7. Atomically reserve the seats
    await Seat.updateMany(
      {
        flight: flightId,
        seatNumber: { $in: selectedSeats },
        status: "available",
      },
      {
        $set: {
          status: "booked",
          booking: booking._id,
        },
      },
      { session }
    );

    // 8. Update flight available seats count
    flight.availableSeats = Math.max(0, flight.availableSeats - selectedSeats.length);
    await flight.save({ session });

    // 9. Create user notification
    const notification = new Notification({
      user: req.user._id,
      message: `Your booking for flight ${flight.flightNumber} (${flight.source} to ${flight.destination}) is confirmed! Seats: ${selectedSeats.join(", ")}.`,
      type: "booking",
      isRead: false,
    });
    await notification.save({ session });

    // Commit Transaction
    await session.commitTransaction();
    session.endSession();

    // 10. Populate created booking for return
    const populatedBooking = await Booking.findById(booking._id)
      .populate("flight")
      .populate("passengers")
      .populate("user", "name email phone");

    // 11. Emit Socket.IO events after successful DB commit
    const io = req.app.get("io");
    if (io) {
      // User room notification
      io.to(`user:${req.user._id}`).emit("booking:created", {
        booking: populatedBooking,
      });
      io.to(`user:${req.user._id}`).emit("notification:new", {
        notification,
      });
      // Admin room notification
      io.to("admins").emit("booking:created", {
        booking: populatedBooking,
      });
      // Global flight seats updated
      io.emit("flight:updated", {
        type: "seats_reserved",
        flightId: flight._id,
        availableSeats: flight.availableSeats,
      });
    }

    res.status(201).json({
      success: true,
      message: "Flight booked successfully!",
      bookingId: booking._id,
      booking: populatedBooking,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

/**
 * @desc    Get logged in user's bookings
 * @route   GET /api/bookings/my
 * @access  Private (User)
 */
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("flight")
      .populate("passengers")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single booking by ID
 * @route   GET /api/bookings/:id
 * @access  Private (Owner or Admin)
 */
export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID format",
      });
    }

    const booking = await Booking.findById(id)
      .populate("flight")
      .populate("passengers")
      .populate("user", "name email phone");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Ensure user is booking owner or admin
    if (
      booking.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this booking",
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update booking details (e.g. contact info)
 * @route   PUT /api/bookings/:id
 * @access  Private (Owner)
 */
export const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID format",
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this booking",
      });
    }

    // Only allow updating passenger info or notes if not cancelled
    if (booking.bookingStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled bookings cannot be modified",
      });
    }

    const updatedBooking = await Booking.findById(id)
      .populate("flight")
      .populate("passengers")
      .populate("user", "name email phone");

    res.status(200).json({
      success: true,
      message: "Booking details verified",
      booking: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a booking (releases seats and restores flight availability atomically)
 * @route   DELETE /api/bookings/:id
 * @access  Private (Owner or Admin)
 */
export const cancelBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID format",
      });
    }

    const booking = await Booking.findById(id).session(session);
    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Ensure authorized
    if (
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking",
      });
    }

    if (booking.bookingStatus === "cancelled") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    // Update status to cancelled
    booking.bookingStatus = "cancelled";
    await booking.save({ session });

    // Release reserved seats back to available
    await Seat.updateMany(
      {
        flight: booking.flight,
        seatNumber: { $in: booking.selectedSeats },
      },
      {
        $set: {
          status: "available",
          booking: null,
        },
      },
      { session }
    );

    // Increment flight available seats
    const flight = await Flight.findById(booking.flight).session(session);
    if (flight) {
      flight.availableSeats = Math.min(
        flight.totalSeats,
        flight.availableSeats + booking.selectedSeats.length
      );
      await flight.save({ session });
    }

    // Create cancellation notification
    const notification = new Notification({
      user: booking.user,
      message: `Your booking (ID: ${booking._id}) has been cancelled. Reserved seats have been released.`,
      type: "booking",
      isRead: false,
    });
    await notification.save({ session });

    // Commit Transaction
    await session.commitTransaction();
    session.endSession();

    // Emit Socket.IO events
    const io = req.app.get("io");
    if (io) {
      io.to(`user:${booking.user}`).emit("booking:cancelled", {
        bookingId: booking._id,
        status: "cancelled",
      });
      io.to(`user:${booking.user}`).emit("notification:new", {
        notification,
      });
      io.to("admins").emit("booking:status", {
        bookingId: booking._id,
        status: "cancelled",
      });
      if (flight) {
        io.emit("flight:updated", {
          type: "seats_released",
          flightId: flight._id,
          availableSeats: flight.availableSeats,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully. Seats have been released.",
      bookingId: booking._id,
      bookingStatus: "cancelled",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

/**
 * @desc    Get all bookings (Admin only)
 * @route   GET /api/bookings
 * @access  Private (Admin)
 */
export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email phone")
      .populate("flight")
      .populate("passengers")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update booking status (Admin only)
 * @route   PUT /api/bookings/:id/status
 * @access  Private (Admin)
 */
export const updateBookingStatus = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID format",
      });
    }

    const validStatuses = ["confirmed", "pending", "cancelled", "completed"];
    if (!status || !validStatuses.includes(status)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const booking = await Booking.findById(id).session(session);
    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const oldStatus = booking.bookingStatus;
    booking.bookingStatus = status;

    // If changing to cancelled, release seats
    if (status === "cancelled" && oldStatus !== "cancelled") {
      await Seat.updateMany(
        {
          flight: booking.flight,
          seatNumber: { $in: booking.selectedSeats },
        },
        {
          $set: { status: "available", booking: null },
        },
        { session }
      );

      const flight = await Flight.findById(booking.flight).session(session);
      if (flight) {
        flight.availableSeats = Math.min(
          flight.totalSeats,
          flight.availableSeats + booking.selectedSeats.length
        );
        await flight.save({ session });
      }
    }

    await booking.save({ session });

    // Notification
    const notification = new Notification({
      user: booking.user,
      message: `Your booking status for #${booking._id} has been changed to '${status}'.`,
      type: "booking",
      isRead: false,
    });
    await notification.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Socket.io
    const io = req.app.get("io");
    if (io) {
      io.to(`user:${booking.user}`).emit("booking:status", {
        bookingId: booking._id,
        status,
      });
      io.to(`user:${booking.user}`).emit("notification:new", {
        notification,
      });
    }

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};
