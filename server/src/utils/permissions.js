const permissionMatrix = [
  { module: "users", actions: ["view", "add", "edit", "delete"] },
  { module: "roles", actions: ["view", "add", "edit", "delete"] },
  { module: "hotels", actions: ["view", "add", "edit", "delete"] },
  { module: "restaurants", actions: ["view", "add", "edit", "delete"] },
  { module: "activities", actions: ["view", "add", "edit", "delete"] },
  { module: "bookings", actions: ["view", "add", "edit", "delete"] },
  { module: "rooms", actions: ["view", "add", "edit", "delete"] },
  { module: "finance", actions: ["view", "add", "edit", "delete"] },
  { module: "reports", actions: ["view"] },
  { module: "settings", actions: ["view", "edit"] },
];

function flattenPermissions() {
  return permissionMatrix.flatMap((entry) =>
    entry.actions.map((action) => `${entry.module}:${action}`),
  );
}

function defaultSidebar(userRole) {
  // Super Admin sees all resources globally
  if (userRole === "super_admin") {
    return [
      {
        name: "Dashboard",
        icon: "dashboard",
        route: "/super-admin",
        required_permission: null,
      },
      {
        name: "Users",
        icon: "users",
        route: "/users",
        required_permission: "users:view",
      },
      {
        name: "Admins",
        icon: "admins",
        route: "/admins",
        required_permission: "users:view",
      },
      {
        name: "All Hotels",
        icon: "hotel",
        route: "/hotels",
        required_permission: "hotels:view",
      },
      {
        name: "All Restaurants",
        icon: "restaurant",
        route: "/restaurants",
        required_permission: "restaurants:view",
      },
      {
        name: "All Activities",
        icon: "activity",
        route: "/activities",
        required_permission: "activities:view",
      },
      {
        name: "All Bookings",
        icon: "calendar",
        route: "/bookings",
        required_permission: "bookings:view",
      },
      {
        name: "Rooms/Tables",
        icon: "room",
        route: "/rooms",
        required_permission: "rooms:view",
      },
      {
        name: "Finance",
        icon: "finance",
        route: "/finance",
        required_permission: "finance:view",
      },
      {
        name: "Reports",
        icon: "reports",
        route: "/reports",
        required_permission: "reports:view",
      },
      {
        name: "Settings",
        icon: "settings",
        route: "/settings",
        required_permission: null,
      },
    ];
  }

  // Admin sees their own company's resources
  if (userRole === "admin") {
    return [
      {
        name: "Dashboard",
        icon: "dashboard",
        route: "/admin",
        required_permission: null,
      },
      {
        name: "My Team",
        icon: "users",
        route: "/users",
        required_permission: "users:view",
      },
      {
        name: "My Hotels",
        icon: "hotel",
        route: "/hotels",
        required_permission: "hotels:view",
      },
      {
        name: "My Restaurants",
        icon: "restaurant",
        route: "/restaurants",
        required_permission: "restaurants:view",
      },
      {
        name: "My Activities",
        icon: "activity",
        route: "/activities",
        required_permission: "activities:view",
      },
      {
        name: "Bookings",
        icon: "calendar",
        route: "/bookings",
        required_permission: "bookings:view",
      },
      {
        name: "Finance",
        icon: "finance",
        route: "/finance",
        required_permission: "finance:view",
      },
      {
        name: "Reports",
        icon: "reports",
        route: "/reports",
        required_permission: "reports:view",
      },
      {
        name: "Settings",
        icon: "settings",
        route: "/settings",
        required_permission: null,
      },
    ];
  }

  // Hotel user
  if (userRole === "hotel") {
    return [
      {
        name: "Dashboard",
        icon: "dashboard",
        route: "/hotel",
        required_permission: null,
      },
      {
        name: "My Team",
        icon: "users",
        route: "/users",
        required_permission: "users:view",
      },
      {
        name: "Rooms",
        icon: "room",
        route: "/rooms",
        required_permission: "rooms:view",
      },
      {
        name: "Bookings",
        icon: "calendar",
        route: "/bookings",
        required_permission: "bookings:view",
      },
      {
        name: "Finance",
        icon: "finance",
        route: "/finance",
        required_permission: "finance:view",
      },
      {
        name: "Reports",
        icon: "reports",
        route: "/reports",
        required_permission: "reports:view",
      },
      {
        name: "Settings",
        icon: "settings",
        route: "/settings",
        required_permission: null,
      },
    ];
  }

  // Restaurant user
  if (userRole === "restaurant") {
    return [
      {
        name: "Dashboard",
        icon: "dashboard",
        route: "/restaurant",
        required_permission: null,
      },
      {
        name: "My Team",
        icon: "users",
        route: "/users",
        required_permission: "users:view",
      },
      {
        name: "Tables",
        icon: "room",
        route: "/rooms",
        required_permission: "rooms:view",
      },
      {
        name: "Reservations",
        icon: "calendar",
        route: "/bookings",
        required_permission: "bookings:view",
      },
      {
        name: "Finance",
        icon: "finance",
        route: "/finance",
        required_permission: "finance:view",
      },
      {
        name: "Reports",
        icon: "reports",
        route: "/reports",
        required_permission: "reports:view",
      },
      {
        name: "Settings",
        icon: "settings",
        route: "/settings",
        required_permission: null,
      },
    ];
  }

  // Activity user
  if (userRole === "activity") {
    return [
      {
        name: "Dashboard",
        icon: "dashboard",
        route: "/activity",
        required_permission: null,
      },
      {
        name: "My Team",
        icon: "users",
        route: "/users",
        required_permission: "users:view",
      },
      {
        name: "Activities",
        icon: "activity",
        route: "/activities",
        required_permission: "activities:view",
      },
      {
        name: "Bookings",
        icon: "calendar",
        route: "/bookings",
        required_permission: "bookings:view",
      },
      {
        name: "Finance",
        icon: "finance",
        route: "/finance",
        required_permission: "finance:view",
      },
      {
        name: "Reports",
        icon: "reports",
        route: "/reports",
        required_permission: "reports:view",
      },
      {
        name: "Settings",
        icon: "settings",
        route: "/settings",
        required_permission: null,
      },
    ];
  }

  // Default fallback
  return [
    {
      name: "Dashboard",
      icon: "dashboard",
      route: "/dashboard",
      required_permission: null,
    },
    {
      name: "Settings",
      icon: "settings",
      route: "/settings",
      required_permission: null, // available to all authenticated users
    },
  ];
}

module.exports = { permissionMatrix, flattenPermissions, defaultSidebar };
