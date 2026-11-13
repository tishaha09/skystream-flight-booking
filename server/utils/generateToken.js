import jwt from "jsonwebtoken";

/**
 * Generate a JSON Web Token (JWT) for authenticated users.
 * Uses HMAC-SHA256 (HS256) algorithm.
 *
 * @param {string} id - The MongoDB User ObjectId string
 * @returns {string} Signed JWT token
 */
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "skystream_super_secret_jwt_key_2026", {
    algorithm: "HS256",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export default generateToken;
