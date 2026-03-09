const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: String,
    location: String,
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Activity", ActivitySchema);
