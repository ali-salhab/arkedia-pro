const router = require("express").Router();
const auth = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");
const controller = require("../controllers/hotelServiceController");

router.use(auth);
router.get("/", requirePermission("hotels:view"), controller.list);
router.get("/:id", requirePermission("hotels:view"), controller.getOne);
router.post("/", requirePermission("hotels:edit"), controller.create);
router.put("/:id", requirePermission("hotels:edit"), controller.update);
router.delete("/:id", requirePermission("hotels:edit"), controller.remove);

module.exports = router;
