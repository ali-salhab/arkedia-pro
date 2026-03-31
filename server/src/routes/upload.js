const router = require("express").Router();
const auth = require("../middleware/auth");
const { uploadImage } = require("../controllers/uploadController");

router.post("/", auth, uploadImage);

module.exports = router;
