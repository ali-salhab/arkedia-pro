const router = require("express").Router();
const auth = require("../middleware/auth");
const controller = require("../controllers/userController");
const { buildDataControllers } = require("../controllers/dataController");
const User = require("../models/User");

const data = buildDataControllers(User, "users");

router.use(auth);
router.get("/export", data.exportData);
router.get("/template", data.downloadTemplate);
router.post("/import", data.importData);
router.get("/", controller.list);
router.get("/:id", controller.getOne);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;

