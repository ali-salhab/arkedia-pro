const router = require("express").Router();
const auth = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");
const controller = require("../controllers/restaurantController");

router.use(auth);
router.get("/", requirePermission("restaurants:view"), controller.list);
router.get("/:id", requirePermission("restaurants:view"), controller.getOne);
router.post("/", requirePermission("restaurants:add"), controller.create);
router.put("/:id", requirePermission("restaurants:edit"), controller.update);
router.delete(
  "/:id",
  requirePermission("restaurants:delete"),
  controller.remove
);

module.exports = router;
