const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["room", "table", "service"], default: "room" },
    capacity: Number,
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
    activityId: { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", RoomSchema);
