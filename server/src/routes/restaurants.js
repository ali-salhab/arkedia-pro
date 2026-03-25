const router = require("express").Router();
const auth = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");
const controller = require("../controllers/restaurantController");
const { buildDataControllers } = require("../controllers/dataController");
const Restaurant = require("../models/Restaurant");

const data = buildDataControllers(Restaurant, "restaurants");

router.use(auth);
router.get("/export", requirePermission("restaurants:view"), data.exportData);
router.get("/template", requirePermission("restaurants:view"), data.downloadTemplate);
router.post("/import", requirePermission("restaurants:add"), data.importData);
router.get("/", requirePermission("restaurants:view"), controller.list);
router.get("/:id", requirePermission("restaurants:view"), controller.getOne);
router.post("/", requirePermission("restaurants:add"), controller.create);
router.put("/:id", requirePermission("restaurants:edit"), controller.update);
router.delete("/:id", requirePermission("restaurants:delete"), controller.remove);

module.exports = router;

