const jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");

const accessSecret = process.env.JWT_SECRET || "secret";
const refreshSecret = process.env.JWT_REFRESH_SECRET || "refresh-secret";

function buildPayload(user, tokenId) {
  const id = user._id?.toString?.() || user.id || user.sub;
  return {
    sub: id,
    _id: id,
    email: user.email,
    name: user.name,
    role: user.role,
    adminId: user.adminId || null,
    permissions: user.permissions || [],
    tokenId,
  };
}

function signAccessToken(user) {
  return jwt.sign(buildPayload(user), accessSecret, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "15m",
  });
}

function signRefreshToken(user, tokenId = uuid()) {
  return {
    tokenId,
    token: jwt.sign(buildPayload(user, tokenId), refreshSecret, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES || "7d",
    }),
  };
}

function verifyAccessToken(token) {
  return jwt.verify(token, accessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, refreshSecret);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
