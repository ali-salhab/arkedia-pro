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
    permissions: mergedPermissions,
  };
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
  const mergedPermissions = Array.from(
    new Set([...(roleDoc?.permissions || []), ...(user.permissions || [])])
  );

  const payloadUser = buildUserPayload(user, mergedPermissions);
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
  const mergedPermissions = Array.from(
    new Set([...(roleDoc?.permissions || []), ...(user.permissions || [])])
  );
  const payloadUser = buildUserPayload(user, mergedPermissions);

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

module.exports = { login, refresh, logout };
