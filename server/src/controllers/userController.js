const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");

// Manager roles that OWN an adminId-scoped team.
// Super admin sees every user on the platform.
// All other manager roles see only users with adminId = themselves.
// Sub-user roles (*user) technically have no team so they see an empty set — that's fine.
const MANAGER_ROLES = new Set([
  "super_admin",
  "admin",
  "hotel",
  "restaurant",
  "activity",
]);

// Which roles each manager is allowed to create
const CREATABLE_ROLES = {
  super_admin: ["super_admin", "superadminuser", "admin", "adminuser", "hotel", "hoteluser", "restaurant", "restaurantuser", "activity", "activityuser"],
  admin:       ["adminuser", "hotel", "restaurant", "activity"],
  hotel:       ["hoteluser"],
  restaurant:  ["restaurantuser"],
  activity:    ["activityuser"],
};

// List: super_admin sees all users; managers see their team; sub-users see nothing
// Optional ?role= query param to filter by role
const list = asyncHandler(async (req, res) => {
  const { role, _id } = req.user;
  const filter = role === "super_admin" ? {} : { adminId: _id };
  if (req.query.role) filter.role = req.query.role;
  const users = await User.find(filter).select("-password");
  res.json(users);
});

const getOne = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// Create: enforce role creation rules so managers can't escalate privileges
const create = asyncHandler(async (req, res) => {
  const { role, _id } = req.user;
  const body = { ...req.body };

  const allowed = CREATABLE_ROLES[role];
  if (allowed && !allowed.includes(body.role)) {
    return res.status(403).json({
      message: `Role '${role}' cannot create users with role '${body.role}'`,
    });
  }

  if (role !== "super_admin" && !body.adminId) {
    body.adminId = _id;
  }
  const item = await User.create(body);
  const doc = item.toObject();
  delete doc.password;
  res.status(201).json(doc);
});

// Update: use save() so the bcrypt pre-save hook fires on password changes
const update = asyncHandler(async (req, res) => {
  const { password, ...rest } = req.body;
  const user = await User.findById(req.params.id).select("+password");
  if (!user) return res.status(404).json({ message: "User not found" });
  Object.assign(user, rest);
  if (password) user.password = password;
  await user.save();
  const doc = user.toObject();
  delete doc.password;
  res.json(doc);
});

const remove = asyncHandler(async (req, res) => {
  const item = await User.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User deleted" });
});

module.exports = { list, getOne, create, update, remove };
