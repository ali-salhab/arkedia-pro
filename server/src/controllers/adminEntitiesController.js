const asyncHandler = require("../middleware/asyncHandler");
const Hotel = require("../models/Hotel");
const Restaurant = require("../models/Restaurant");
const Activity = require("../models/Activity");
const User = require("../models/User");

/**
 * GET /api/admin/entities
 * Returns all hotels, restaurants, activities belonging to the current admin.
 */
const getAdminEntities = asyncHandler(async (req, res) => {
  const callerRole = req.user.role;
  let adminId;

  if (callerRole === "admin") {
    adminId = req.user._id;
  } else if (callerRole === "adminuser") {
    adminId = req.user.adminId;
  } else if (["super_admin", "superadminuser"].includes(callerRole)) {
    // Super admin can see all
    const [hotels, restaurants, activities] = await Promise.all([
      Hotel.find().select("name city country stars thumbnail").lean(),
      Restaurant.find().select("name cuisine location").lean(),
      Activity.find().select("name category location").lean(),
    ]);

    // Fetch manager users for each entity
    const managerMap = {};
    const managerUsers = await User.find({
      role: { $in: ["hotel", "restaurant", "activity"] },
    }).select("_id role hotelId restaurantId activityId name").lean();

    for (const u of managerUsers) {
      if (u.hotelId) managerMap[`hotel_${u.hotelId}`] = u;
      if (u.restaurantId) managerMap[`restaurant_${u.restaurantId}`] = u;
      if (u.activityId) managerMap[`activity_${u.activityId}`] = u;
    }

    return res.json({
      hotels: hotels.map((h) => ({ ...h, manager: managerMap[`hotel_${h._id}`] || null })),
      restaurants: restaurants.map((r) => ({ ...r, manager: managerMap[`restaurant_${r._id}`] || null })),
      activities: activities.map((a) => ({ ...a, manager: managerMap[`activity_${a._id}`] || null })),
    });
  } else {
    return res.status(403).json({ message: "Not authorized" });
  }

  const [hotels, restaurants, activities] = await Promise.all([
    Hotel.find({ adminId }).select("name city country stars thumbnail").lean(),
    Restaurant.find({ adminId }).select("name cuisine location").lean(),
    Activity.find({ adminId }).select("name category location").lean(),
  ]);

  // Fetch manager users for each entity
  const managerUsers = await User.find({
    adminId,
    role: { $in: ["hotel", "restaurant", "activity"] },
  }).select("_id role hotelId restaurantId activityId name").lean();

  const managerMap = {};
  for (const u of managerUsers) {
    if (u.hotelId) managerMap[`hotel_${u.hotelId}`] = u;
    if (u.restaurantId) managerMap[`restaurant_${u.restaurantId}`] = u;
    if (u.activityId) managerMap[`activity_${u.activityId}`] = u;
  }

  res.json({
    hotels: hotels.map((h) => ({ ...h, manager: managerMap[`hotel_${h._id}`] || null })),
    restaurants: restaurants.map((r) => ({ ...r, manager: managerMap[`restaurant_${r._id}`] || null })),
    activities: activities.map((a) => ({ ...a, manager: managerMap[`activity_${a._id}`] || null })),
  });
});

module.exports = { getAdminEntities };
