const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Manager roles → each can create sub-users of their corresponding "*user" role
// Hierarchy: super_admin → admin → hotel / restaurant / activity
const roles = [
  "super_admin", // platform owner
  "superadminuser", // super_admin's own staff/employee
  "admin", // company manager (created by super_admin)
  "adminuser", // admin's own staff/employee
  "hotel", // hotel manager (created by admin or super_admin)
  "hoteluser", // hotel staff (created by hotel manager)
  "restaurant", // restaurant manager (created by admin or super_admin)
  "restaurantuser", // restaurant staff (created by restaurant manager)
  "activity", // activity manager (created by admin or super_admin)
  "activityuser", // activity staff (created by activity manager)
];

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: roles, required: true },
    permissions: [{ type: String }],
    logo: { type: String },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "AdminCompany" },
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
    activityId: { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
  },
  { timestamps: true },
);

UserSchema.pre("save", async function hash(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

UserSchema.methods.comparePassword = function compare(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", UserSchema);
