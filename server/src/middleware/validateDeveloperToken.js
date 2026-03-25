const HotelApiConfig = require("../models/HotelApiConfig");

/**
 * Middleware that validates a developer API token from the Authorization header.
 * Sets req.config to the matched HotelApiConfig document.
 *
 * Usage: Authorization: Bearer <developerToken>
 *    or: X-Api-Key: <developerToken>
 */
async function validateDeveloperToken(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token =
      (header.startsWith("Bearer ") ? header.slice(7) : "") ||
      req.headers["x-api-key"] ||
      "";

    if (!token) {
      return res.status(401).json({
        message:
          "API token required. Provide Authorization: Bearer <token> or X-Api-Key: <token>",
      });
    }

    // Find the config document that has this token as an active developer token
    const config = await HotelApiConfig.findOne({
      "developerTokens.token": token,
      "developerTokens.status": "active",
    });

    if (!config) {
      return res.status(401).json({
        message: "Invalid or revoked API token",
      });
    }

    req.config = config;
    return next();
  } catch (err) {
    return res.status(500).json({ message: "Token validation error" });
  }
}

module.exports = validateDeveloperToken;
