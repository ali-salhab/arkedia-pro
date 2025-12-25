const router = require("express").Router();
const auth = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");
const controller = require("../controllers/hotelController");

router.use(auth);
router.get("/", requirePermission("hotels:view"), controller.list);
router.get("/:id", requirePermission("hotels:view"), controller.getOne);
router.post("/", requirePermission("hotels:add"), controller.create);
router.put("/:id", requirePermission("hotels:edit"), controller.update);
router.delete("/:id", requirePermission("hotels:delete"), controller.remove);

module.exports = router;
