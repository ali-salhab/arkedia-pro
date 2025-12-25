const router = require("express").Router();
const auth = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");
const controller = require("../controllers/userController");

router.use(auth);
router.get("/", requirePermission("users:view"), controller.list);
router.get("/:id", requirePermission("users:view"), controller.getOne);
router.post("/", requirePermission("users:add"), controller.create);
router.put("/:id", requirePermission("users:edit"), controller.update);
router.delete("/:id", requirePermission("users:delete"), controller.remove);

module.exports = router;
