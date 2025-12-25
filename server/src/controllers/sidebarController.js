const { defaultSidebar } = require("../utils/permissions");

function getSidebar(req, res) {
  const permissions = req.user?.permissions || [];
  const userRole = req.user?.role || "user";
  const menu = defaultSidebar(userRole).filter(
    (item) =>
      !item.required_permission ||
      permissions.includes(item.required_permission)
  );
  res.json({ menu });
}

module.exports = { getSidebar };
