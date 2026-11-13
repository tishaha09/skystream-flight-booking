import express from "express";
import {
  getAdminDashboard,
  getAllUsers,
  getAllAdminBookings,
  getAllAdminFlights,
  updateUserByAdmin,
  deleteUserByAdmin,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply protect and adminOnly to all admin routes
router.use(protect, adminOnly);

router.get("/dashboard", getAdminDashboard);
router.get("/users", getAllUsers);
router.get("/bookings", getAllAdminBookings);
router.get("/flights", getAllAdminFlights);
router.put("/users/:id", updateUserByAdmin);
router.delete("/users/:id", deleteUserByAdmin);

export default router;
