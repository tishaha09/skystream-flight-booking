import mongoose from "mongoose";

const flightSchema = new mongoose.Schema(
  {
    airline: {
      type: String,
      required: [true, "Airline name is required"],
      trim: true,
    },
    flightNumber: {
      type: String,
      required: [true, "Flight number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    source: {
      type: String,
      required: [true, "Source city/airport is required"],
      trim: true,
    },
    sourceCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: function () {
        const match = this.source.match(/\(([A-Z]{3})\)/i);
        return match ? match[1].toUpperCase() : "DEL";
      },
    },
    destination: {
      type: String,
      required: [true, "Destination city/airport is required"],
      trim: true,
    },
    destinationCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: function () {
        const match = this.destination.match(/\(([A-Z]{3})\)/i);
        return match ? match[1].toUpperCase() : "BOM";
      },
    },
    departureDate: {
      type: String,
      required: [true, "Departure date is required (YYYY-MM-DD)"],
      trim: true,
    },
    departureTime: {
      type: String,
      required: [true, "Departure time is required"],
      trim: true,
    },
    arrivalTime: {
      type: String,
      required: [true, "Arrival time is required"],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, "Flight duration is required"],
      trim: true,
    },
    stops: {
      type: String,
      enum: ["Non-stop", "1 Stop", "2 Stops"],
      default: "Non-stop",
    },
    aircraft: {
      type: String,
      trim: true,
      default: "Airbus A320neo",
    },
    terminal: {
      type: String,
      trim: true,
      default: "T3",
    },
    gate: {
      type: String,
      trim: true,
      default: "12A",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"],
    },
    totalSeats: {
      type: Number,
      required: [true, "Total seats are required"],
      min: [1, "Total seats must be at least 1"],
      default: 60,
    },
    availableSeats: {
      type: Number,
      required: [true, "Available seats are required"],
      min: [0, "Available seats cannot be negative"],
      default: 60,
    },
    travelClass: {
      type: String,
      enum: ["Economy", "Premium Economy", "Business", "First Class"],
      default: "Economy",
    },
    status: {
      type: String,
      enum: ["scheduled", "delayed", "cancelled", "completed"],
      default: "scheduled",
    },
    baggageInformation: {
      type: String,
      default: "Check-in: 15kg, Cabin: 7kg",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Search indexes on source, destination, departureDate, airline, flightNumber
flightSchema.index({ source: 1, destination: 1, departureDate: 1 });
flightSchema.index({
  airline: "text",
  flightNumber: "text",
  source: "text",
  destination: "text",
});

const Flight = mongoose.model("Flight", flightSchema);
export default Flight;
