const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/User");
const Role = require("../models/Role");
const RefreshToken = require("../models/RefreshToken");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");

function buildUserPayload(userDoc, mergedPermissions) {
  return {
    _id: userDoc._id,
    email: userDoc.email,
    name: userDoc.name,
    role: userDoc.role,
    logo: userDoc.logo || null,
    permissions: mergedPermissions,
    adminId: userDoc.adminId || null,
    hotelId: userDoc.hotelId || null,
    restaurantId: userDoc.restaurantId || null,
    activityId: userDoc.activityId || null,
  };
}

/**
 * If the user has explicit permissions stored, honour them exactly.
 * Only fall back to the Role-document baseline when the user has none
 * (e.g. freshly-seeded accounts whose permissions array is empty).
 */
function resolvePermissions(userPermissions, rolePermissions) {
  if (userPermissions && userPermissions.length > 0) {
    return userPermissions;
  }
  return rolePermissions || [];
}

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const valid = await user.comparePassword(password);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });

  const roleDoc = await Role.findOne({ name: user.role });
  const permissions = resolvePermissions(
    user.permissions,
    roleDoc?.permissions,
  );

  const payloadUser = buildUserPayload(user, permissions);
  const accessToken = signAccessToken(payloadUser);
  const { token: refreshToken, tokenId } = signRefreshToken(payloadUser);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await RefreshToken.create({
    user: user._id,
    token: refreshToken,
    tokenId,
    expiresAt,
  });

  res.json({ user: payloadUser, accessToken, refreshToken });
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(400).json({ message: "refreshToken required" });

  const decoded = verifyRefreshToken(refreshToken);
  const stored = await RefreshToken.findOne({
    tokenId: decoded.tokenId,
    token: refreshToken,
  });
  if (!stored || stored.expiresAt < new Date()) {
    return res.status(401).json({ message: "Refresh token expired" });
  }

  const user = await User.findById(decoded.sub);
  if (!user) return res.status(404).json({ message: "User not found" });
  const roleDoc = await Role.findOne({ name: user.role });
  const permissions = resolvePermissions(
    user.permissions,
    roleDoc?.permissions,
  );
  const payloadUser = buildUserPayload(user, permissions);

  const accessToken = signAccessToken(payloadUser);
  const { token: newRefreshToken, tokenId } = signRefreshToken(payloadUser);

  stored.token = newRefreshToken;
  stored.tokenId = tokenId;
  stored.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await stored.save();

  res.json({ user: payloadUser, accessToken, refreshToken: newRefreshToken });
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await RefreshToken.deleteOne({ token: refreshToken });
  }
  res.json({ message: "Logged out" });
});

/**
 * POST /api/auth/impersonate
 * Allows admin/super_admin to switch into one of their subordinate manager accounts.
 * Body: { userId: "<manager user _id>" }
 */
const impersonate = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "userId required" });

  const caller = req.user;
  const callerRole = caller.role;
  const callerId = String(caller._id);

  // Only admin, adminuser, super_admin, superadminuser may impersonate
  const allowed = ["admin", "adminuser", "super_admin", "superadminuser"];
  if (!allowed.includes(callerRole)) {
    return res.status(403).json({ message: "Not authorized to impersonate" });
  }

  const target = await User.findById(userId);
  if (!target) return res.status(404).json({ message: "User not found" });

  // Admin can only impersonate their own subordinate managers
  if (["admin", "adminuser"].includes(callerRole)) {
    const adminId = callerRole === "admin" ? callerId : String(caller.adminId);
    if (String(target.adminId) !== adminId) {
      return res.status(403).json({ message: "Not your subordinate" });
    }
  }

  // Target must be a manager role
  const managerRoles = ["hotel", "restaurant", "activity"];
  if (!managerRoles.includes(target.role)) {
    return res.status(400).json({ message: "Can only impersonate entity managers" });
  }

  const roleDoc = await Role.findOne({ name: target.role });
  const permissions = resolvePermissions(target.permissions, roleDoc?.permissions);
  const payloadUser = buildUserPayload(target, permissions);

  const accessToken = signAccessToken(payloadUser);
  const { token: refreshToken, tokenId } = signRefreshToken(payloadUser);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await RefreshToken.create({ user: target._id, token: refreshToken, tokenId, expiresAt });

  res.json({ user: payloadUser, accessToken, refreshToken });
});

module.exports = { login, refresh, logout, impersonate };
