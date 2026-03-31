const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");
const auth = require("../middleware/auth");
const AppSettings = require("../models/AppSettings");

const SUPER_ADMIN_ROLES = new Set(["super_admin", "superadminuser"]);
// Keys that only super-admin may write
const RESTRICTED_KEYS = new Set([
  "platform_fees",
  "countries_list",
  "countries_photos",
  "main_page_photos",
]);

// GET /api/app-settings/:key — any authenticated user
router.get(
  "/:key",
  auth,
  asyncHandler(async (req, res) => {
    const setting = await AppSettings.findOne({ key: req.params.key }).lean();
    res.json(setting ? setting.value : null);
  }),
);

// PUT /api/app-settings/:key — super-admin only for restricted keys
router.put(
  "/:key",
  auth,
  asyncHandler(async (req, res) => {
    const { key } = req.params;
    if (RESTRICTED_KEYS.has(key) && !SUPER_ADMIN_ROLES.has(req.user?.role)) {
      return res.status(403).json({ message: "Super-admin access required" });
    }
    const value = req.body.value !== undefined ? req.body.value : req.body;
    const setting = await AppSettings.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true },
    );
    res.json(setting.value);
  }),
);

module.exports = router;
