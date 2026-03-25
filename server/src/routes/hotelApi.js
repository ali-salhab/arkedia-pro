const router = require("express").Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const {
  getConfig,
  createToken,
  revokeToken,
  deleteToken,
  toggleEndpoint,
} = require("../controllers/hotelApiController");

// All hotel-api management routes require authentication and hotel/hoteluser role
router.use(auth);
router.use(requireRole("hotel", "hoteluser"));

router.get("/config", getConfig);
router.post("/tokens", createToken);
router.patch("/tokens/:tokenId/revoke", revokeToken);
router.delete("/tokens/:tokenId", deleteToken);
router.patch("/endpoints", toggleEndpoint);

module.exports = router;
