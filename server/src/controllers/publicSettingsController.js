const asyncHandler = require("../middleware/asyncHandler");
const AppSettings = require("../models/AppSettings");

const PUBLIC_KEYS = new Set([
  "main_page_photos",
  "countries_list",
  "countries_photos",
]);

exports.getPublicSetting = asyncHandler(async (req, res) => {
  const { key } = req.params;
  if (!PUBLIC_KEYS.has(key)) {
    return res.status(404).json({ message: "Not found" });
  }
  const setting = await AppSettings.findOne({ key }).lean();
  res.json(setting ? setting.value : null);
});
