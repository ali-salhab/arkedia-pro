import { useMemo, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLanguage } from "../context/LanguageContext";
import { logout } from "../store/slices/authSlice";
import { api } from "../store/services/api";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  UtensilsCrossed,
  Zap,
  CalendarDays,
  BedDouble,
  DollarSign,
  BarChart2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Circle,
  X,
  ClipboardList,
  FileSearch,
  AlignLeft,
  Tag,
  ShieldCheck,
  Images,
  Link2,
  Globe,
} from "lucide-react";

const ROLE_MENUS = {
  super_admin: [
    { name: "Dashboard", route: "/super-admin", perm: null },
    { name: "Icons Library", route: "/super-admin/icons", perm: null },
    { name: "Users", route: "/users", perm: "users:view" },
    { name: "Admins", route: "/admins", perm: "admins:view" },
    { name: "All Hotels", route: "/hotels", perm: "hotels:view" },
    {
      name: "All Restaurants",
      route: "/restaurants",
      perm: "restaurants:view",
    },
    { name: "All Activities", route: "/activities", perm: "activities:view" },
    { name: "All Bookings", route: "/bookings", perm: "bookings:view" },
    { name: "Rooms/Tables", route: "/rooms", perm: "rooms:view" },
    { name: "Finance", route: "/finance", perm: "finance:view" },
    { name: "Reports", route: "/reports", perm: "reports:view" },
    { name: "Settings", route: "/settings", perm: "settings:view" },
  ],
  admin: [
    { name: "Dashboard", route: "/admin", perm: null },
    { name: "Users", route: "/users", perm: "users:view" },
    { name: "My Hotels", route: "/hotels", perm: "hotels:view" },
    { name: "My Restaurants", route: "/restaurants", perm: "restaurants:view" },
    { name: "My Activities", route: "/activities", perm: "activities:view" },
    { name: "Bookings", route: "/bookings", perm: "bookings:view" },
    { name: "Finance", route: "/finance", perm: "finance:view" },
    { name: "Reports", route: "/reports", perm: "reports:view" },
    { name: "Settings", route: "/settings", perm: "settings:view" },
  ],
  hotel: [
    { name: "Dashboard", route: "/hotel", perm: null },
    { name: "Users", route: "/users", perm: "users:view" },
    { name: "Rooms", route: "/rooms", perm: "rooms:view" },
    { name: "Bookings", route: "/bookings", perm: "bookings:view" },
    { name: "Finance", route: "/finance", perm: "finance:view" },
    { name: "Reports", route: "/reports", perm: "reports:view" },
    { name: "Settings", route: "/settings", perm: "settings:view" },
    {
      name: "Hotel Main Details",
      perm: null,
      matchPrefix: "/hotel/details",
      children: [
        {
          name: "Main Details",
          route: "/hotel/details/main",
          Icon: FileSearch,
        },
        {
          name: "Hotel Description",
          route: "/hotel/details/description",
          Icon: AlignLeft,
        },
        { name: "Hotel Icons", route: "/hotel/details/icons", Icon: Tag },
        {
          name: "Hotel Policy",
          route: "/hotel/details/policy",
          Icon: ShieldCheck,
        },
        { name: "Photos", route: "/hotel/details/photos", Icon: Images },
      ],
    },
    {
      name: "Channel Manager",
      perm: "channel_manager:view",
      matchPrefix: "/hotel/channel-manager",
      children: [
        {
          name: "Travky",
          perm: "channel_manager_travky:view",
          matchPrefix: "/hotel/channel-manager/travky",
          children: [
            {
              name: "Guest Groups",
              route: "/hotel/channel-manager/travky/guest-groups",
              perm: "guest_groups:view",
              Icon: Users,
            },
            {
              name: "Meal Plans",
              route: "/hotel/channel-manager/travky/meal-plans",
              perm: "meal_plans:view",
              Icon: UtensilsCrossed,
            },
            {
              name: "Periods",
              route: "/hotel/channel-manager/travky/periods",
              perm: "periods:view",
              Icon: CalendarDays,
            },
            {
              name: "Supplement",
              route: "/hotel/channel-manager/travky/supplements",
              perm: "supplements:view",
              Icon: ClipboardList,
            },
            {
              name: "Refund Policy",
              route: "/hotel/channel-manager/travky/refund-policies",
              perm: "refund_policies:view",
              Icon: ShieldCheck,
            },
            {
              name: "Channel Rooms",
              route: "/hotel/channel-manager/travky/rooms",
              perm: "channel_manager_rooms:view",
              Icon: BedDouble,
            },
            {
              name: "Rates",
              route: "/hotel/channel-manager/travky/rates",
              perm: "rates:view",
              Icon: DollarSign,
            },
            {
              name: "Availability",
              route: "/hotel/channel-manager/travky/availability",
              perm: "availability:view",
              Icon: BarChart2,
            },
          ],
        },
        {
          name: "External",
          route: "/hotel/channel-manager/external",
          perm: "channel_manager_external:view",
          Icon: Globe,
        },
      ],
    },
  ],
  restaurant: [
    { name: "Dashboard", route: "/restaurant", perm: null },
    { name: "Users", route: "/users", perm: "users:view" },
    { name: "Tables", route: "/rooms", perm: "rooms:view" },
    { name: "Reservations", route: "/bookings", perm: "bookings:view" },
    { name: "Finance", route: "/finance", perm: "finance:view" },
    { name: "Reports", route: "/reports", perm: "reports:view" },
    { name: "Settings", route: "/settings", perm: "settings:view" },
    {
      name: "Restaurant Main Details",
      perm: "restaurant:details",
      matchPrefix: "/restaurant/details",
      children: [
        {
          name: "Restaurant Info",
          route: "/restaurant/details/main",
          Icon: FileSearch,
        },
        {
          name: "Restaurant Description",
          route: "/restaurant/details/description",
          Icon: AlignLeft,
        },
        {
          name: "Restaurant Policy",
          route: "/restaurant/details/policy",
          Icon: ShieldCheck,
        },
        {
          name: "Restaurant Photos",
          route: "/restaurant/details/photos",
          Icon: Images,
        },
      ],
    },
  ],
  activity: [
    { name: "Dashboard", route: "/activity", perm: null },
    { name: "Users", route: "/users", perm: "users:view" },
    { name: "Activities", route: "/activities", perm: "activities:view" },
    { name: "Bookings", route: "/bookings", perm: "bookings:view" },
    { name: "Finance", route: "/finance", perm: "finance:view" },
    { name: "Reports", route: "/reports", perm: "reports:view" },
    { name: "Settings", route: "/settings", perm: "settings:view" },
    {
      name: "Activity Main Details",
      perm: "activity:details",
      matchPrefix: "/activity/details",
      children: [
        {
          name: "Activity Info",
          route: "/activity/details/main",
          Icon: FileSearch,
        },
        {
          name: "Activity Description",
          route: "/activity/details/description",
          Icon: AlignLeft,
        },
        { name: "Activity Icons", route: "/activity/details/icons", Icon: Tag },
        {
          name: "Activity Policy",
          route: "/activity/details/policy",
          Icon: ShieldCheck,
        },
        {
          name: "Activity Photos",
          route: "/activity/details/photos",
          Icon: Images,
        },
      ],
    },
  ],
};

const ROLE_MENU_ALIASES = {
  superadminuser: "super_admin",
  adminuser: "admin",
  hoteluser: "hotel",
  restaurantuser: "restaurant",
  activityuser: "activity",
};

const SIDEBAR_NAME_MAP = {
  "Hotel Main Details": "hotelMainDetails",
  "Restaurant Main Details": "restaurantMainDetails",
  "Activity Main Details": "activityMainDetails",
  "Restaurant Info": "restaurantStepMain",
  "Restaurant Description": "restaurantStepDescription",
  "Restaurant Policy": "restaurantStepPolicy",
  "Restaurant Photos": "restaurantStepPhotos",
  "Activity Info": "activityStepMain",
  "Activity Description": "activityStepDescription",
  "Activity Icons": "activityStepIcons",
  "Activity Policy": "activityStepPolicy",
  "Activity Photos": "activityStepPhotos",
  "Icons Library": "iconsLibrary",
  "Channel Manager": "channelManager",
  Travky: "travky",
  External: "external",
  "Guest Groups": "guestGroups",
  "Meal Plans": "mealPlans",
  Periods: "periods",
  Supplement: "supplements",
  "Refund Policy": "refundPolicies",
  "Channel Rooms": "channelManagerRooms",
  Rates: "rates",
  Availability: "availability",
  "Main Details": "hotelStepMain",
  "Hotel Description": "hotelStepDescription",
  "Hotel Icons": "hotelStepIcons",
  "Hotel Policy": "hotelStepPolicy",
  Photos: "hotelStepPhotos",
  Dashboard: "dashboard",
  Users: "users",
  Admins: "admins",
  "My Team": "myTeam",
  "All Hotels": "allHotels",
  "My Hotels": "myHotels",
  "All Restaurants": "allRestaurants",
  "My Restaurants": "myRestaurants",
  "All Activities": "allActivities",
  "My Activities": "myActivities",
  "All Bookings": "allBookings",
  "Rooms/Tables": "roomsTables",
  Rooms: "rooms",
  Tables: "tables",
  Reservations: "reservations",
  Activities: "activities",
  Bookings: "bookings",
  Finance: "finance",
  Reports: "reports",
  Settings: "settings",
};

const ICON_MAP = {
  "Hotel Main Details": <ClipboardList size={17} />,
  "Restaurant Main Details": <UtensilsCrossed size={17} />,
  "Activity Main Details": <Zap size={17} />,
  "Channel Manager": <Link2 size={17} />,
  Dashboard: <LayoutDashboard size={17} />,
  Users: <Users size={17} />,
  Admins: <UserCheck size={17} />,
  "My Team": <Users size={17} />,
  "All Hotels": <Building2 size={17} />,
  "My Hotels": <Building2 size={17} />,
  "All Restaurants": <UtensilsCrossed size={17} />,
  "My Restaurants": <UtensilsCrossed size={17} />,
  "All Activities": <Zap size={17} />,
  "My Activities": <Zap size={17} />,
  "All Bookings": <CalendarDays size={17} />,
  "Rooms/Tables": <BedDouble size={17} />,
  Rooms: <BedDouble size={17} />,
  Tables: <BedDouble size={17} />,
  Reservations: <CalendarDays size={17} />,
  Activities: <Zap size={17} />,
  Bookings: <CalendarDays size={17} />,
  Finance: <DollarSign size={17} />,
  Reports: <BarChart2 size={17} />,
  Settings: <Settings size={17} />,
};

const ROLE_HEADER_CONFIG = {
  hotel: { label: "Hotel", Icon: Building2, bg: "#dcfce7", color: "#16a34a" },
  hoteluser: {
    label: "Hotel",
    Icon: Building2,
    bg: "#dcfce7",
    color: "#16a34a",
  },
  restaurant: {
    label: "Restaurant",
    Icon: UtensilsCrossed,
    bg: "#fff7ed",
    color: "#ea580c",
  },
  restaurantuser: {
    label: "Restaurant",
    Icon: UtensilsCrossed,
    bg: "#fff7ed",
    color: "#ea580c",
  },
  activity: { label: "Activity", Icon: Zap, bg: "#fef9c3", color: "#ca8a04" },
  activityuser: {
    label: "Activity",
    Icon: Zap,
    bg: "#fef9c3",
    color: "#ca8a04",
  },
  admin: { label: "Admin", Icon: UserCheck, bg: "#eff6ff", color: "#2563eb" },
  adminuser: {
    label: "Admin",
    Icon: UserCheck,
    bg: "#eff6ff",
    color: "#2563eb",
  },
  super_admin: {
    label: "Super Admin",
    Icon: LayoutDashboard,
    bg: "#f3e8ff",
    color: "#9333ea",
  },
  superadminuser: {
    label: "Super Admin",
    Icon: LayoutDashboard,
    bg: "#f3e8ff",
    color: "#9333ea",
  },
};

function filterMenuItems(items, permissions) {
  return items.reduce((acc, item) => {
    if (item.perm && !permissions.includes(item.perm)) return acc;

    if (item.children) {
      const children = filterMenuItems(item.children, permissions);
      if (children.length === 0 && !item.route) return acc;
      acc.push({ ...item, children });
      return acc;
    }

    acc.push(item);
    return acc;
  }, []);
}

function buildMenu(role, permissions) {
  const resolvedRole = ROLE_MENU_ALIASES[role] || role;
  const items = ROLE_MENUS[resolvedRole] || ROLE_MENUS.admin;
  return filterMenuItems(items, permissions);
}

function itemIsActive(item, pathname) {
  if (item.matchPrefix && pathname.startsWith(item.matchPrefix)) return true;
  if (item.route && pathname === item.route) return true;
  return (item.children || []).some((child) => itemIsActive(child, pathname));
}

function getFirstNavigableRoute(item) {
  if (item.route) return item.route;
  for (const child of item.children || []) {
    const route = getFirstNavigableRoute(child);
    if (route) return route;
  }
  return null;
}

export default function Sidebar({ mobileOpen = false, onClose }) {
  const { t, dir } = useLanguage();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const currentUser = useSelector((s) => s.auth.user);
  const userPerms = currentUser?.permissions || [];
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  const isRtl = dir === "rtl";
  const roleConf = ROLE_HEADER_CONFIG[currentUser?.role] || {
    label: "Menu",
    Icon: LayoutDashboard,
    bg: "#eff6ff",
    color: "#2563eb",
  };
  const RoleIcon = roleConf.Icon;
  const menu = useMemo(
    () => buildMenu(currentUser?.role, userPerms),
    [currentUser?.role, userPerms],
  );

  const toggleExpand = (name) =>
    setExpandedItems((prev) => ({ ...prev, [name]: !prev[name] }));

  const renderMenuItems = (
    items,
    { depth = 0, indexed = false, parentKey = "root" } = {},
  ) =>
    items.map((item, index) => {
      const key = item.route || item.matchPrefix || `${parentKey}-${item.name}`;
      const isActive = itemIsActive(item, pathname);

      if (item.children) {
        const isOpen = expandedItems[key] ?? isActive;
        const firstRoute = getFirstNavigableRoute(item);

        return (
          <div key={key}>
            <button
              onClick={() => {
                if (collapsed) {
                  if (firstRoute) navigate(firstRoute);
                  closeMobile();
                } else {
                  toggleExpand(key);
                }
              }}
              title={
                collapsed ? t(SIDEBAR_NAME_MAP[item.name] || item.name) : ""
              }
              className={`sidebar-item w-full ${collapsed ? "justify-center" : "gap-3"} ${
                isActive ? "active" : ""
              }`}
              style={
                isActive
                  ? {
                      backgroundColor: "var(--sidebar-item-active-bg)",
                      color: "var(--sidebar-item-active-color)",
                    }
                  : undefined
              }
            >
              <span className="shrink-0 flex items-center justify-center">
                {depth > 0 ? (
                  <span
                    className="block w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: isActive
                        ? "var(--sidebar-item-active-color)"
                        : "var(--text-muted)",
                    }}
                  />
                ) : item.Icon ? (
                  <item.Icon size={17} style={{ opacity: 0.85 }} />
                ) : (
                  (ICON_MAP[item.name] ?? (
                    <Circle size={17} style={{ opacity: 0.85 }} />
                  ))
                )}
              </span>
              {!collapsed && (
                <>
                  <span className="truncate flex-1 text-start">
                    {t(SIDEBAR_NAME_MAP[item.name] || item.name)}
                  </span>
                  <ChevronDown
                    size={14}
                    className="shrink-0 transition-transform duration-200"
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </>
              )}
            </button>

            {!collapsed && isOpen && (
              <div
                className="mt-0.5 space-y-0.5"
                style={{ marginInlineStart: depth === 0 ? 16 : 12 }}
              >
                {renderMenuItems(item.children, {
                  depth: depth + 1,
                  indexed: [
                    "Hotel Main Details",
                    "Restaurant Main Details",
                    "Activity Main Details",
                  ].includes(item.name),
                  parentKey: key,
                })}
              </div>
            )}
          </div>
        );
      }

      if (depth > 0) {
        const ItemIcon = item.Icon || Circle;

        return (
          <NavLink
            key={key}
            to={item.route}
            onClick={closeMobile}
            className={`sidebar-item gap-2.5 ${isActive ? "active" : ""}`}
            style={
              isActive
                ? {
                    backgroundColor: "var(--sidebar-item-active-bg)",
                    color: "var(--sidebar-item-active-color)",
                  }
                : undefined
            }
          >
            {indexed ? (
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                style={{
                  backgroundColor: isActive
                    ? "var(--sidebar-item-active-color)"
                    : "var(--bg-raised)",
                  color: isActive
                    ? "var(--sidebar-item-active-bg)"
                    : "var(--text-muted)",
                  border: `1px solid ${isActive ? "var(--sidebar-item-active-color)" : "var(--border)"}`,
                }}
              >
                {index + 1}
              </span>
            ) : (
              <span
                className="block w-1.5 h-1.5 rounded-full shrink-0 mt-1"
                style={{
                  backgroundColor: isActive
                    ? "var(--sidebar-item-active-color)"
                    : "var(--text-muted)",
                }}
              />
            )}
            <span className={`truncate ${indexed ? "text-xs" : "text-sm"}`}>
              {t(SIDEBAR_NAME_MAP[item.name] || item.name)}
            </span>
          </NavLink>
        );
      }

      return (
        <NavLink
          key={item.route}
          to={item.route}
          onClick={closeMobile}
          title={collapsed ? t(SIDEBAR_NAME_MAP[item.name] || item.name) : ""}
          className={({ isActive: navActive }) =>
            `sidebar-item ${collapsed ? "justify-center" : "gap-3"} ${
              navActive ? "active" : ""
            }`
          }
        >
          <span className="shrink-0" style={{ opacity: 0.85 }}>
            {ICON_MAP[item.name] || <Circle size={17} />}
          </span>
          {!collapsed && (
            <span className="truncate">
              {t(SIDEBAR_NAME_MAP[item.name] || item.name)}
            </span>
          )}
        </NavLink>
      );
    });

  const handleLogout = () => {
    dispatch(api.util.resetApiState());
    dispatch(logout());
    navigate("/login");
  };

  const closeMobile = () => {
    if (typeof onClose === "function") onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-30 backdrop-blur-sm transition-opacity lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={closeMobile}
      />

      <aside
        className={`fixed ${isRtl ? "right-0" : "left-0"} top-[56px] z-40 flex h-[calc(100vh-56px)] flex-col transition-all duration-300 lg:static lg:top-0 lg:z-10 lg:h-full ${
          collapsed ? "lg:w-[68px]" : "lg:w-64"
        } ${
          mobileOpen
            ? "translate-x-0"
            : isRtl
              ? "translate-x-full lg:translate-x-0"
              : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          backgroundColor: "var(--sidebar-bg)",
          borderRight: isRtl ? "none" : "1px solid var(--sidebar-border)",
          borderLeft: isRtl ? "1px solid var(--sidebar-border)" : "none",
        }}
      >
        {/* Role header */}
        <div
          className={`flex items-center gap-3 px-4 py-3 ${collapsed ? "justify-center" : "justify-between"}`}
          style={{ borderBottom: "1px solid var(--sidebar-border)" }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-lg grid place-items-center shrink-0"
              style={{ backgroundColor: roleConf.bg }}
            >
              <RoleIcon size={16} style={{ color: roleConf.color }} />
            </div>
            {!collapsed && (
              <span
                className="font-semibold text-sm truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {roleConf.label}
              </span>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={closeMobile}
              className="lg:hidden h-7 w-7 grid place-items-center rounded-lg shrink-0 transition"
              style={{
                color: "var(--text-secondary)",
                backgroundColor: "var(--bg-raised)",
                border: "1px solid var(--border)",
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="hidden justify-end px-2 pt-2 lg:flex">
          <button
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? "Expand" : "Collapse"}
            className="h-7 w-7 items-center justify-center rounded-lg transition"
            style={{
              backgroundColor: "var(--bg-raised)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--sidebar-hover-bg)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--bg-raised)")
            }
          >
            {collapsed ? (
              isRtl ? (
                <ChevronLeft size={15} />
              ) : (
                <ChevronRight size={15} />
              )
            ) : isRtl ? (
              <ChevronRight size={15} />
            ) : (
              <ChevronLeft size={15} />
            )}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-2 pb-3 pt-2 space-y-0.5">
          {renderMenuItems(menu)}
        </nav>

        {/* Logout */}
        <div
          className="p-2"
          style={{ borderTop: "1px solid var(--sidebar-border)" }}
        >
          <button
            onClick={handleLogout}
            title={collapsed ? t("logout") : ""}
            className={`flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium transition ${
              collapsed ? "justify-center" : "gap-3"
            }`}
            style={{ color: "var(--danger)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--bg-raised)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <LogOut size={17} />
            {!collapsed && <span>{t("logout")}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
