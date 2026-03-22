const mongoose = require("mongoose");

const HotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: String,
    description: String,
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    selectedIcons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Icon" }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Hotel", HotelSchema);
