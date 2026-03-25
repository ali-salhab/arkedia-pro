const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const DeveloperTokenSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, default: "", trim: true },
  token: { type: String, default: () => uuidv4() },
  status: { type: String, enum: ["active", "revoked"], default: "active" },
  createdAt: { type: Date, default: Date.now },
});

const HotelApiConfigSchema = new mongoose.Schema(
  {
    // ownerId = hotel manager user._id (same scoping as Room.adminId)
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // Which public endpoints the hotel has enabled for developers
    enabledEndpoints: {
      type: [String],
      default: ["rooms"],
    },
    developerTokens: [DeveloperTokenSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("HotelApiConfig", HotelApiConfigSchema);
