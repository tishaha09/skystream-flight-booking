import mongoose from "mongoose";
import Flight from "../models/Flight.js";
import Seat from "../models/Seat.js";
import Booking from "../models/Booking.js";

/**
 * Helper to auto-create seat layout for a new flight.
 * Standard narrow-body layout: 6 seats per row (A, B, C, D, E, F).
 */
const generateFlightSeats = async (flightId, totalSeats, travelClass = "Economy") => {
  const seats = [];
  const cols = ["A", "B", "C", "D", "E", "F"];
  const rows = Math.ceil(totalSeats / cols.length);

  let count = 0;
  for (let r = 1; r <= rows && count < totalSeats; r++) {
    for (let c = 0; c < cols.length && count < totalSeats; c++) {
      seats.push({
        flight: flightId,
        seatNumber: `${r}${cols[c]}`,
        seatClass: travelClass,
        status: "available",
      });
      count++;
    }
  }

  if (seats.length > 0) {
    await Seat.insertMany(seats);
  }
};

/**
 * @desc    Get all flights with comprehensive filtering, sorting, and pagination
 * @route   GET /api/flights
 * @access  Public
 */
export const getFlights = async (req, res, next) => {
  try {
    const {
      source,
      destination,
      departureDate,
      passengers,
      travelClass,
      airline,
      minPrice,
      maxPrice,
      departureTime,
      stops,
      sort,
      page = 1,
      limit = 10,
      search,
    } = req.query;

    const query = {};

    // Source filter (matches city name, airport code, or combined string)
    if (source && source.trim()) {
      const s = source.trim();
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { source: { $regex: s, $options: "i" } },
          { sourceCode: { $regex: `^${s}$`, $options: "i" } },
        ],
      });
    }

    // Destination filter (matches city name, airport code, or combined string)
    if (destination && destination.trim()) {
      const d = destination.trim();
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { destination: { $regex: d, $options: "i" } },
          { destinationCode: { $regex: `^${d}$`, $options: "i" } },
        ],
      });
    }

    // Stops filter
    if (stops && stops !== "all") {
      query.stops = stops;
    }

    // Departure Date filter (matches YYYY-MM-DD or startsWith)
    if (departureDate) {
      query.departureDate = { $regex: `^${departureDate.trim()}` };
    }

    // Travel Class filter
    if (travelClass && travelClass !== "all") {
      query.travelClass = travelClass;
    }

    // Airline filter
    if (airline && airline !== "all") {
      query.airline = { $regex: airline.trim(), $options: "i" };
    }

    // Passenger count availability filter
    if (passengers && !isNaN(Number(passengers))) {
      query.availableSeats = { $gte: Number(passengers) };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice && !isNaN(Number(minPrice))) query.price.$gte = Number(minPrice);
      if (maxPrice && !isNaN(Number(maxPrice))) query.price.$lte = Number(maxPrice);
    }

    // Departure Time filter (e.g. morning, afternoon, evening)
    if (departureTime) {
      if (departureTime === "morning") {
        query.departureTime = { $regex: /(0[5-9]|1[0-1]):[0-5][0-9]\s?AM/i };
      } else if (departureTime === "afternoon") {
        query.departureTime = { $regex: /(12:[0-5][0-9]\s?PM|0[1-4]:[0-5][0-9]\s?PM)/i };
      } else if (departureTime === "evening") {
        query.departureTime = { $regex: /(0[5-9]|1[0-1]):[0-5][0-9]\s?PM/i };
      }
    }

    // Global search query
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      const searchOr = [
        { airline: searchRegex },
        { flightNumber: searchRegex },
        { source: searchRegex },
        { destination: searchRegex },
      ];
      if (query.$and) {
        query.$and.push({ $or: searchOr });
      } else {
        query.$or = searchOr;
      }
    }

    // Sorting logic
    let sortOptions = { departureDate: 1, departureTime: 1 };
    if (sort === "price_asc" || sort === "price-low" || sort === "cheapest") {
      sortOptions = { price: 1 };
    } else if (sort === "price_desc" || sort === "price-high") {
      sortOptions = { price: -1 };
    } else if (sort === "duration_asc" || sort === "duration" || sort === "fastest") {
      sortOptions = { duration: 1 };
    } else if (sort === "departure_asc" || sort === "earliest") {
      sortOptions = { departureTime: 1 };
    } else if (sort === "recommended") {
      sortOptions = { price: 1, availableSeats: -1 };
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit || 50, 10));
    const skip = (pageNum - 1) * limitNum;

    const totalFlights = await Flight.countDocuments(query);
    const flights = await Flight.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: flights.length,
      total: totalFlights,
      page: pageNum,
      pages: Math.ceil(totalFlights / limitNum),
      flights,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single flight by ID
 * @route   GET /api/flights/:id
 * @access  Public
 */
export const getFlightById = async (req, res, next) => {
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

    res.status(200).json({
      success: true,
      flight,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new flight and generate seats
 * @route   POST /api/flights
 * @access  Admin
 */
export const createFlight = async (req, res, next) => {
  try {
    const {
      airline,
      flightNumber,
      source,
      destination,
      departureDate,
      departureTime,
      arrivalTime,
      duration,
      price,
      totalSeats = 60,
      travelClass = "Economy",
      status = "scheduled",
      baggageInformation,
      stops = "Non-stop",
      aircraft = "Airbus A320neo",
      terminal = "T3",
      gate = "12A",
      sourceCode,
      destinationCode,
    } = req.body;

    // Check duplicate flight number
    const existing = await Flight.findOne({ flightNumber: flightNumber.toUpperCase().trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Flight number ${flightNumber.toUpperCase()} already exists`,
      });
    }

    const flight = await Flight.create({
      airline: airline.trim(),
      flightNumber: flightNumber.toUpperCase().trim(),
      source: source.trim(),
      sourceCode: sourceCode || undefined,
      destination: destination.trim(),
      destinationCode: destinationCode || undefined,
      departureDate: departureDate.trim(),
      departureTime: departureTime.trim(),
      arrivalTime: arrivalTime.trim(),
      duration: duration.trim(),
      stops,
      aircraft,
      terminal,
      gate,
      price: Number(price),
      totalSeats: Number(totalSeats),
      availableSeats: Number(totalSeats),
      travelClass,
      status,
      baggageInformation: baggageInformation || "Check-in: 15kg, Cabin: 7kg",
    });

    // Automatically generate seat layout
    await generateFlightSeats(flight._id, flight.totalSeats, flight.travelClass);

    // Emit Socket.IO event
    const io = req.app.get("io");
    if (io) {
      io.emit("flight:updated", {
        type: "created",
        flight,
      });
    }

    res.status(201).json({
      success: true,
      message: "Flight created successfully",
      flight,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing flight
 * @route   PUT /api/flights/:id
 * @access  Admin
 */
export const updateFlight = async (req, res, next) => {
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

    const oldStatus = flight.status;
    const allowedFields = [
      "airline",
      "flightNumber",
      "source",
      "sourceCode",
      "destination",
      "destinationCode",
      "departureDate",
      "departureTime",
      "arrivalTime",
      "duration",
      "stops",
      "aircraft",
      "terminal",
      "gate",
      "price",
      "travelClass",
      "status",
      "baggageInformation",
      "availableSeats",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        flight[field] = req.body[field];
      }
    });

    const updatedFlight = await flight.save();

    // Emit Socket.IO events
    const io = req.app.get("io");
    if (io) {
      io.emit("flight:updated", {
        type: "updated",
        flight: updatedFlight,
      });
      if (oldStatus !== updatedFlight.status) {
        io.emit("flight:status", {
          flightId: updatedFlight._id,
          flightNumber: updatedFlight.flightNumber,
          oldStatus,
          newStatus: updatedFlight.status,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Flight updated successfully",
      flight: updatedFlight,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a flight
 * @route   DELETE /api/flights/:id
 * @access  Admin
 */
export const deleteFlight = async (req, res, next) => {
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

    // Prevent deletion if active confirmed bookings exist
    const activeBookingsCount = await Booking.countDocuments({
      flight: id,
      bookingStatus: "confirmed",
    });

    if (activeBookingsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete flight with ${activeBookingsCount} active confirmed booking(s). Please cancel the bookings or change flight status first.`,
      });
    }

    // Delete associated seats
    await Seat.deleteMany({ flight: id });
    await flight.deleteOne();

    const io = req.app.get("io");
    if (io) {
      io.emit("flight:updated", {
        type: "deleted",
        flightId: id,
      });
    }

    res.status(200).json({
      success: true,
      message: "Flight and associated seats removed successfully",
    });
  } catch (error) {
    next(error);
  }
};
