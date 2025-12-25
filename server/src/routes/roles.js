const router = require("express").Router();
const auth = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");
const {
  listRoles,
  createRole,
  updateRole,
} = require("../controllers/roleController");

router.use(auth);
router.get("/", requirePermission("roles:view"), listRoles);
router.post("/", requirePermission("roles:add"), createRole);
router.put("/:id", requirePermission("roles:edit"), updateRole);

module.exports = router;
