import mongoose from "mongoose";
import User from "../models/User.js";
import Flight from "../models/Flight.js";
import Booking from "../models/Booking.js";

/**
 * @desc    Get Admin Dashboard metrics & summary data
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin)
 */
export const getAdminDashboard = async (req, res, next) => {
  try {
    const totalFlights = await Flight.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();

    // Aggregate total revenue from confirmed/completed bookings
    const revenueAgg = await Booking.aggregate([
      { $match: { bookingStatus: { $in: ["confirmed", "completed"] } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Upcoming flights
    const upcomingFlights = await Flight.find({ status: "scheduled" })
      .sort({ departureDate: 1, departureTime: 1 })
      .limit(5);

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate("user", "name email")
      .populate("flight", "airline flightNumber source destination departureDate")
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      stats: {
        totalFlights,
        totalUsers,
        totalBookings,
        totalRevenue,
      },
      upcomingFlights,
      recentBookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all registered users
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings (Admin view)
 * @route   GET /api/admin/bookings
 * @access  Private (Admin)
 */
export const getAllAdminBookings = async (req, res, next) => {
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
 * @desc    Get all flights (Admin view)
 * @route   GET /api/admin/flights
 * @access  Private (Admin)
 */
export const getAllAdminFlights = async (req, res, next) => {
  try {
    const flights = await Flight.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: flights.length,
      flights,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a user's role or info
 * @route   PUT /api/admin/users/:id
 * @access  Private (Admin)
 */
export const updateUserByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { name, email, phone, role } = req.body;
    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (role && ["user", "admin"].includes(role)) {
      // Prevent demoting self
      if (user._id.toString() === req.user._id.toString() && role !== "admin") {
        return res.status(400).json({
          success: false,
          message: "You cannot revoke your own administrator privileges",
        });
      }
      user.role = role;
    }
    if (email) {
      user.email = email.toLowerCase().trim();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "User account updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin)
 */
export const deleteUserByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account from the admin dashboard",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User removed successfully",
    });
  } catch (error) {
    next(error);
  }
};
