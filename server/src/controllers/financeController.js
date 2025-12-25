const asyncHandler = require("../middleware/asyncHandler");

const listFinance = asyncHandler(async (req, res) => {
  res.json({ revenue: 120000, expenses: 45000, currency: "USD" });
});

const upsertFinance = asyncHandler(async (req, res) => {
  res.json({ message: "Finance record saved (demo)", payload: req.body });
});

module.exports = { listFinance, upsertFinance };
