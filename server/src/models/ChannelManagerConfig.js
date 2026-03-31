const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: "User",
    },
    guestGroups: { type: mongoose.Schema.Types.Mixed, default: [] },
    guestGroupsEnabled: { type: Boolean, default: true },
    defaultCurrency: { type: String, default: null },
    roomTypes: { type: mongoose.Schema.Types.Mixed, default: [] },
    periods: { type: mongoose.Schema.Types.Mixed, default: [] },
    mealPlans: { type: mongoose.Schema.Types.Mixed, default: [] },
    mealPlansIncluded: { type: Boolean, default: false },
    supplements: { type: mongoose.Schema.Types.Mixed, default: [] },
    refundPolicies: { type: mongoose.Schema.Types.Mixed, default: [] },
    dblPrices: { type: mongoose.Schema.Types.Mixed, default: {} },
    availability: { type: mongoose.Schema.Types.Mixed, default: [] },
    stopSales: { type: mongoose.Schema.Types.Mixed, default: [] },
    commission: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ChannelManagerConfig", schema);
