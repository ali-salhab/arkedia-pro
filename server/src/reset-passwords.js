/**
 * Emergency password reset script.
 * Run via Render shell: node src/reset-passwords.js
 * Resets ALL seed users to their default passwords regardless of existing state.
 */
require("dotenv").config({
  path: require("path").resolve(
    __dirname,
    `../.env.${process.env.NODE_ENV || "development"}`,
  ),
});
const connectDb = require("./config/db");
const User = require("./models/User");
const Role = require("./models/Role");
const { flattenPermissions } = require("./utils/permissions");

const seedUsers = [
  {
    email: "super@arkedia.com",
    password: "Password123!",
    name: "Super Admin",
    role: "super_admin",
  },
  {
    email: "admin@arkedia.com",
    password: "Password123!",
    name: "Admin Company",
    role: "admin",
  },
  {
    email: "hotel@arkedia.com",
    password: "Password123!",
    name: "Hotel Manager",
    role: "hotel",
  },
  {
    email: "restaurant@arkedia.com",
    password: "Password123!",
    name: "Restaurant Manager",
    role: "restaurant",
  },
  {
    email: "activity@arkedia.com",
    password: "Password123!",
    name: "Activity Manager",
    role: "activity",
  },
];

async function run() {
  await connectDb();

  for (const def of seedUsers) {
    let user = await User.findOne({ email: def.email });
    if (!user) {
      user = new User(def);
      console.log(`Creating ${def.email}`);
    } else {
      user.name = def.name;
      user.role = def.role;
      user.password = def.password; // triggers bcrypt hash via pre-save hook
      console.log(`Resetting password for ${def.email}`);
    }
    await user.save();
  }

  console.log("Done.");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
