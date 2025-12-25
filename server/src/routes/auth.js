const router = require("express").Router();
const { login, refresh, logout } = require("../controllers/authController");

router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

module.exports = router;
