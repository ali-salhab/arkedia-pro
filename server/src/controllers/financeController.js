const Booking = require("../models/Booking");
const asyncHandler = require("../middleware/asyncHandler");

const MANAGER_ROLES = new Set(["admin", "hotel", "restaurant", "activity"]);

function getFinanceScope(user) {
  if (user?.role === "super_admin" || user?.role === "superadminuser") {
    return {};
  }

  const requesterId = user?._id || user?.sub;
  const ownerId = MANAGER_ROLES.has(user?.role)
    ? requesterId
    : user?.adminId || null;

  if (!ownerId) {
    return { _id: null };
  }

  return { adminId: ownerId };
}

function getTransactionAmount(booking) {
  if (booking.paymentStatus === "refunded") {
    return Math.abs(Number(booking.paidAmount || booking.total || 0));
  }

  if (booking.paymentStatus === "partial") {
    return Math.abs(Number(booking.paidAmount || 0));
  }

  if (booking.paymentStatus === "paid") {
    return Math.abs(Number(booking.paidAmount || booking.total || 0));
  }

  return 0;
}

function buildDescription(booking) {
  const label = `${booking.bookingType || "booking"} booking`;
  const reference = booking.reference ? `#${booking.reference}` : "";
  const customer = booking.customerName || "Unknown customer";

  return [label, reference, customer].filter(Boolean).join(" - ");
}

const listFinance = asyncHandler(async (req, res) => {
  const bookings = await Booking.find(getFinanceScope(req.user))
    .sort({ bookingDate: -1, createdAt: -1 })
    .lean();

  const rows = bookings.flatMap((booking) => {
    const amount = getTransactionAmount(booking);
    if (!amount) {
      return [];
    }

    return [
      {
        _id: `booking-${booking._id}`,
        sourceId: booking._id,
        sourceType: "booking",
        type: booking.paymentStatus === "refunded" ? "expense" : "revenue",
        bookingType: booking.bookingType,
        customerName: booking.customerName,
        reference: booking.reference,
        description: buildDescription(booking),
        amount,
        currency: booking.currency || "USD",
        date: booking.bookingDate || booking.createdAt,
        status: booking.paymentStatus,
      },
    ];
  });

  res.json(rows);
});

const upsertFinance = asyncHandler(async (_req, res) => {
  res.status(501).json({
    message: "Manual finance records are not supported yet.",
  });
});

module.exports = { listFinance, upsertFinance };
