const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");
const auth = require("../middleware/auth");
const ChannelManagerConfig = require("../models/ChannelManagerConfig");

const PLATFORM_ROLES = new Set(["super_admin", "superadminuser"]);

const ALLOWED_SECTIONS = [
  "guestGroups",
  "guestGroupsEnabled",
  "defaultCurrency",
  "roomTypes",
  "periods",
  "mealPlans",
  "mealPlansIncluded",
  "supplements",
  "refundPolicies",
  "dblPrices",
  "availability",
  "stopSales",
  "commission",
];

function getAdminId(user) {
  if (!user) return null;
  if (PLATFORM_ROLES.has(user.role)) return null;
  const MANAGER_ROLES = new Set(["admin", "hotel", "restaurant", "activity"]);
  if (MANAGER_ROLES.has(user.role)) return user._id;
  return user.adminId || null;
}

// GET /api/channel-config — get full config for current hotel manager
router.get(
  "/",
  auth,
  asyncHandler(async (req, res) => {
    const adminId = getAdminId(req.user);
    if (!adminId) {
      return res.status(403).json({ message: "Not available for this role" });
    }
    const config = await ChannelManagerConfig.findOne({ adminId }).lean();
    res.json(config || {});
  }),
);

// PUT /api/channel-config/:section — update a single section
router.put(
  "/:section",
  auth,
  asyncHandler(async (req, res) => {
    const adminId = getAdminId(req.user);
    if (!adminId) {
      return res.status(403).json({ message: "Not allowed" });
    }
    const { section } = req.params;
    if (!ALLOWED_SECTIONS.includes(section)) {
      return res.status(400).json({ message: `Unknown section: ${section}` });
    }
    const value = req.body.data !== undefined ? req.body.data : req.body;
    const config = await ChannelManagerConfig.findOneAndUpdate(
      { adminId },
      { $set: { [section]: value, adminId } },
      { upsert: true, new: true },
    );
    res.json(config);
  }),
);

module.exports = router;
