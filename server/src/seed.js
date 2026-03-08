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

const roleDefinitions = {
  super_admin: flattenPermissions(),
  admin: [
    "users:view",
    "hotels:view",
    "hotels:add",
    "hotels:edit",
    "restaurants:view",
    "restaurants:add",
    "restaurants:edit",
    "activities:view",
    "activities:add",
    "activities:edit",
    "bookings:view",
    "bookings:add",
    "bookings:edit",
    "rooms:view",
    "rooms:add",
    "rooms:edit",
    "finance:view",
    "reports:view",
  ],
  hotel: [
    "bookings:view",
    "bookings:add",
    "bookings:edit",
    "rooms:view",
    "rooms:add",
    "rooms:edit",
    "finance:view",
    "reports:view",
  ],
  restaurant: [
    "bookings:view",
    "bookings:add",
    "bookings:edit",
    "rooms:view",
    "rooms:add",
    "rooms:edit",
    "finance:view",
    "reports:view",
  ],
  activity: [
    "activities:view",
    "activities:edit",
    "bookings:view",
    "bookings:add",
    "bookings:edit",
    "reports:view",
  ],
};

const userDefinitions = [
  {
    name: "Super Admin",
    email: "super@arkedia.com",
    password: "Password123!",
    role: "super_admin",
    permissions: [],
  },
  {
    name: "Admin Company",
    email: "admin@arkedia.com",
    password: "Password123!",
    role: "admin",
    permissions: [],
  },
  {
    name: "Hotel Manager",
    email: "hotel@arkedia.com",
    password: "Password123!",
    role: "hotel",
    permissions: [],
  },
  {
    name: "Restaurant Manager",
    email: "restaurant@arkedia.com",
    password: "Password123!",
    role: "restaurant",
    permissions: [],
  },
  {
    name: "Activity Manager",
    email: "activity@arkedia.com",
    password: "Password123!",
    role: "activity",
    permissions: [],
  },
];

async function upsertRole(name, permissions) {
  await Role.findOneAndUpdate(
    { name },
    { name, permissions },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

async function upsertUser(def) {
  let user = await User.findOne({ email: def.email });
  if (!user) {
    user = new User(def);
  } else {
    user.name = def.name;
    user.role = def.role;
    user.permissions = def.permissions;
    user.password = def.password; // will be re-hashed on save
  }
  await user.save();
}

async function run() {
  await connectDb();
  for (const [role, permissions] of Object.entries(roleDefinitions)) {
    await upsertRole(role, permissions);
  }
  for (const user of userDefinitions) {
    await upsertUser(user);
  }
  console.log("Seed complete: roles and users ready.");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
