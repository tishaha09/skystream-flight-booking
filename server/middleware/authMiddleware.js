import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Protect middleware:
 * Validates the JWT Bearer token sent in the Authorization header.
 * Attaches the authenticated user object (without password) to req.user.
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "skystream_super_secret_jwt_key_2026"
      );

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found with this token",
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error("[Auth Middleware Error]", error.message);
      return res.status(401).json({
        success: false,
        message:
          error.name === "TokenExpiredError"
            ? "Session expired. Please log in again."
            : "Invalid authorization token",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authorization token required. Access denied.",
    });
  }
};

/**
 * Admin authorization middleware:
 * Restricts access to users whose role is 'admin'.
 */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access denied. Admin privileges required.",
  });
};
