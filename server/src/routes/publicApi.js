const router = require("express").Router();
const validateDeveloperToken = require("../middleware/validateDeveloperToken");
const { publicRooms } = require("../controllers/hotelApiController");

// All public developer endpoints require a valid developer token
router.use(validateDeveloperToken);

/**
 * GET /api/developer/rooms
 *
 * Returns the public room list for the hotel that issued the API token.
 *
 * Authentication:
 *   Authorization: Bearer <developerToken>
 *   — or —
 *   X-Api-Key: <developerToken>
 *
 * Example response:
 *   { total: 12, rooms: [ { _id, number, name, type, pricePerNight, ... } ] }
 */
router.get("/rooms", publicRooms);

module.exports = router;
