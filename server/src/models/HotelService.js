const mongoose = require("mongoose");

const GroupPriceSchema = new mongoose.Schema(
  {
    groupId: { type: String, trim: true },
    groupName: { type: String, trim: true },
    currency: { type: String, trim: true, uppercase: true, default: "USD" },
    amount: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

const ChildTypeSchema = new mongoose.Schema(
  {
    id: { type: String, trim: true },
    label: { type: String, trim: true, default: "Child" },
    pricingType: {
      type: String,
      enum: ["free", "fixed"],
      default: "free",
    },
    prices: { type: [GroupPriceSchema], default: [] },
  },
  { _id: false },
);

const HotelServiceSchema = new mongoose.Schema(
  {
    serviceKey: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    nameAr: { type: String, trim: true },
    description: { type: String, trim: true },
    pricingBasis: {
      type: String,
      enum: ["per_person", "per_booking"],
      default: "per_person",
    },
    adultPricingType: {
      type: String,
      enum: ["free", "fixed"],
      default: "free",
    },
    adultPrices: { type: [GroupPriceSchema], default: [] },
    childTypes: { type: [ChildTypeSchema], default: [] },
    isActive: { type: Boolean, default: true },
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

HotelServiceSchema.index({ adminId: 1, createdAt: -1 });

module.exports = mongoose.model("HotelService", HotelServiceSchema);
