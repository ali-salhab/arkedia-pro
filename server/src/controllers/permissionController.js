const {
  permissionMatrix,
  flattenPermissions,
} = require("../utils/permissions");

function listPermissions(req, res) {
  res.json({ matrix: permissionMatrix, flat: flattenPermissions() });
}

module.exports = { listPermissions };
