const router = require("express").Router();
const auth = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");
const controller = require("../controllers/bookingController");

router.use(auth);
router.get("/", requirePermission("bookings:view"), controller.list);
router.get("/:id", requirePermission("bookings:view"), controller.getOne);
router.post("/", requirePermission("bookings:add"), controller.create);
router.put("/:id", requirePermission("bookings:edit"), controller.update);
router.delete("/:id", requirePermission("bookings:delete"), controller.remove);

module.exports = router;
