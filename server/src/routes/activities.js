const router = require("express").Router();
const auth = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");
const controller = require("../controllers/activityController");

router.use(auth);
router.get("/", requirePermission("activities:view"), controller.list);
router.get("/:id", requirePermission("activities:view"), controller.getOne);
router.post("/", requirePermission("activities:add"), controller.create);
router.put("/:id", requirePermission("activities:edit"), controller.update);
router.delete(
  "/:id",
  requirePermission("activities:delete"),
  controller.remove
);

module.exports = router;
