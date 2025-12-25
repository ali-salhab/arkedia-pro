function requireRole(...allowed) {
  return function roleGuard(req, res, next) {
    const role = req.user?.role;
    if (!role || !allowed.includes(role)) {
      return res.status(403).json({ message: "Insufficient role" });
    }
    return next();
  };
}

module.exports = requireRole;
