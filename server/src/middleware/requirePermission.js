function requirePermission(permission) {
  return function permissionGuard(req, res, next) {
    const permissions = req.user?.permissions || [];
    if (!permissions.includes(permission)) {
      return res
        .status(403)
        .json({ message: "Missing permission", permission });
    }
    return next();
  };
}

module.exports = requirePermission;
