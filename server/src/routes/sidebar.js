const router = require("express").Router();
const auth = require("../middleware/auth");
const { getSidebar } = require("../controllers/sidebarController");

router.use(auth);
router.get("/", getSidebar);

module.exports = router;
