import mongoose from "mongoose";

const passengerSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Passenger must be associated with a booking"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Passenger name is required"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "Passenger age is required"],
      min: [0, "Age cannot be negative"],
      max: [120, "Age must be valid"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["Male", "Female", "Other"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    idNumber: {
      type: String,
      required: [true, "ID/Passport number is required"],
      trim: true,
    },
    seatNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Passenger = mongoose.model("Passenger", passengerSchema);
export default Passenger;
