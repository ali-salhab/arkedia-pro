const router = require("express").Router();
const auth = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");
const {
  listFinance,
  upsertFinance,
} = require("../controllers/financeController");

router.use(auth);
router.get("/", requirePermission("finance:view"), listFinance);
router.post("/", requirePermission("finance:add"), upsertFinance);
router.put("/", requirePermission("finance:edit"), upsertFinance);

module.exports = router;
