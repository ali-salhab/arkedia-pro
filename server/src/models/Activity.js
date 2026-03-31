const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    nameAr: { type: String },
    description: { type: String },
    descriptionAr: { type: String },
    category: String,
    location: String,
    city: String,
    country: String,
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

module.exports = mongoose.model("Activity", ActivitySchema);
