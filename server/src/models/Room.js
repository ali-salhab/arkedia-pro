const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
  {
    // Identity
    number: {
      type: String,
      required: [true, "Room/Table number is required"],
      trim: true,
      maxlength: [50, "Room/Table number is too long"],
    },
    name: { type: String, trim: true, maxlength: 120 },
    floor: { type: Number, min: 0, max: 300 },
    type: {
      type: String,
      enum: ["room", "table", "suite", "studio", "villa", "service"],
      default: "room",
    },
    category: {
      type: String,
      enum: ["standard", "deluxe", "superior", "executive", "presidential"],
      default: "standard",
    },

    // Capacity & beds
    capacity: { type: Number, default: 1, min: 1, max: 1000 },
    beds: { type: Number, default: 1, min: 0, max: 50 },
    bedType: {
      type: String,
      enum: ["single", "double", "queen", "king", "twin", "sofa"],
      default: "double",
    },
    bathrooms: { type: Number, default: 1, min: 0, max: 50 },

    // Pricing
    pricePerNight: { type: Number, default: 0, min: 0, max: 1000000 },
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
    discount: { type: Number, default: 0, min: 0, max: 100 }, // percentage

    // Size
    sizeM2: { type: Number, min: 0, max: 100000 },
    view: {
      type: String,
      enum: ["sea", "pool", "city", "garden", "mountain", "none"],
      default: "none",
    },

    // Status
    status: {
      type: String,
      enum: ["available", "occupied", "maintenance", "reserved"],
      default: "available",
    },
    smokingAllowed: { type: Boolean, default: false },
    petsAllowed: { type: Boolean, default: false },

    // Amenities
    amenities: {
      wifi: { type: Boolean, default: false },
      ac: { type: Boolean, default: false },
      tv: { type: Boolean, default: false },
      minibar: { type: Boolean, default: false },
      safe: { type: Boolean, default: false },
      balcony: { type: Boolean, default: false },
      jacuzzi: { type: Boolean, default: false },
      kitchenette: { type: Boolean, default: false },
      coffeeMaker: { type: Boolean, default: false },
      hairDryer: { type: Boolean, default: false },
      bathrobe: { type: Boolean, default: false },
      ironing: { type: Boolean, default: false },
    },

    // Images
    images: [{ type: String }], // base64 or URLs
    thumbnail: { type: String }, // main display image

    // Description
    description: { type: String, trim: true, maxlength: 2000 },

    // Relations
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
    activityId: { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

RoomSchema.pre("validate", function normalizeRoom(next) {
  if (this.currency) {
    this.currency = String(this.currency).toUpperCase();
  }

  if (!this.thumbnail && Array.isArray(this.images) && this.images.length > 0) {
    this.thumbnail = this.images[0];
  }

  next();
});

RoomSchema.index({ adminId: 1, status: 1 });
RoomSchema.index({ adminId: 1, type: 1 });
RoomSchema.index({ adminId: 1, number: 1 });

module.exports = mongoose.model("Room", RoomSchema);
