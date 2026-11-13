import mongoose from "mongoose";

const seatSchema = new mongoose.Schema(
  {
    flight: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flight",
      required: [true, "Seat must belong to a flight"],
      index: true,
    },
    seatNumber: {
      type: String,
      required: [true, "Seat number is required"],
      trim: true,
      uppercase: true,
    },
    seatClass: {
      type: String,
      enum: ["Economy", "Premium Economy", "Business", "First Class"],
      default: "Economy",
    },
    status: {
      type: String,
      enum: ["available", "booked"],
      default: "available",
      index: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a unique compound index on flight and seatNumber so the same seat cannot be booked twice for a flight
seatSchema.index({ flight: 1, seatNumber: 1 }, { unique: true });

const Seat = mongoose.model("Seat", seatSchema);
export default Seat;
