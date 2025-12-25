const asyncHandler = require("../middleware/asyncHandler");
const Role = require("../models/Role");

const listRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find();
  res.json(roles);
});

const createRole = asyncHandler(async (req, res) => {
  const role = await Role.create(req.body);
  res.status(201).json(role);
});

const updateRole = asyncHandler(async (req, res) => {
  const role = await Role.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!role) return res.status(404).json({ message: "Role not found" });
  return res.json(role);
});

module.exports = { listRoles, createRole, updateRole };
