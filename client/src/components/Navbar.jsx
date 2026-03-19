import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../store/services/api";
import { logout } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Menu, Moon, Sun, Globe, LogOut, Search, Settings } from "lucide-react";
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

export default function Navbar({ onToggleSidebar, notifications = [], onClearNotifications }) {
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

  const handleLogout = () => {
    setMenuOpen(false);
    dispatch(api.util.resetApiState());
    dispatch(logout());
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
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
          className="icon-btn lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>
        <div className="flex items-center gap-2.5">
          <div
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
            style={{ backgroundColor: "var(--brand)" }}
          >
            <img
              src="/logo.png"
              alt="logo"
              className="h-5 w-5 object-contain brightness-0 invert"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              Travky.com
            </p>
            <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Center: search */}
      <div className="mx-4 hidden max-w-xs flex-1 lg:flex">
        <div
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2"
          style={{
            backgroundColor: "var(--bg-raised)",
            border: "1px solid var(--border)",
          }}
        >
          <Search size={14} className="shrink-0" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder={t("search") + "..."}
            className="h-5 flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--text-primary)" }}
          />
          <span
            className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium"
            style={{
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
            }}
          >
            ⌘K
          </span>
        </div>
      </div>

      {/* Right: actions + avatar */}
      <div className="flex shrink-0 items-center gap-2">
        <button onClick={toggleTheme} className="icon-btn" title="Toggle theme" aria-label="Toggle theme">
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button onClick={toggleLang} className="icon-btn" title="Toggle language" aria-label="Toggle language">
          <Globe size={16} />
        </button>

        <NotificationPanel notifications={notifications} onClear={onClearNotifications} />

        {/* Avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="overflow-hidden rounded-xl transition hover:opacity-80"
            aria-label="User menu"
          >
            {user?.logo ? (
              <img src={user.logo} alt={user.name} className="h-9 w-9 rounded-xl object-cover" />
            ) : (
              <div
                className="grid h-9 w-9 place-items-center rounded-xl text-xs font-bold text-white"
                style={{ backgroundColor: "var(--brand)" }}
              >
                {initials}
              </div>
            )}
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-11 z-[200] w-52 overflow-hidden rounded-xl shadow-xl"
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border)",
              }}
            >
              {/* User info */}
              <div
                className="px-4 py-3"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <div className="flex items-center gap-2.5">
                  {user?.logo ? (
                    <img src={user.logo} alt={user.name} className="h-8 w-8 rounded-lg object-cover" />
                  ) : (
                    <div
                      className="grid h-8 w-8 place-items-center rounded-lg text-xs font-bold text-white"
                      style={{ backgroundColor: "var(--brand)" }}
                    >
                      {initials}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {user?.name || "User"}
                    </div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {ROLE_LABELS[user?.role] || user?.role}
                    </div>
                  </div>
                </div>
              </div>

              {/* Settings */}
              <button
                onClick={() => { setMenuOpen(false); navigate("/settings"); }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition hover:opacity-90"
                style={{
                  color: "var(--text-secondary)",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-raised)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <Settings size={15} />
                {t("settings")}
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition"
                style={{ color: "var(--danger)", backgroundColor: "transparent" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-raised)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
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
