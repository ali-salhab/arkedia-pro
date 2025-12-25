const router = require("express").Router();
const auth = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");
const controller = require("../controllers/roomController");

router.use(auth);
router.get("/", requirePermission("rooms:view"), controller.list);
router.get("/:id", requirePermission("rooms:view"), controller.getOne);
router.post("/", requirePermission("rooms:add"), controller.create);
router.put("/:id", requirePermission("rooms:edit"), controller.update);
router.delete("/:id", requirePermission("rooms:delete"), controller.remove);

module.exports = router;
