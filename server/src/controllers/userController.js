const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");

// List: super_admin sees all users; others see only their own team (adminId = self)
const list = asyncHandler(async (req, res) => {
  const { role, _id } = req.user;
  const filter = role === "super_admin" ? {} : { adminId: _id };
  const users = await User.find(filter).select("-password");
  res.json(users);
});

const getOne = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// Create: non-super_admin automatically becomes the adminId of the new user
const create = asyncHandler(async (req, res) => {
  const { role, _id } = req.user;
  const body = { ...req.body };
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
