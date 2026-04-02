const express = require("express");
const {
  signup,
  login,
  verifyEmail,
  resendVerification,
} = require("../controllers/publicClientAuthController");

const router = express.Router();

router.post("/signup",              signup);
router.post("/login",               login);
router.get( "/verify-email",        verifyEmail);
router.post("/resend-verification", resendVerification);

module.exports = router;