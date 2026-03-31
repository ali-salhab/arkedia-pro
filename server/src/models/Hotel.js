const mongoose = require("mongoose");

const HotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    nameAr: { type: String },
    location: String,
    description: String,
    descriptionAr: String,
    country: { type: String, trim: true },
    city: { type: String, trim: true },
    postCode: String,
    lat: Number,
    lng: Number,
    stars: { type: Number, min: 1, max: 5 },
    category: String,
    thumbnail: { type: String },
    logo: { type: String },
    gallery: [{ type: String }],
    policy: String,
    policyAr: String,
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    selectedIcons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Icon" }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Hotel", HotelSchema);
