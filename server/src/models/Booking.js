const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true },
    customerName: String,
    customerEmail: String,
    bookingType: {
      type: String,
      enum: ["hotel", "restaurant", "activity"],
      required: true,
    },
    bookingDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    total: { type: Number, default: 0 },
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
    activityId: { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);
