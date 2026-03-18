const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const { emitPermissionsUpdated } = require("../utils/socketStore");

function hasPermission(req, permission) {
  return (req.user?.permissions || []).includes(permission);
}

function denyMissingPermission(res, permission) {
  return res.status(403).json({
    message: "Missing permission",
    permission,
  });
}

function ensurePermission(req, res, permission) {
  if (hasPermission(req, permission)) return true;
  denyMissingPermission(res, permission);
  return false;
}

const ROLE_PERMISSION_MODULE = {
  admin: "admins",
  hotel: "hotels",
  restaurant: "restaurants",
  activity: "activities",
};

function permissionForRoleAction(targetRole, action) {
  const moduleName = ROLE_PERMISSION_MODULE[targetRole] || "users";
  return `${moduleName}:${action}`;
}

function getRequesterIds(reqUser) {
  return {
    requesterId: reqUser?._id || reqUser?.sub || null,
    requesterAdminId: reqUser?.adminId || null,
  };
}

// Platform roles can see global data across all admin trees.
const PLATFORM_ROLES = new Set(["super_admin", "superadminuser"]);

// Manager roles that OWN an adminId-scoped team.
// Sub-user roles (*user) technically have no team so they see an empty set — that's fine.
const MANAGER_ROLES = new Set(["admin", "hotel", "restaurant", "activity"]);

// Roles that MUST be owned by an admin (have adminId set)
const ADMIN_OWNED_ROLES = new Set([
  "hotel",
  "hoteluser",
  "restaurant",
  "restaurantuser",
  "activity",
  "activityuser",
]);

// Which roles each manager is allowed to create
const CREATABLE_ROLES = {
  super_admin: [
    "super_admin",
    "superadminuser",
    "admin",
    "adminuser",
    "hotel",
    "hoteluser",
    "restaurant",
    "restaurantuser",
    "activity",
    "activityuser",
  ],
  superadminuser: [
    "superadminuser",
    "admin",
    "adminuser",
    "hotel",
    "hoteluser",
    "restaurant",
    "restaurantuser",
    "activity",
    "activityuser",
  ],
  admin: ["adminuser", "hotel", "restaurant", "activity"],
  hotel: ["hoteluser"],
  restaurant: ["restaurantuser"],
  activity: ["activityuser"],
};

// List: platform roles see all users; managers see their team;
// sub-users see colleagues (same adminId as themselves)
const list = asyncHandler(async (req, res) => {
  const { role } = req.user;
  const { requesterId, requesterAdminId } = getRequesterIds(req.user);

  const listPermission = req.query.role
    ? permissionForRoleAction(req.query.role, "view")
    : "users:view";
  if (!ensurePermission(req, res, listPermission)) {
    return;
  }

  let filter;
  if (PLATFORM_ROLES.has(role)) {
    filter = {};
  } else if (MANAGER_ROLES.has(role)) {
    // Manager sees users they created (their team)
    filter = requesterId ? { adminId: requesterId } : { _id: null };
  } else {
    // Sub-user sees colleagues under the same parent manager
    filter = requesterAdminId ? { adminId: requesterAdminId } : { _id: null };
  }
  if (req.query.role) filter.role = req.query.role;
  const users = await User.find(filter).select("-password");
  res.json(users);
});

const getOne = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });

  const viewPermission = permissionForRoleAction(user.role, "view");
  if (!ensurePermission(req, res, viewPermission)) {
    return;
  }

  res.json(user);
});

// Create: enforce role creation rules so managers can't escalate privileges
const create = asyncHandler(async (req, res) => {
  const { role } = req.user;
  const { requesterId, requesterAdminId } = getRequesterIds(req.user);
  const body = { ...req.body };

  const createPermission = permissionForRoleAction(body.role, "add");
  if (!ensurePermission(req, res, createPermission)) {
    return;
  }

  const allowed = CREATABLE_ROLES[role];
  if (!allowed) {
    return res.status(403).json({
      message: `Role '${role}' cannot create users`,
    });
  }

  if (!allowed.includes(body.role)) {
    return res.status(403).json({
      message: `Role '${role}' cannot create users with role '${body.role}'`,
    });
  }

  // Non-platform creators are always the admin owner — auto-assign
  if (!PLATFORM_ROLES.has(role)) {
    body.adminId = MANAGER_ROLES.has(role) ? requesterId : requesterAdminId;
    if (!body.adminId) {
      return res.status(400).json({
        message: "Unable to resolve admin ownership for created user",
      });
    }
  }

  // Platform roles must explicitly link hotel/restaurant/activity accounts to an admin
  if (
    PLATFORM_ROLES.has(role) &&
    ADMIN_OWNED_ROLES.has(body.role) &&
    !body.adminId
  ) {
    return res.status(400).json({
      message:
        "adminId is required when creating hotel/restaurant/activity accounts",
    });
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

  const updatePermission = permissionForRoleAction(user.role, "edit");
  if (!ensurePermission(req, res, updatePermission)) {
    return;
  }

  Object.assign(user, rest);
  if (password) user.password = password;
  await user.save();
  const doc = user.toObject();
  delete doc.password;
  // Notify the affected user in real-time if their permissions changed
  if (rest.permissions !== undefined) {
    emitPermissionsUpdated(String(user._id), doc.permissions || []);
  }
  res.json(doc);
});

const remove = asyncHandler(async (req, res) => {
  const item = await User.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "User not found" });

  const deletePermission = permissionForRoleAction(item.role, "delete");
  if (!ensurePermission(req, res, deletePermission)) {
    return;
  }

  await item.deleteOne();
  res.json({ message: "User deleted" });
});

module.exports = { list, getOne, create, update, remove };
