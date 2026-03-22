const mongoose = require("mongoose");

const IconSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    labelAr: { type: String, default: "" },
    category: {
      type: String,
      default: "hotel",
      enum: ["hotel", "room", "activity", "other"],
    },
    // Base64 data URL or remote URL uploaded by super admin
    imageUrl: { type: String, default: "" },
    // "designed" = super admin has uploaded artwork; "requested" = hotel asked for it, pending design
    status: {
      type: String,
      default: "designed",
      enum: ["designed", "requested"],
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    requestedByHotelName: { type: String, default: "" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Icon", IconSchema);
