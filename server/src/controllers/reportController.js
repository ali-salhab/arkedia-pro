const asyncHandler = require("../middleware/asyncHandler");
const Booking = require("../models/Booking");

const MANAGER_ROLES = new Set(["admin", "hotel", "restaurant", "activity"]);

function getScopeFilter(user) {
  if (user?.role === "super_admin" || user?.role === "superadminuser") {
    return {};
  }

  const requesterId = user?._id || user?.sub;
  const ownerId = MANAGER_ROLES.has(user?.role)
    ? requesterId
    : user?.adminId || null;

  if (!ownerId) return { _id: null };
  return { adminId: ownerId };
}

const listReports = asyncHandler(async (req, res) => {
  const filter = getScopeFilter(req.user);
  const bookings = await Booking.find(filter).sort({ createdAt: -1 }).lean();

  // Group bookings into summary rows by (month x bookingType)
  const monthMap = {};
  for (const b of bookings) {
    const d = new Date(b.bookingDate || b.createdAt);
    const bType = b.bookingType || "hotel";
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${bType}`;
    if (!monthMap[key]) {
      const monthName = d.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });
      monthMap[key] = {
        _id: key,
        title: `${bType.charAt(0).toUpperCase() + bType.slice(1)} Report - ${monthName}`,
        type: bType.charAt(0).toUpperCase() + bType.slice(1),
        period: monthName,
        generatedAt: new Date(d.getFullYear(), d.getMonth(), 1).toISOString(),
        totalBookings: 0,
        confirmedBookings: 0,
        cancelledBookings: 0,
        totalRevenue: 0,
        currency: b.currency || "USD",
        status: "Ready",
      };
    }
    monthMap[key].totalBookings += 1;
    if (
      b.status === "confirmed" ||
      b.status === "checked_in" ||
      b.status === "checked_out"
    ) {
      monthMap[key].confirmedBookings += 1;
    }
    if (b.status === "cancelled" || b.status === "no_show") {
      monthMap[key].cancelledBookings += 1;
    }
    if (b.paymentStatus === "paid" || b.paymentStatus === "partial") {
      monthMap[key].totalRevenue += Number(b.paidAmount || b.total || 0);
    }
  }

  const rows = Object.values(monthMap).sort(
    (a, b) => new Date(b.generatedAt) - new Date(a.generatedAt),
  );

  res.json(rows);
});

module.exports = { listReports };
