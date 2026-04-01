/**
 * One-time migration: for every existing user with role hotel / restaurant / activity
 * that has no linked entity document, create one now.
 *
 * Run (from server/ folder):
 *   node src/migrate-entity-docs.js
 *
 * Safe to run multiple times – it skips accounts that already have a document.
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config({
  path: path.resolve(__dirname, `../.env.${process.env.NODE_ENV || "development"}`),
  override: true,
});

const connectDb = require("./config/db");
const User = require("./models/User");
const Hotel = require("./models/Hotel");
const Restaurant = require("./models/Restaurant");
const Activity = require("./models/Activity");

async function run() {
  await connectDb();

  const managers = await User.find({ role: { $in: ["hotel", "restaurant", "activity"] } });
  console.log(`Found ${managers.length} manager account(s) to check.`);

  let created = 0;
  let skipped = 0;

  for (const user of managers) {
    const managerId = user._id;
    const adminId = user.adminId || null;
    const fallbackName = user.name || user.email;

    if (user.role === "hotel") {
      let hotel = await Hotel.findOne({ manager: managerId });
      if (!hotel && user.hotelId) hotel = await Hotel.findById(user.hotelId);

      if (!hotel) {
        hotel = await Hotel.create({ name: fallbackName, manager: managerId, adminId });
        user.hotelId = hotel._id;
        await user.save();
        console.log(`  [hotel] Created Hotel doc "${hotel.name}" for user ${user.email}`);
        created++;
      } else {
        if (!user.hotelId || String(user.hotelId) !== String(hotel._id)) {
          user.hotelId = hotel._id;
          await user.save();
          console.log(`  [hotel] Linked existing Hotel "${hotel.name}" to user ${user.email}`);
          created++;
        } else {
          skipped++;
        }
      }
    }

    if (user.role === "restaurant") {
      let restaurant = await Restaurant.findOne({ manager: managerId });
      if (!restaurant && user.restaurantId) restaurant = await Restaurant.findById(user.restaurantId);

      if (!restaurant) {
        restaurant = await Restaurant.create({ name: fallbackName, manager: managerId, adminId });
        user.restaurantId = restaurant._id;
        await user.save();
        console.log(`  [restaurant] Created Restaurant doc "${restaurant.name}" for user ${user.email}`);
        created++;
      } else {
        if (!user.restaurantId || String(user.restaurantId) !== String(restaurant._id)) {
          user.restaurantId = restaurant._id;
          await user.save();
          console.log(`  [restaurant] Linked existing Restaurant "${restaurant.name}" to user ${user.email}`);
          created++;
        } else {
          skipped++;
        }
      }
    }

    if (user.role === "activity") {
      let activity = await Activity.findOne({ manager: managerId });
      if (!activity && user.activityId) activity = await Activity.findById(user.activityId);

      if (!activity) {
        activity = await Activity.create({ name: fallbackName, manager: managerId, adminId });
        user.activityId = activity._id;
        await user.save();
        console.log(`  [activity] Created Activity doc "${activity.name}" for user ${user.email}`);
        created++;
      } else {
        if (!user.activityId || String(user.activityId) !== String(activity._id)) {
          user.activityId = activity._id;
          await user.save();
          console.log(`  [activity] Linked existing Activity "${activity.name}" to user ${user.email}`);
          created++;
        } else {
          skipped++;
        }
      }
    }
  }

  console.log(`\nDone. Created/linked: ${created}  Already correct: ${skipped}`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
