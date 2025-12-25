const asyncHandler = require("../middleware/asyncHandler");

const listReports = asyncHandler(async (req, res) => {
  res.json({
    bookings: { total: 120, confirmed: 90, cancelled: 10 },
    occupancy: { hotel: 0.72, restaurant: 0.65, activity: 0.55 },
  });
});

module.exports = { listReports };
