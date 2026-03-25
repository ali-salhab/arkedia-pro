const router = require("express").Router();
const auth = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");
const controller = require("../controllers/hotelController");
const { buildDataControllers } = require("../controllers/dataController");
const Hotel = require("../models/Hotel");

const data = buildDataControllers(Hotel, "hotels");

router.use(auth);
router.get("/export", requirePermission("hotels:view"), data.exportData);
router.get("/template", requirePermission("hotels:view"), data.downloadTemplate);
router.post("/import", requirePermission("hotels:add"), data.importData);
router.get("/", requirePermission("hotels:view"), controller.list);
router.get("/:id", requirePermission("hotels:view"), controller.getOne);
router.post("/", requirePermission("hotels:add"), controller.create);
router.put("/:id", requirePermission("hotels:edit"), controller.update);
router.delete("/:id", requirePermission("hotels:delete"), controller.remove);

module.exports = router;

