const router = require("express").Router();
const auth = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");
const controller = require("../controllers/roomController");
const { buildDataControllers } = require("../controllers/dataController");
const Room = require("../models/Room");

const data = buildDataControllers(Room, "rooms");

router.use(auth);
router.get("/export", requirePermission("rooms:view"), data.exportData);
router.get("/template", requirePermission("rooms:view"), data.downloadTemplate);
router.post("/import", requirePermission("rooms:add"), data.importData);
router.get("/", requirePermission("rooms:view"), controller.list);
router.get("/:id", requirePermission("rooms:view"), controller.getOne);
router.post("/", requirePermission("rooms:add"), controller.create);
router.put("/:id", requirePermission("rooms:edit"), controller.update);
router.delete("/:id", requirePermission("rooms:delete"), controller.remove);

module.exports = router;

