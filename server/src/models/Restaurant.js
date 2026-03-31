const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    nameAr: { type: String },
    description: { type: String },
    descriptionAr: { type: String },
    cuisine: String,
    category: String,
    location: String,
    city: String,
    country: String,
    stars: { type: Number, min: 0, max: 5 },
    thumbnail: String,
    logo: String,
    gallery: [{ type: String }],
    policy: { type: String },
    policyAr: { type: String },
    selectedIcons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Icon" }],
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Restaurant", RestaurantSchema);
