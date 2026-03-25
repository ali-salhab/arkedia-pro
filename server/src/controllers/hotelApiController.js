const { v4: uuidv4 } = require("uuid");
const HotelApiConfig = require("../models/HotelApiConfig");
const Room = require("../models/Room");
const asyncHandler = require("../middleware/asyncHandler");

// Resolve ownerId: hotel managers use their own _id, sub-users use adminId
function resolveOwner(user) {
  if (user.role === "hotel") return user._id.toString();
  return (user.adminId || user._id).toString();
}

// ── MANAGER ENDPOINTS ────────────────────────────────────────────────────────

/**
 * GET /api/hotel-api/config
 * Returns (or auto-creates) the API config for the current hotel.
 */
const getConfig = asyncHandler(async (req, res) => {
  const ownerId = resolveOwner(req.user);
  let config = await HotelApiConfig.findOne({ ownerId });
  if (!config) config = await HotelApiConfig.create({ ownerId });
  res.json(config);
});

/**
 * POST /api/hotel-api/tokens
 * Body: { name, email? }
 * Creates a new developer access token for this hotel.
 */
const createToken = asyncHandler(async (req, res) => {
  const ownerId = resolveOwner(req.user);
  const { name, email = "" } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Token name is required" });
  }

  let config = await HotelApiConfig.findOne({ ownerId });
  if (!config) config = await HotelApiConfig.create({ ownerId });

  const newToken = { name: name.trim(), email: email.trim(), token: uuidv4() };
  config.developerTokens.push(newToken);
  await config.save();

  res.status(201).json(config);
});

/**
 * PATCH /api/hotel-api/tokens/:tokenId/revoke
 * Revokes (deactivates) a developer token.
 */
const revokeToken = asyncHandler(async (req, res) => {
  const ownerId = resolveOwner(req.user);
  const config = await HotelApiConfig.findOne({ ownerId });
  if (!config) return res.status(404).json({ message: "API config not found" });

  const token = config.developerTokens.id(req.params.tokenId);
  if (!token) return res.status(404).json({ message: "Token not found" });

  token.status = "revoked";
  await config.save();
  res.json(config);
});

/**
 * DELETE /api/hotel-api/tokens/:tokenId
 * Permanently deletes a developer token.
 */
const deleteToken = asyncHandler(async (req, res) => {
  const ownerId = resolveOwner(req.user);
  const config = await HotelApiConfig.findOne({ ownerId });
  if (!config) return res.status(404).json({ message: "API config not found" });

  config.developerTokens = config.developerTokens.filter(
    (t) => t._id.toString() !== req.params.tokenId,
  );
  await config.save();
  res.json(config);
});

/**
 * PATCH /api/hotel-api/endpoints
 * Body: { endpoint: "rooms", enabled: true|false }
 * Toggles a specific endpoint on/off.
 */
const toggleEndpoint = asyncHandler(async (req, res) => {
  const ownerId = resolveOwner(req.user);
  const { endpoint, enabled } = req.body;

  const ALLOWED = ["rooms", "availability", "rates"];
  if (!ALLOWED.includes(endpoint)) {
    return res.status(400).json({ message: "Unknown endpoint" });
  }

  let config = await HotelApiConfig.findOne({ ownerId });
  if (!config) config = await HotelApiConfig.create({ ownerId });

  if (enabled && !config.enabledEndpoints.includes(endpoint)) {
    config.enabledEndpoints.push(endpoint);
  } else if (!enabled) {
    config.enabledEndpoints = config.enabledEndpoints.filter(
      (e) => e !== endpoint,
    );
  }

  await config.save();
  res.json(config);
});

// ── PUBLIC DEVELOPER ENDPOINTS ───────────────────────────────────────────────

/**
 * GET /api/developer/rooms
 * Requires: Authorization: Bearer <developerToken>
 * Returns the public room list for the hotel that issued this token.
 */
const publicRooms = asyncHandler(async (req, res) => {
  // req.apiConfig is set by validateDeveloperToken middleware
  const { config } = req;

  if (!config.enabledEndpoints.includes("rooms")) {
    return res
      .status(403)
      .json({ message: "Rooms endpoint is disabled by the hotel manager" });
  }

  const rooms = await Room.find(
    { adminId: config.ownerId },
    // Expose only public-safe fields
    {
      _id: 1,
      number: 1,
      name: 1,
      type: 1,
      category: 1,
      capacity: 1,
      beds: 1,
      bedType: 1,
      bathrooms: 1,
      pricePerNight: 1,
      currency: 1,
      discount: 1,
      sizeM2: 1,
      status: 1,
    },
  ).lean();

  res.json({
    total: rooms.length,
    rooms,
  });
});

module.exports = {
  getConfig,
  createToken,
  revokeToken,
  deleteToken,
  toggleEndpoint,
  publicRooms,
};
