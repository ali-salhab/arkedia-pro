const router = require("express").Router();
const auth = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");
const { listPermissions } = require("../controllers/permissionController");

router.use(auth);
router.get("/", requirePermission("roles:view"), listPermissions);

module.exports = router;
