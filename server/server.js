import http from "http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

// Local imports
import connectDB from "./config/db.js";
import User from "./models/User.js";
import authRoutes from "./routes/authRoutes.js";
import flightRoutes from "./routes/flightRoutes.js";
import seatRoutes from "./routes/seatRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import passengerRoutes from "./routes/passengerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// Configure CORS
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parser with 100kb payload limit
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    credentials: true,
  },
});

// Socket.IO JWT Authentication Middleware
io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers?.authorization &&
        socket.handshake.headers.authorization.split(" ")[1]);

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "skystream_super_secret_jwt_key_2026"
      );
      const user = await User.findById(decoded.id).select("-password");
      if (user) {
        socket.user = user;
      }
    }
    next();
  } catch (err) {
    // Allow connection as guest if token is invalid/absent, but socket.user will be null
    next();
  }
});

// Socket.IO Connection Handler
io.on("connection", (socket) => {
  if (socket.user) {
    const userId = socket.user._id.toString();
    socket.join(`user:${userId}`);

    if (socket.user.role === "admin") {
      socket.join("admins");
    }
  }

  socket.on("disconnect", () => {
    // Client disconnected
  });
});

// Attach io instance to express app for controller access
app.set("io", io);

// Health check endpoints
app.get("/", (req, res) => {
  res.send("SkyStream Flight Booking API is running");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "SkyStream API is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/passengers", passengerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`[SkyStream Server] Running in ${process.env.NODE_ENV || "development"} mode on http://0.0.0.0:${PORT}`);
});

export { app, server, io };
