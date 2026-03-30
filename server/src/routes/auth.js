const router = require("express").Router();
const auth = require("../middleware/auth");
const { login, refresh, logout, impersonate } = require("../controllers/authController");

router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/impersonate", auth, impersonate);

module.exports = router;
