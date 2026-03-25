const router = require("express").Router();
const auth = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");
const controller = require("../controllers/activityController");
const { buildDataControllers } = require("../controllers/dataController");
const Activity = require("../models/Activity");

const data = buildDataControllers(Activity, "activities");

router.use(auth);
router.get("/export", requirePermission("activities:view"), data.exportData);
router.get("/template", requirePermission("activities:view"), data.downloadTemplate);
router.post("/import", requirePermission("activities:add"), data.importData);
router.get("/", requirePermission("activities:view"), controller.list);
router.get("/:id", requirePermission("activities:view"), controller.getOne);
router.post("/", requirePermission("activities:add"), controller.create);
router.put("/:id", requirePermission("activities:edit"), controller.update);
router.delete("/:id", requirePermission("activities:delete"), controller.remove);

module.exports = router;

