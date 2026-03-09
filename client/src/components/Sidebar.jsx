import { useState } from "react";
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

// ── Full menu definition per role ─────────────────────────────────────────────
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
    { name: "Settings", route: "/settings", perm: null },
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
    { name: "Settings", route: "/settings", perm: null },
  ],
  hotel: [
    { name: "Dashboard", route: "/hotel", perm: null },
    { name: "المستخدمون", route: "/users", perm: "users:view" },
    { name: "Rooms", route: "/rooms", perm: "rooms:view" },
    { name: "Bookings", route: "/bookings", perm: "bookings:view" },
    { name: "Finance", route: "/finance", perm: "finance:view" },
    { name: "Reports", route: "/reports", perm: "reports:view" },
    { name: "Settings", route: "/settings", perm: null },
  ],
  restaurant: [
    { name: "Dashboard", route: "/restaurant", perm: null },
    { name: "المستخدمون", route: "/users", perm: "users:view" },
    { name: "Tables", route: "/rooms", perm: "rooms:view" },
    { name: "Reservations", route: "/bookings", perm: "bookings:view" },
    { name: "Finance", route: "/finance", perm: "finance:view" },
    { name: "Reports", route: "/reports", perm: "reports:view" },
    { name: "Settings", route: "/settings", perm: null },
  ],
  activity: [
    { name: "Dashboard", route: "/activity", perm: null },
    { name: "المستخدمون", route: "/users", perm: "users:view" },
    { name: "Activities", route: "/activities", perm: "activities:view" },
    { name: "Bookings", route: "/bookings", perm: "bookings:view" },
    { name: "Finance", route: "/finance", perm: "finance:view" },
    { name: "Reports", route: "/reports", perm: "reports:view" },
    { name: "Settings", route: "/settings", perm: null },
  ],
};

// Sub-user roles share the same menu as their parent role.
// Permissions filtering in buildMenu() limits what they actually see.
const ROLE_MENU_ALIASES = {
  superadminuser: "super_admin",
  adminuser: "admin",
  hoteluser: "hotel",
  restaurantuser: "restaurant",
  activityuser: "activity",
};

/** Returns the filtered menu for the current user — no network call needed. */
function buildMenu(role, permissions) {
  const resolvedRole = ROLE_MENU_ALIASES[role] || role;
  const items = ROLE_MENUS[resolvedRole] || ROLE_MENUS.admin;
  return items.filter((item) => !item.perm || permissions.includes(item.perm));
}

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
  super_admin: { label: "Super Admin", color: "#a78bfa", bg: "#8b5cf620" },
  superadminuser: { label: "SA Staff", color: "#a78bfa", bg: "#8b5cf620" },
  admin: { label: "Admin", color: "#60a5fa", bg: "#3b82f620" },
  adminuser: { label: "Admin Staff", color: "#60a5fa", bg: "#3b82f620" },
  hotel: { label: "Hotel", color: "#4ade80", bg: "#22c55e20" },
  hoteluser: { label: "Hotel Staff", color: "#4ade80", bg: "#22c55e20" },
  restaurant: { label: "Restaurant", color: "#fbbf24", bg: "#f59e0b20" },
  restaurantuser: { label: "Rest. Staff", color: "#fbbf24", bg: "#f59e0b20" },
  activity: { label: "Activity", color: "#f472b6", bg: "#ec489920" },
  activityuser: { label: "Act. Staff", color: "#f472b6", bg: "#ec489920" },
};

const LogoutIcon = () => <LogOut size={18} />;
const ChevronLeftIcon = () => <ChevronLeft size={16} strokeWidth={2.5} />;
const ChevronRightIcon = () => <ChevronRight size={16} strokeWidth={2.5} />;

export default function Sidebar() {
  const { t, theme, dir } = useLanguage();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((s) => s.auth.user);
  const userPerms = currentUser?.permissions || [];
  const [collapsed, setCollapsed] = useState(false);
  const isDark = theme === "dark";
  const isRtl = dir === "rtl";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Build menu entirely from Redux state — no API call, no stale cache
  const menu = buildMenu(currentUser?.role, userPerms);
  const roleBadge = ROLE_BADGE[currentUser?.role];

  return (
    <div
      style={{
        width: collapsed ? 64 : 240,
        height: "calc(100vh - 60px)",
        background: isDark ? "#0f172a" : "#fff",
        borderRight: isRtl
          ? "none"
          : `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`,
        borderLeft: isRtl
          ? `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`
          : "none",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
        flexShrink: 0,
        boxShadow: isDark ? "none" : "2px 0 12px rgba(0,0,0,0.06)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      {/* ── Logo Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          padding: collapsed ? "14px 0" : "14px 16px",
          background: "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            overflow: "hidden",
          }}
        >
          <img
            src="/logo.png"
            alt="logo"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              objectFit: "cover",
              flexShrink: 0,
              border: "2px solid rgba(255,255,255,0.3)",
            }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          {!collapsed && (
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontWeight: 700,
                  color: "#fff",
                  fontSize: 14,
                  whiteSpace: "nowrap",
                }}
              >
                Travky.com
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "#bfdbfe",
                  whiteSpace: "nowrap",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Booking Platform
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "none",
            borderRadius: 8,
            width: 28,
            height: 28,
            cursor: "pointer",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.28)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
          }
        >
          {collapsed ? (
            isRtl ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )
          ) : isRtl ? (
            <ChevronRightIcon />
          ) : (
            <ChevronLeftIcon />
          )}
        </button>
      </div>

      {/* ── Navigation Menu ── */}
      {/* User profile card */}
      {!collapsed && currentUser && (
        <div
          style={{
            padding: "12px 16px",
            borderBottom: `1px solid ${isDark ? "#1e293b" : "#f1f5f9"}`,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: roleBadge?.bg || "#3b82f620",
                border: `2px solid ${roleBadge?.color || "#3b82f6"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
                color: roleBadge?.color || "#3b82f6",
                flexShrink: 0,
              }}
            >
              {currentUser.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div style={{ overflow: "hidden", flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  color: isDark ? "#f1f5f9" : "#1e293b",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {currentUser.name}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 2,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "1px 7px",
                    borderRadius: 10,
                    background: roleBadge?.bg || "#3b82f620",
                    color: roleBadge?.color || "#3b82f6",
                    textTransform: "capitalize",
                    letterSpacing: 0.3,
                  }}
                >
                  {roleBadge?.label || currentUser.role}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: isDark ? "#64748b" : "#9ca3af",
                  }}
                >
                  {userPerms.length} perms
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "8px 0",
        }}
      >
        {menu.map((item) => (
          <NavLink
            key={item.route}
            to={item.route}
            title={collapsed ? t(SIDEBAR_NAME_MAP[item.name] || item.name) : ""}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: collapsed ? "11px 0" : "10px 16px",
              justifyContent: collapsed ? "center" : "flex-start",
              color: isActive ? "#3b82f6" : isDark ? "#94a3b8" : "#64748b",
              background: isActive
                ? isDark
                  ? "rgba(59,130,246,0.12)"
                  : "#eff6ff"
                : "transparent",
              borderRight: !isRtl
                ? isActive
                  ? "3px solid #3b82f6"
                  : "3px solid transparent"
                : "none",
              borderLeft: isRtl
                ? isActive
                  ? "3px solid #3b82f6"
                  : "3px solid transparent"
                : "none",
              textDecoration: "none",
              fontSize: 13.5,
              fontWeight: isActive ? 600 : 400,
              transition: "background 0.15s, color 0.15s",
              userSelect: "none",
            })}
          >
            <span
              style={{ flexShrink: 0, display: "flex", alignItems: "center" }}
            >
              {ICON_MAP[item.name] || <Circle size={18} />}
            </span>
            {!collapsed && (
              <span
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {t(SIDEBAR_NAME_MAP[item.name] || item.name)}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Logout ── */}
      <div
        style={{
          padding: collapsed ? "10px 0" : "10px 8px",
          borderTop: `1px solid ${isDark ? "#1e293b" : "#f1f5f9"}`,
          flexShrink: 0,
        }}
      >
        <button
          onClick={handleLogout}
          title={collapsed ? t("logout") : ""}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            justifyContent: collapsed ? "center" : "flex-start",
            width: "100%",
            padding: collapsed ? "10px 0" : "10px 12px",
            background: "transparent",
            border: "none",
            borderRadius: 8,
            color: "#ef4444",
            cursor: "pointer",
            fontSize: 13.5,
            fontWeight: 500,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = isDark
              ? "rgba(239,68,68,0.1)"
              : "#fef2f2")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <span
            style={{ flexShrink: 0, display: "flex", alignItems: "center" }}
          >
            <LogoutIcon />
          </span>
          {!collapsed && <span>{t("logout")}</span>}
        </button>
      </div>
    </div>
  );
}
