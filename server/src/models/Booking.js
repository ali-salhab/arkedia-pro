const mongoose = require("mongoose");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+()\d\s-]{7,20}$/;

const BookingSchema = new mongoose.Schema(
  {
    // Identity
    reference: {
      type: String,
      required: [true, "Booking reference is required"],
      unique: true,
      trim: true,
      minlength: [4, "Reference is too short"],
      maxlength: [50, "Reference is too long"],
    },
    bookingType: {
      type: String,
      enum: ["hotel", "restaurant", "activity"],
      required: true,
    },

    // Guest info
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      minlength: [2, "Customer name is too short"],
      maxlength: [120, "Customer name is too long"],
    },
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value) => !value || EMAIL_REGEX.test(value),
        message: "Invalid customer email format",
      },
    },
    customerPhone: {
      type: String,
      trim: true,
      validate: {
        validator: (value) => !value || PHONE_REGEX.test(value),
        message: "Invalid customer phone format",
      },
    },
    customerNotes: { type: String, trim: true, maxlength: 2000 },
    adultsCount: { type: Number, default: 1, min: 1, max: 20 },
    childrenCount: { type: Number, default: 0, min: 0, max: 20 },
    nationality: { type: String, trim: true, maxlength: 120 },

    // Dates
    bookingDate: { type: Date, required: true },
    checkIn: { type: Date },
    checkOut: { type: Date },
    nights: { type: Number, min: 0, max: 365 },

    // Room / resource
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    roomNumber: { type: String, trim: true, maxlength: 100 },

    // Pricing
    pricePerNight: { type: Number, default: 0, min: 0, max: 1000000 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    taxRate: { type: Number, default: 0, min: 0, max: 100 },
    total: { type: Number, default: 0, min: 0, max: 10000000 },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
      trim: true,
      validate: {
        validator: (value) => /^[A-Z]{3}$/.test(String(value || "")),
        message: "Currency must be a 3-letter code",
      },
    },

    // Payment
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid", "refunded"],
      default: "unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "bank_transfer", "online", "other"],
      default: "cash",
    },
    paidAmount: { type: Number, default: 0, min: 0, max: 10000000 },

    // Status
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "checked_in",
        "checked_out",
        "cancelled",
        "no_show",
      ],
      default: "pending",
    },

    // Relations
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
    activityId: { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Extra
    specialRequests: { type: String, trim: true, maxlength: 2000 },
    internalNotes: { type: String, trim: true, maxlength: 2000 },
    source: {
      type: String,
      enum: ["direct", "online", "phone", "walk_in", "agency"],
      default: "direct",
    },
  },
  { timestamps: true },
);

BookingSchema.pre("validate", function ensureBookingConsistency(next) {
  if (this.currency) {
    this.currency = String(this.currency).toUpperCase();
  }

  if (this.checkIn && this.checkOut) {
    const checkInDate = new Date(this.checkIn);
    const checkOutDate = new Date(this.checkOut);

    if (checkOutDate <= checkInDate) {
      this.invalidate("checkOut", "Check-out must be after check-in");
    } else {
      const diffNights = Math.round(
        (checkOutDate.getTime() - checkInDate.getTime()) / 86400000,
      );
      this.nights = diffNights;
    }
  }

  if (Number(this.paidAmount || 0) > Number(this.total || 0)) {
    this.invalidate("paidAmount", "Paid amount cannot exceed total amount");
  }

  next();
});

BookingSchema.index({ adminId: 1, bookingDate: -1 });
BookingSchema.index({ adminId: 1, status: 1 });

module.exports = mongoose.model("Booking", BookingSchema);
