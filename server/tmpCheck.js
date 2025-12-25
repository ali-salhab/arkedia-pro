require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const u = await User.findOne({ email: "super@arkedia.com" }).select(
      "+password"
    );
    if (!u) {
      console.log("no user");
      process.exit(1);
    }
    console.log("compare", await bcrypt.compare("Password123!", u.password));
    console.log("hash", u.password);
    console.log("role", u.role);
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
  }
})();
