import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../store/services/api";
import { logout } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Menu, Moon, Sun, Globe, LogOut, Search } from "lucide-react";
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
  const { t, theme, toggleTheme, toggleLang } = useLanguage();
  const isDark = theme === "dark";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const initials =
    user?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const iconBtn = `grid h-9 w-9 place-items-center rounded-xl border transition-all ${
    isDark
      ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
      : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
  }`;

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

  return (
    <header className="navbar">
      {/* Left: hamburger + brand */}
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`${iconBtn} lg:hidden`}
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-900 shadow-md shadow-slate-900/25">
            <img
              src="/logo.png"
              alt="logo"
              className="h-5 w-5 object-contain brightness-0 invert"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
          <div className="hidden leading-tight sm:block">
            <p
              className={`text-sm font-bold ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Travky.com
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Center: search */}
      <div className="mx-4 hidden max-w-xs flex-1 lg:flex">
        <div
          className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 ${
            isDark
              ? "border-slate-700 bg-slate-800"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          <Search size={14} className="shrink-0 text-slate-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className={`h-5 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 ${
              isDark ? "text-slate-100" : "text-slate-700"
            }`}
          />
          <span
            className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium ${
              isDark
                ? "border-slate-600 text-slate-500"
                : "border-slate-200 text-slate-400"
            }`}
          >
            ⌘K
          </span>
        </div>
      </div>

      {/* Right: actions + avatar */}
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={toggleTheme}
          className={iconBtn}
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          onClick={toggleLang}
          className={iconBtn}
          title="Toggle language"
          aria-label="Toggle language"
        >
          <Globe size={16} />
        </button>
        <NotificationPanel
          notifications={notifications}
          onClear={onClearNotifications}
        />

        {/* Avatar with dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="overflow-hidden rounded-xl transition hover:opacity-90"
            aria-label="User menu"
          >
            {user?.logo ? (
              <img
                src={user.logo}
                alt={user.name}
                className="h-9 w-9 rounded-xl object-cover"
              />
            ) : (
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-xs font-bold text-white shadow-sm">
                {initials}
              </div>
            )}
          </button>

          {menuOpen && (
            <div
              className={`absolute right-0 top-11 z-[200] w-52 overflow-hidden rounded-xl border shadow-xl backdrop-blur-xl ${
                isDark
                  ? "border-slate-700 bg-slate-900/95"
                  : "border-slate-200 bg-white/95"
              }`}
            >
              <div
                className={`px-3 py-3 ${
                  isDark
                    ? "border-b border-slate-700"
                    : "border-b border-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {user?.logo ? (
                    <img
                      src={user.logo}
                      alt={user.name}
                      className="h-8 w-8 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 text-xs font-bold text-white">
                      {initials}
                    </div>
                  )}
                  <div>
                    <div
                      className={`text-sm font-semibold ${
                        isDark ? "text-slate-100" : "text-slate-800"
                      }`}
                    >
                      {user?.name || "User"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {ROLE_LABELS[user?.role] || user?.role}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/settings");
                }}
                className={`flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium transition ${
                  isDark
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {t("settings")}
              </button>
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
