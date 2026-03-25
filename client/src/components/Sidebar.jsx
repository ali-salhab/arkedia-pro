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
  MoreVertical,
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
            {
              name: "API Settings",
              route: "/hotel/channel-manager/travky/api-settings",
              perm: null,
              Icon: Settings,
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
  hoteluser: [
    { name: "Dashboard", route: "/hotel", perm: null },
    { name: "Users", route: "/users", perm: "users:view" },
    { name: "Rooms", route: "/rooms", perm: "rooms:view" },
    { name: "Bookings", route: "/bookings", perm: "bookings:view" },
    { name: "Finance", route: "/finance", perm: "finance:view" },
    { name: "Reports", route: "/reports", perm: "reports:view" },
    { name: "Settings", route: "/settings", perm: "settings:view" },
    {
      name: "Hotel Main Details",
      perm: "hotel_details:view",
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
            {
              name: "API Settings",
              route: "/hotel/channel-manager/travky/api-settings",
              perm: null,
              Icon: Settings,
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
  "API Settings": "apiSettings",
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
  "Hotel Main Details": <ClipboardList size={18} strokeWidth={2} />,
  "Restaurant Main Details": <UtensilsCrossed size={18} strokeWidth={2} />,
  "Activity Main Details": <Zap size={18} strokeWidth={2} />,
  "Channel Manager": <Link2 size={18} strokeWidth={2} />,
  Dashboard: <LayoutDashboard size={18} strokeWidth={2} />,
  Users: <Users size={18} strokeWidth={2} />,
  Admins: <UserCheck size={18} strokeWidth={2} />,
  "My Team": <Users size={18} strokeWidth={2} />,
  "All Hotels": <Building2 size={18} strokeWidth={2} />,
  "My Hotels": <Building2 size={18} strokeWidth={2} />,
  "All Restaurants": <UtensilsCrossed size={18} strokeWidth={2} />,
  "My Restaurants": <UtensilsCrossed size={18} strokeWidth={2} />,
  "All Activities": <Zap size={18} strokeWidth={2} />,
  "My Activities": <Zap size={18} strokeWidth={2} />,
  "All Bookings": <CalendarDays size={18} strokeWidth={2} />,
  "Rooms/Tables": <BedDouble size={18} strokeWidth={2} />,
  Rooms: <BedDouble size={18} strokeWidth={2} />,
  Tables: <BedDouble size={18} strokeWidth={2} />,
  Reservations: <CalendarDays size={18} strokeWidth={2} />,
  Activities: <Zap size={18} strokeWidth={2} />,
  Bookings: <CalendarDays size={18} strokeWidth={2} />,
  Finance: <DollarSign size={18} strokeWidth={2} />,
  Reports: <BarChart2 size={18} strokeWidth={2} />,
  Settings: <Settings size={18} strokeWidth={2} />,
  "API Settings": <Settings size={18} strokeWidth={2} />,
};

const ROLE_HEADER_CONFIG = {
  hotel: {
    label: "Hotel",
    Icon: Building2,
    bg: "linear-gradient(135deg, #10b981, #059669)",
    color: "#ffffff",
  },
  hoteluser: {
    label: "Hotel",
    Icon: Building2,
    bg: "linear-gradient(135deg, #10b981, #059669)",
    color: "#ffffff",
  },
  restaurant: {
    label: "Restaurant",
    Icon: UtensilsCrossed,
    bg: "linear-gradient(135deg, #f97316, #ea580c)",
    color: "#ffffff",
  },
  restaurantuser: {
    label: "Restaurant",
    Icon: UtensilsCrossed,
    bg: "linear-gradient(135deg, #f97316, #ea580c)",
    color: "#ffffff",
  },
  activity: {
    label: "Activity",
    Icon: Zap,
    bg: "linear-gradient(135deg, #eab308, #ca8a04)",
    color: "#ffffff",
  },
  activityuser: {
    label: "Activity",
    Icon: Zap,
    bg: "linear-gradient(135deg, #eab308, #ca8a04)",
    color: "#ffffff",
  },
  admin: {
    label: "Admin",
    Icon: UserCheck,
    bg: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "#ffffff",
  },
  adminuser: {
    label: "Admin",
    Icon: UserCheck,
    bg: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "#ffffff",
  },
  super_admin: {
    label: "Super Admin",
    Icon: LayoutDashboard,
    bg: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    color: "#ffffff",
  },
  superadminuser: {
    label: "Super Admin",
    Icon: LayoutDashboard,
    bg: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    color: "#ffffff",
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
  const roleConf =
    ROLE_HEADER_CONFIG[currentUser?.role] || ROLE_HEADER_CONFIG.admin;
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
          <div key={key} className="mb-1">
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
              className={`flex items-center w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "bg-blue-50/80 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <span
                className={`shrink-0 flex items-center justify-center ${collapsed ? "mx-auto" : "mr-3 rtl:mr-0 rtl:ml-3"}`}
              >
                {depth > 0 ? (
                  <span
                    className={`block w-2 h-2 rounded-full ${isActive ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-600"}`}
                  />
                ) : item.Icon ? (
                  <item.Icon size={18} strokeWidth={2} />
                ) : (
                  (ICON_MAP[item.name] ?? <Circle size={18} strokeWidth={2} />)
                )}
              </span>
              {!collapsed && (
                <>
                  <span className="truncate flex-1 text-start">
                    {t(SIDEBAR_NAME_MAP[item.name] || item.name)}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-slate-600"}`}
                  />
                </>
              )}
            </button>
            {!collapsed && isOpen && (
              <div
                className="mt-1 space-y-1 relative"
                style={{ marginInlineStart: depth === 0 ? "1.5rem" : "1rem" }}
              >
                <div
                  className={`absolute top-0 bottom-0 ${isRtl ? "right-0" : "left-0"} w-px bg-slate-200 dark:bg-slate-700`}
                />
                <div className={isRtl ? "pr-3" : "pl-3"}>
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
              </div>
            )}
          </div>
        );
      }

      if (depth > 0) {
        return (
          <NavLink
            key={key}
            to={item.route}
            onClick={closeMobile}
            className={({ isActive: navActive }) =>
              `flex items-center px-3 py-2 rounded-lg text-sm transition-all group mb-0.5 ${
                navActive
                  ? "bg-blue-50/80 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
              }`
            }
          >
            {({ isActive: navActive }) => (
              <>
                {indexed ? (
                  <span
                    className={`shrink-0 ${isRtl ? "ml-2.5" : "mr-2.5"} flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${navActive ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700"}`}
                  >
                    {index + 1}
                  </span>
                ) : (
                  <span
                    className={`shrink-0 ${isRtl ? "ml-2.5" : "mr-2.5"} flex items-center justify-center w-4 h-4`}
                  >
                    <span
                      className={`block w-1.5 h-1.5 rounded-full ${navActive ? "bg-blue-500" : "bg-slate-400 dark:bg-slate-500"}`}
                    />
                  </span>
                )}
                <span className="truncate">
                  {t(SIDEBAR_NAME_MAP[item.name] || item.name)}
                </span>
              </>
            )}
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
            `flex items-center w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${
              navActive
                ? "bg-blue-50/80 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
            }`
          }
        >
          {({ isActive: navActive }) => (
            <>
              <span
                className={`shrink-0 flex items-center justify-center ${collapsed ? "mx-auto" : "mr-3 rtl:mr-0 rtl:ml-3"}`}
              >
                {ICON_MAP[item.name] || <Circle size={18} />}
              </span>
              {!collapsed && (
                <span className="truncate">
                  {t(SIDEBAR_NAME_MAP[item.name] || item.name)}
                </span>
              )}
            </>
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
      <div
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMobile}
      />

      <aside
        className={`fixed ${isRtl ? "right-0" : "left-0"} top-0 h-screen z-50 flex flex-col transition-all duration-300 lg:relative lg:top-0 lg:z-10 lg:h-full bg-white dark:bg-[#0b0f14] border-x border-slate-200 dark:border-slate-800 shadow-xl lg:shadow-none ${
          collapsed ? "lg:w-[76px]" : "lg:w-[280px]"
        } ${
          mobileOpen
            ? "translate-x-0 w-[280px]"
            : isRtl
              ? "translate-x-full lg:translate-x-0"
              : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Mobile close button */}
        <div className="flex lg:hidden justify-end px-3 pt-3">
          <button
            onClick={closeMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Absolute Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`hidden lg:flex absolute top-6 h-6 w-6 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 items-center justify-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500 transition-all z-50 shadow-sm ${
            isRtl ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"
          }`}
        >
          {collapsed ? (
            isRtl ? (
              <ChevronLeft size={14} strokeWidth={3} />
            ) : (
              <ChevronRight size={14} strokeWidth={3} />
            )
          ) : isRtl ? (
            <ChevronRight size={14} strokeWidth={3} />
          ) : (
            <ChevronLeft size={14} strokeWidth={3} />
          )}
        </button>

        <div className="flex-1 overflow-y-auto px-3 pb-4 no-scrollbar">
          <nav className="space-y-0.5">{renderMenuItems(menu)}</nav>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <button
            onClick={handleLogout}
            title={collapsed ? t("logout") : ""}
            className={`flex items-center w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut
              size={18}
              strokeWidth={2.5}
              className="group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform"
            />
            {!collapsed && (
              <span className={isRtl ? "mr-3" : "ml-3"}>{t("logout")}</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
