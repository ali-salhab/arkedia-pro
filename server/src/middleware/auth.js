const { verifyAccessToken } = require("../utils/jwt");

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const bearer = header.startsWith("Bearer ")
    ? header.replace("Bearer ", "")
    : req.cookies?.accessToken;

  if (!bearer) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const payload = verifyAccessToken(bearer);
    req.user = {
      ...payload,
      _id: payload?._id || payload?.sub,
      adminId: payload?.adminId || null,
    };
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = auth;
