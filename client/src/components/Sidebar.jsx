import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
  Circle,
} from "lucide-react";

const ROLE_MENUS = {
  super_admin: [
    { name: "Dashboard", route: "/super-admin", perm: null },
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
  ],
  restaurant: [
    { name: "Dashboard", route: "/restaurant", perm: null },
    { name: "Users", route: "/users", perm: "users:view" },
    { name: "Tables", route: "/rooms", perm: "rooms:view" },
    { name: "Reservations", route: "/bookings", perm: "bookings:view" },
    { name: "Finance", route: "/finance", perm: "finance:view" },
    { name: "Reports", route: "/reports", perm: "reports:view" },
    { name: "Settings", route: "/settings", perm: "settings:view" },
  ],
  activity: [
    { name: "Dashboard", route: "/activity", perm: null },
    { name: "Users", route: "/users", perm: "users:view" },
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
          {menu.map((item) => (
            <NavLink
              key={item.route}
              to={item.route}
              onClick={closeMobile}
              title={
                collapsed ? t(SIDEBAR_NAME_MAP[item.name] || item.name) : ""
              }
              className={({ isActive }) =>
                `sidebar-item ${collapsed ? "justify-center" : "gap-3"} ${
                  isActive ? "active" : ""
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? {
                      borderLeft: isRtl
                        ? "none"
                        : "2px solid var(--sidebar-active-border)",
                      borderRight: isRtl
                        ? "2px solid var(--sidebar-active-border)"
                        : "none",
                      paddingLeft: isRtl
                        ? undefined
                        : collapsed
                          ? undefined
                          : "calc(0.75rem - 2px)",
                      paddingRight: isRtl
                        ? collapsed
                          ? undefined
                          : "calc(0.75rem - 2px)"
                        : undefined,
                    }
                  : undefined
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
          ))}
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
