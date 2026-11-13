import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Booking must have an associated user"],
      index: true,
    },
    flight: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flight",
      required: [true, "Booking must specify a flight"],
      index: true,
    },
    passengers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Passenger",
      },
    ],
    selectedSeats: {
      type: [String],
      required: [true, "At least one seat must be selected"],
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length > 0;
        },
        message: "At least one seat must be selected",
      },
    },
    fareType: {
      type: String,
      enum: ["Regular", "Student", "Armed Forces", "Senior Citizen"],
      default: "Regular",
    },
    fareBreakdown: {
      baseFare: { type: Number, default: 0 },
      discountPercent: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 },
      totalAmount: { type: Number, default: 0 },
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    bookingStatus: {
      type: String,
      enum: ["confirmed", "pending", "cancelled", "completed"],
      default: "confirmed",
      index: true,
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
