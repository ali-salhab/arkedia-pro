const asyncHandler = require("../middleware/asyncHandler");
const Role = require("../models/Role");
const User = require("../models/User");
const { emitPermissionsUpdated } = require("../utils/socketStore");

function normalizePermissions(list = []) {
  return [...new Set((Array.isArray(list) ? list : []).map(String))].sort();
}

const listRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find();
  res.json(roles);
});

const createRole = asyncHandler(async (req, res) => {
  const role = await Role.create(req.body);
  res.status(201).json(role);
});

const updateRole = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) return res.status(404).json({ message: "Role not found" });

  const previousPermissions = normalizePermissions(role.permissions);

  Object.assign(role, req.body);
  await role.save();

  const nextPermissions = normalizePermissions(role.permissions);
  const permissionsChanged =
    previousPermissions.length !== nextPermissions.length ||
    previousPermissions.some((perm, idx) => perm !== nextPermissions[idx]);

  if (permissionsChanged) {
    const actorName = req.user?.name || req.user?.email || "System";
    const affectedUsers = await User.find({ role: role.name })
      .select("_id permissions")
      .lean();

    for (const user of affectedUsers) {
      const effectivePermissions =
        Array.isArray(user.permissions) && user.permissions.length > 0
          ? user.permissions
          : nextPermissions;

      emitPermissionsUpdated(String(user._id), effectivePermissions, {
        changedBy: actorName,
        role: role.name,
        reason: "role_permissions_updated",
        title: "Permissions updated",
        body: `Role permissions for '${role.name}' were updated by ${actorName}.`,
      });
    }
  }

  return res.json(role);
});

module.exports = { listRoles, createRole, updateRole };
