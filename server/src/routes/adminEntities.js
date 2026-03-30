const router = require("express").Router();
const auth = require("../middleware/auth");
const { getAdminEntities } = require("../controllers/adminEntitiesController");

router.use(auth);
router.get("/entities", getAdminEntities);

module.exports = router;
