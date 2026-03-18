import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../store/services/api";
import { logout } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Menu, MoreVertical, LogOut } from "lucide-react";
import NotificationPanel from "./NotificationPanel";

const ROLE_LABELS = {
  super_admin: "Super Admin",
  superadminuser: "SA Staff",
  admin: "Admin",
  adminuser: "Admin Staff",
  hotel: "Hotel",
  hoteluser: "Hotel Staff",
  restaurant: "Restaurant",
  restaurantuser: "Restaurant Staff",
  activity: "Activity",
  activityuser: "Activity Staff",
};

const ROLE_BADGE = {
  super_admin: { bg: "#e0f2fe", color: "#0369a1" },
  superadminuser: { bg: "#e0f2fe", color: "#0369a1" },
  admin: { bg: "#dbeafe", color: "#1d4ed8" },
  adminuser: { bg: "#dbeafe", color: "#1d4ed8" },
  hotel: { bg: "#dcfce7", color: "#166534" },
  hoteluser: { bg: "#dcfce7", color: "#166534" },
  restaurant: { bg: "#fef3c7", color: "#92400e" },
  restaurantuser: { bg: "#fef3c7", color: "#92400e" },
  activity: { bg: "#ccfbf1", color: "#0f766e" },
  activityuser: { bg: "#ccfbf1", color: "#0f766e" },
};

export default function Navbar({
  onToggleSidebar,
  notifications = [],
  onClearNotifications,
}) {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, theme, dir } = useLanguage();
  const isDark = theme === "dark";
  const isRtl = dir === "rtl";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    setMenuOpen(false);
    dispatch(api.util.resetApiState());
    dispatch(logout());
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const roleLabel = ROLE_LABELS[user?.role] || user?.role || "";
  const badge = ROLE_BADGE[user?.role] || { bg: "#f1f5f9", color: "#475569" };
  const avatar = user?.name?.[0]?.toUpperCase() || "U";

  return (
    <header className="navbar">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white/80 text-slate-700 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src="/logo.png?v=2"
            alt="Travky.com"
            className="h-10 w-auto object-contain sm:h-11"
            onError={(e) => {
              e.target.src = "/logo.svg?v=2";
            }}
          />
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="bg-gradient-to-r from-sky-700 via-blue-600 to-cyan-500 bg-clip-text text-sm font-extrabold tracking-tight text-transparent">
              Travky.com
            </span>
            {user?.role && (
              <span
                className="mt-1 w-fit rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{
                  background: ROLE_BADGE[user.role]?.bg || "#f1f5f9",
                  color: ROLE_BADGE[user.role]?.color || "#475569",
                }}
              >
                {ROLE_LABELS[user.role] || user.role} Dashboard
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationPanel
          notifications={notifications}
          onClear={onClearNotifications}
        />
        <div className="hidden items-center gap-2 sm:flex">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-sky-700 to-cyan-500 text-sm font-bold text-white shadow-sm shadow-sky-900/20">
            {avatar}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {user?.name || "User"}
            </span>
            <span
              className="mt-1 w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ background: badge.bg, color: badge.color }}
            >
              {roleLabel}
            </span>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            title="More options"
            className={`grid h-9 w-9 place-items-center rounded-full transition ${
              menuOpen
                ? isDark
                  ? "bg-slate-800"
                  : "bg-slate-100"
                : "bg-transparent"
            } ${isDark ? "text-slate-300" : "text-slate-600"}`}
          >
            <MoreVertical size={18} />
          </button>

          {menuOpen && (
            <div
              className={`absolute top-11 z-[200] w-48 overflow-hidden rounded-xl border shadow-xl backdrop-blur-xl ${
                isDark
                  ? "border-slate-700 bg-slate-900/95"
                  : "border-slate-200 bg-white/95"
              } ${isRtl ? "left-0" : "right-0"}`}
            >
              <div
                className={`px-3 py-2.5 ${
                  isDark
                    ? "border-b border-slate-700"
                    : "border-b border-slate-100"
                }`}
              >
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {user?.name || "User"}
                </div>
                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-300">
                  {user?.email || ""}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className={`flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium text-rose-500 transition ${
                  isDark ? "hover:bg-rose-500/10" : "hover:bg-rose-50"
                }`}
              >
                <LogOut size={15} />
                {t("logout")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
