import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../store/services/api";
import { logout } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Menu, Moon, Sun, Globe, Search, X } from "lucide-react";
import NotificationPanel from "./NotificationPanel";
import ProfileModal from "./ProfileModal";

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

const ROLE_COLORS = {
  super_admin: "from-violet-500 to-purple-600",
  superadminuser: "from-violet-400 to-purple-500",
  admin: "from-blue-500 to-blue-700",
  adminuser: "from-blue-400 to-blue-600",
  hotel: "from-emerald-500 to-teal-600",
  hoteluser: "from-emerald-400 to-teal-500",
  restaurant: "from-orange-500 to-red-500",
  restaurantuser: "from-orange-400 to-red-400",
  activity: "from-amber-500 to-yellow-600",
  activityuser: "from-amber-400 to-yellow-500",
};

export default function Navbar({
  onToggleSidebar,
  notifications = [],
  onClearNotifications,
}) {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, theme, toggleTheme, toggleLang, dir } = useLanguage();
  const isDark = theme === "dark";
  const isRtl = dir === "rtl";
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials =
    user?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";
  const roleGradient = ROLE_COLORS[user?.role] || "from-blue-500 to-blue-700";
  const roleLabel = ROLE_LABELS[user?.role] || "Staff";

  const handleLogout = () => {
    dispatch(api.util.resetApiState());
    dispatch(logout());
    navigate("/login");
  };

  return (
    <>
      <header
        className="sticky top-0 z-40 h-[60px] flex items-center gap-3 px-4 bg-white/80 dark:bg-[#0b0f14]/90 backdrop-blur-2xl border-b border-slate-200/70 dark:border-slate-800/70 shadow-sm"
        style={{ direction: isRtl ? "rtl" : "ltr" }}
      >
        {/* Left: hamburger + brand */}
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden h-9 w-9 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} strokeWidth={2} />
          </button>

          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="h-16 w-16 shrink-0 -ml-1">
              <img
                src="/logo_transparent.png"
                alt="Travky"
                className="h-full w-full object-contain drop-shadow-sm scale-125"
              />
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-[15px] font-black text-slate-700 dark:text-white tracking-tight pb-1">
                Travky.com
              </span>
              <span className="text-[7px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Dashboard
              </span>
            </div>
          </div>
        </div>

        {/* Center: search */}
        <div className="mx-3 flex-1 max-w-sm hidden lg:block">
          <div
            className={`flex items-center gap-2.5 h-10 px-4 rounded-2xl transition-all ${searchFocused ? "bg-white dark:bg-slate-900 ring-2 ring-blue-500/30 border border-blue-400/50 shadow-md" : "bg-slate-100/80 dark:bg-slate-800/80 border border-transparent"}`}
          >
            <Search
              size={15}
              className="shrink-0 text-slate-400 dark:text-slate-500"
            />
            <input
              type="text"
              placeholder={t("search") + "..."}
              className="h-full flex-1 bg-transparent text-[13.5px] font-medium text-slate-800 dark:text-white outline-none placeholder-slate-400 dark:placeholder-slate-500"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <kbd className="hidden sm:inline-flex shrink-0 h-5 items-center gap-0.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 shadow-sm">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: actions */}
        <div
          className={`flex shrink-0 items-center gap-1 ${isRtl ? "mr-auto" : "ml-auto"}`}
        >
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {isDark ? (
              <Sun size={17} strokeWidth={2} />
            ) : (
              <Moon size={17} strokeWidth={2} />
            )}
          </button>
          {/* Lang toggle */}
          <button
            onClick={toggleLang}
            className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle language"
          >
            <Globe size={17} strokeWidth={2} />
          </button>

          <NotificationPanel
            notifications={notifications}
            onClear={onClearNotifications}
          />

          {/* Divider */}
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* Role badge */}
          <div
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r ${roleGradient} shadow-md`}
          >
            <span className="text-white text-[11px] font-black uppercase tracking-wider">
              {roleLabel}
            </span>
          </div>

          {/* Avatar */}
          <div style={{ position: "relative" }} ref={profileRef}>
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className={`${isRtl ? "mr-1" : "ml-1"} h-9 w-9 rounded-xl overflow-hidden ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-blue-500/50 hover:ring-blue-500 transition-all shadow-sm`}
              aria-label="User profile"
            >
              {user?.logo ? (
                <img
                  src={user.logo}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className={`h-full w-full flex items-center justify-center text-[12px] font-black text-white bg-gradient-to-br ${roleGradient}`}
                >
                  {initials}
                </div>
              )}
            </button>
            <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
          </div>
        </div>
      </header>
    </>
  );
}
