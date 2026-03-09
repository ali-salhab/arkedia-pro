/**
 * Safe one-time migration: adds any missing role-default permissions to
 * existing users without removing custom-set permissions.
 *
 * Run with:  node src/migrate-permissions.js
 */
require("dotenv").config({
  path: require("path").resolve(
    __dirname,
    `../.env.${process.env.NODE_ENV || "development"}`,
  ),
});
const connectDb = require("./config/db");
const User = require("./models/User");
const { flattenPermissions } = require("./utils/permissions");

const roleDefaults = {
  super_admin: flattenPermissions(),
  superadminuser: [
    "users:view",
    "hotels:view",
    "restaurants:view",
    "activities:view",
    "bookings:view",
    "finance:view",
    "reports:view",
  ],
  admin: [
    "users:view",
    "users:add",
    "users:edit",
    "users:delete",
    "hotels:view",
    "hotels:add",
    "hotels:edit",
    "hotels:delete",
    "restaurants:view",
    "restaurants:add",
    "restaurants:edit",
    "restaurants:delete",
    "activities:view",
    "activities:add",
    "activities:edit",
    "activities:delete",
    "bookings:view",
    "bookings:add",
    "bookings:edit",
    "rooms:view",
    "rooms:add",
    "rooms:edit",
    "rooms:delete",
    "finance:view",
    "reports:view",
    "settings:view",
    "settings:edit",
  ],
  adminuser: [
    "hotels:view",
    "restaurants:view",
    "activities:view",
    "bookings:view",
    "finance:view",
    "reports:view",
  ],
  hotel: [
    "users:view",
    "users:add",
    "users:edit",
    "users:delete",
    "rooms:view",
    "rooms:add",
    "rooms:edit",
    "rooms:delete",
    "bookings:view",
    "bookings:add",
    "bookings:edit",
    "finance:view",
    "reports:view",
    "settings:view",
  ],
  hoteluser: ["rooms:view", "bookings:view", "bookings:add", "bookings:edit"],
  restaurant: [
    "users:view",
    "users:add",
    "users:edit",
    "users:delete",
    "rooms:view",
    "rooms:add",
    "rooms:edit",
    "rooms:delete",
    "bookings:view",
    "bookings:add",
    "bookings:edit",
    "finance:view",
    "reports:view",
    "settings:view",
  ],
  restaurantuser: [
    "rooms:view",
    "bookings:view",
    "bookings:add",
    "bookings:edit",
  ],
  activity: [
    "users:view",
    "users:add",
    "users:edit",
    "users:delete",
    "activities:view",
    "activities:edit",
    "bookings:view",
    "bookings:add",
    "bookings:edit",
    "finance:view",
    "reports:view",
    "settings:view",
  ],
  activityuser: [
    "activities:view",
    "bookings:view",
    "bookings:add",
    "bookings:edit",
  ],
};

async function run() {
  await connectDb();
  const users = await User.find({});
  let updated = 0;

  for (const user of users) {
    const defaults = roleDefaults[user.role];
    if (!defaults) continue;

    const current = new Set(user.permissions || []);
    const missing = defaults.filter((p) => !current.has(p));

    if (missing.length > 0) {
      user.permissions = [...current, ...missing];
      await user.save();
      console.log(
        `Updated [${user.role}] ${user.email} — added: ${missing.join(", ")}`,
      );
      updated++;
    }
  }

  console.log(`\nDone. ${updated} user(s) updated out of ${users.length}.`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
