const router = require("express").Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const controller = require("../controllers/iconController");

router.use(auth);

// Any authenticated user can view available icons
router.get("/", controller.list);

// Super admin only — query pending requests & manage the library
router.get(
  "/requests",
  requireRole("super_admin", "superadminuser"),
  controller.listRequests,
);
router.post(
  "/",
  requireRole("super_admin", "superadminuser"),
  controller.create,
);
router.put(
  "/:id",
  requireRole("super_admin", "superadminuser"),
  controller.update,
);
router.delete(
  "/:id",
  requireRole("super_admin", "superadminuser"),
  controller.remove,
);

// Any authenticated hotel/admin can request a new icon
router.post("/request", controller.requestIcon);

module.exports = router;
