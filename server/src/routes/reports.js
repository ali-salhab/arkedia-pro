const router = require("express").Router();
const auth = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");
const { listReports } = require("../controllers/reportController");

router.use(auth);
router.get("/", requirePermission("reports:view"), listReports);

module.exports = router;
