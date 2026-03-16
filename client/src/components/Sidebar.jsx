import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLanguage } from "../context/LanguageContext";
import { logout } from "../store/slices/authSlice";
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
  Circle,
} from "lucide-react";

const ROLE_MENUS = {
  super_admin: [
    { name: "Dashboard", route: "/super-admin", perm: null },
    { name: "Users", route: "/users", perm: "users:view" },
    { name: "Admins", route: "/admins", perm: "users:view" },
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
    { name: "المستخدمون", route: "/users", perm: "users:view" },
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
    { name: "المستخدمون", route: "/users", perm: "users:view" },
    { name: "Rooms", route: "/rooms", perm: "rooms:view" },
    { name: "Bookings", route: "/bookings", perm: "bookings:view" },
    { name: "Finance", route: "/finance", perm: "finance:view" },
    { name: "Reports", route: "/reports", perm: "reports:view" },
    { name: "Settings", route: "/settings", perm: "settings:view" },
  ],
  restaurant: [
    { name: "Dashboard", route: "/restaurant", perm: null },
    { name: "المستخدمون", route: "/users", perm: "users:view" },
    { name: "Tables", route: "/rooms", perm: "rooms:view" },
    { name: "Reservations", route: "/bookings", perm: "bookings:view" },
    { name: "Finance", route: "/finance", perm: "finance:view" },
    { name: "Reports", route: "/reports", perm: "reports:view" },
    { name: "Settings", route: "/settings", perm: "settings:view" },
  ],
  activity: [
    { name: "Dashboard", route: "/activity", perm: null },
    { name: "المستخدمون", route: "/users", perm: "users:view" },
    { name: "Activities", route: "/activities", perm: "activities:view" },
    { name: "Bookings", route: "/bookings", perm: "bookings:view" },
    { name: "Finance", route: "/finance", perm: "finance:view" },
    { name: "Reports", route: "/reports", perm: "reports:view" },
    { name: "Settings", route: "/settings", perm: "settings:view" },
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
  Dashboard: <LayoutDashboard size={18} />,
  Users: <Users size={18} />,
  Admins: <UserCheck size={18} />,
  "My Team": <Users size={18} />,
  المستخدمون: <Users size={18} />,
  "All Hotels": <Building2 size={18} />,
  "My Hotels": <Building2 size={18} />,
  "All Restaurants": <UtensilsCrossed size={18} />,
  "My Restaurants": <UtensilsCrossed size={18} />,
  "All Activities": <Zap size={18} />,
  "My Activities": <Zap size={18} />,
  "All Bookings": <CalendarDays size={18} />,
  "Rooms/Tables": <BedDouble size={18} />,
  Rooms: <BedDouble size={18} />,
  Tables: <BedDouble size={18} />,
  Reservations: <CalendarDays size={18} />,
  Activities: <Zap size={18} />,
  Bookings: <CalendarDays size={18} />,
  Finance: <DollarSign size={18} />,
  Reports: <BarChart2 size={18} />,
  Settings: <Settings size={18} />,
};

const ROLE_BADGE = {
  super_admin: { label: "Super Admin", color: "#0369a1", bg: "#e0f2fe" },
  superadminuser: { label: "SA Staff", color: "#0369a1", bg: "#e0f2fe" },
  admin: { label: "Admin", color: "#2563eb", bg: "#dbeafe" },
  adminuser: { label: "Admin Staff", color: "#2563eb", bg: "#dbeafe" },
  hotel: { label: "Hotel", color: "#166534", bg: "#dcfce7" },
  hoteluser: { label: "Hotel Staff", color: "#166534", bg: "#dcfce7" },
  restaurant: { label: "Restaurant", color: "#92400e", bg: "#fef3c7" },
  restaurantuser: { label: "Rest. Staff", color: "#92400e", bg: "#fef3c7" },
  activity: { label: "Activity", color: "#0f766e", bg: "#ccfbf1" },
  activityuser: { label: "Act. Staff", color: "#0f766e", bg: "#ccfbf1" },
};

function buildMenu(role, permissions) {
  const resolvedRole = ROLE_MENU_ALIASES[role] || role;
  const items = ROLE_MENUS[resolvedRole] || ROLE_MENUS.admin;
  return items.filter((item) => !item.perm || permissions.includes(item.perm));
}

export default function Sidebar({ mobileOpen = false, onClose }) {
  const { t, dir } = useLanguage();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((s) => s.auth.user);
  const userPerms = currentUser?.permissions || [];
  const [collapsed, setCollapsed] = useState(false);

  const isRtl = dir === "rtl";
  const menu = useMemo(
    () => buildMenu(currentUser?.role, userPerms),
    [currentUser?.role, userPerms],
  );
  const roleBadge = ROLE_BADGE[currentUser?.role];

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const closeMobile = () => {
    if (typeof onClose === "function") onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm transition-opacity lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMobile}
      />

      <aside
        className={`fixed ${isRtl ? "right-0" : "left-0"} top-[60px] z-40 flex h-[calc(100vh-60px)] flex-col border-r border-white/40 bg-white/85 shadow-2xl backdrop-blur-2xl transition-all duration-300 dark:border-slate-700 dark:bg-slate-900/90 lg:static lg:top-0 lg:z-10 lg:h-full ${
          collapsed ? "lg:w-20" : "lg:w-72"
        } ${
          mobileOpen
            ? "translate-x-0"
            : isRtl
              ? "translate-x-full lg:translate-x-0"
              : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between bg-gradient-to-r from-sky-700 via-blue-600 to-cyan-500 px-4 py-3 shadow-lg shadow-sky-900/15">
          <div className="flex min-w-0 items-center gap-2">
            <img
              src="/logo.png"
              alt="logo"
              className="h-9 w-9 rounded-full border border-white/40 object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">
                  Travky.com
                </p>
                <p className="truncate text-[10px] uppercase tracking-[0.15em] text-blue-100">
                  Booking Platform
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white transition hover:bg-white/30 lg:flex"
          >
            {collapsed ? (
              isRtl ? (
                <ChevronLeft size={16} />
              ) : (
                <ChevronRight size={16} />
              )
            ) : isRtl ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronLeft size={16} />
            )}
          </button>
        </div>

        {!collapsed && currentUser && (
          <div className="border-b border-slate-200/80 px-4 py-3 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div
                className="grid h-9 w-9 place-items-center rounded-full border-2 text-sm font-bold"
                style={{
                  background: roleBadge?.bg || "#3b82f620",
                  borderColor: roleBadge?.color || "#3b82f6",
                  color: roleBadge?.color || "#3b82f6",
                }}
              >
                {currentUser.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {currentUser.name}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className="rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide"
                    style={{
                      background: roleBadge?.bg || "#3b82f620",
                      color: roleBadge?.color || "#3b82f6",
                    }}
                  >
                    {roleBadge?.label || currentUser.role}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-300">
                    {userPerms.length} perms
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
          {menu.map((item) => (
            <NavLink
              key={item.route}
              to={item.route}
              onClick={closeMobile}
              title={
                collapsed ? t(SIDEBAR_NAME_MAP[item.name] || item.name) : ""
              }
              className={({ isActive }) =>
                `group flex items-center rounded-xl px-3 py-2 text-sm transition ${
                  collapsed ? "justify-center" : "justify-start gap-3"
                } ${
                  isActive
                    ? "bg-sky-50 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                }`
              }
            >
              <span className="shrink-0">
                {ICON_MAP[item.name] || <Circle size={18} />}
              </span>
              {!collapsed && (
                <span className="truncate">
                  {t(SIDEBAR_NAME_MAP[item.name] || item.name)}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200/80 p-2 dark:border-slate-700">
          <button
            onClick={handleLogout}
            title={collapsed ? t("logout") : ""}
            className={`flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-500/10 ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <LogOut size={18} />
            {!collapsed && <span>{t("logout")}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
