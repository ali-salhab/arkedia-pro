import { useSelector } from "react-redux";
import { useLanguage } from "../context/LanguageContext";

const ROLE_BADGE = {
  super_admin: {
    labelKey: "role_super_admin",
    icon: "🔑",
    tone: "from-violet-500/20 to-purple-500/10",
    text: "text-violet-300",
    border: "border-violet-400/30",
  },
  admin: {
    labelKey: "role_admin",
    icon: "👔",
    tone: "from-sky-500/20 to-blue-500/10",
    text: "text-sky-300",
    border: "border-sky-400/30",
  },
  hotel: {
    labelKey: "role_hotel",
    icon: "🏨",
    tone: "from-emerald-500/20 to-green-500/10",
    text: "text-emerald-300",
    border: "border-emerald-400/30",
  },
  restaurant: {
    labelKey: "role_restaurant",
    icon: "🍽️",
    tone: "from-amber-500/20 to-orange-500/10",
    text: "text-amber-300",
    border: "border-amber-400/30",
  },
  activity: {
    labelKey: "role_activity",
    icon: "🎯",
    tone: "from-rose-500/20 to-pink-500/10",
    text: "text-rose-300",
    border: "border-rose-400/30",
  },
  superadminuser: {
    labelKey: "role_super_admin",
    icon: "🔐",
    tone: "from-violet-500/20 to-purple-500/10",
    text: "text-violet-300",
    border: "border-violet-400/30",
  },
  adminuser: {
    labelKey: "role_admin",
    icon: "🧩",
    tone: "from-sky-500/20 to-blue-500/10",
    text: "text-sky-300",
    border: "border-sky-400/30",
  },
  hoteluser: {
    labelKey: "role_hotel",
    icon: "🛎️",
    tone: "from-emerald-500/20 to-green-500/10",
    text: "text-emerald-300",
    border: "border-emerald-400/30",
  },
  restaurantuser: {
    labelKey: "role_restaurant",
    icon: "🍴",
    tone: "from-amber-500/20 to-orange-500/10",
    text: "text-amber-300",
    border: "border-amber-400/30",
  },
  activityuser: {
    labelKey: "role_activity",
    icon: "🧭",
    tone: "from-rose-500/20 to-pink-500/10",
    text: "text-rose-300",
    border: "border-rose-400/30",
  },
};

const MODULE_LABELS = {
  users: { key: "module_users", icon: "👥" },
  roles: { key: "role", icon: "🔐" },
  hotels: { key: "module_hotels", icon: "🏨" },
  hotel: { key: "module_hotel", icon: "🏩" },
  channel_manager: { key: "module_channel_manager", icon: "🔗" },
  channel_manager_travky: { key: "module_channel_manager_travky", icon: "🧭" },
  channel_manager_external: {
    key: "module_channel_manager_external",
    icon: "🌐",
  },
  guest_groups: { key: "module_guest_groups", icon: "👨‍👩‍👧‍👦" },
  meal_plans: { key: "module_meal_plans", icon: "🍽️" },
  periods: { key: "module_periods", icon: "🗓️" },
  supplements: { key: "module_supplements", icon: "➕" },
  refund_policies: { key: "module_refund_policies", icon: "↩️" },
  channel_manager_rooms: {
    key: "module_channel_manager_rooms",
    icon: "🛏️",
  },
  rates: { key: "module_rates", icon: "💲" },
  availability: { key: "module_availability", icon: "📦" },
  restaurants: { key: "module_restaurants", icon: "🍽️" },
  activities: { key: "module_activities", icon: "🎯" },
  bookings: { key: "module_bookings", icon: "📅" },
  rooms: { key: "module_rooms", icon: "🚪" },
  finance: { key: "module_finance", icon: "💰" },
  reports: { key: "module_reports", icon: "📊" },
  settings: { key: "module_settings", icon: "⚙️" },
};

const ACTION_COLORS = {
  view: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-200",
  add: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200",
  edit: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200",
  delete: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200",
  manage:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-200",
};

const ACTION_LABELS = {
  view: "view",
  add: "add",
  edit: "edit",
  delete: "delete",
  manage: "manage",
};

function titleCase(value) {
  return String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function SettingsPage() {
  const user = useSelector((s) => s.auth.user);
  const { lang, toggleLang, t, theme, toggleTheme } = useLanguage();

  const groupedPermissions = (user?.permissions || []).reduce((acc, perm) => {
    const [module, action] = perm.split(":");
    if (!module || !action) return acc;
    if (!acc[module]) acc[module] = [];
    if (!acc[module].includes(action)) acc[module].push(action);
    return acc;
  }, {});

  const roleBadge = ROLE_BADGE[user?.role] || {
    labelKey: "role",
    icon: "👤",
    tone: "from-slate-500/20 to-slate-500/10",
    text: "text-slate-300",
    border: "border-slate-400/30",
  };

  const readonlyRows = [
    { label: t("name"), value: user?.name || "-" },
    { label: t("email"), value: user?.email || "-" },
    { label: t("role"), value: t(roleBadge.labelKey) || user?.role || "-" },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-blue-950/10 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/60">
        <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-indigo-400/20 blur-3xl" />

        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t("settings")}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {t("settingsSubtitle")}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${roleBadge.border} bg-gradient-to-r ${roleBadge.tone} ${roleBadge.text}`}
          >
            <span>{roleBadge.icon}</span>
            {t(roleBadge.labelKey)}
          </span>
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
            {(user?.permissions || []).length} {t("permissionsCountLabel")}
          </span>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-5">
        <article className="card space-y-4 lg:col-span-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t("profile")}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
              {t("settingsProfileReadonly")}
            </p>
          </div>

          <div className="space-y-3">
            {readonlyRows.map((row) => (
              <div key={row.label}>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {row.label}
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
                  {row.value}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="card space-y-4 lg:col-span-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t("preferences")}
          </h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={toggleLang}
              className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:from-slate-900/80 dark:to-slate-800/70"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t("language")}
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                {lang === "en" ? "English" : "العربية"}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                {lang === "en" ? t("switchToArabic") : t("switchToEnglish")}
              </div>
            </button>

            <button
              onClick={toggleTheme}
              className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:from-slate-900/80 dark:to-slate-800/70"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t("theme")}
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                {theme === "dark" ? t("darkMode") : t("lightMode")}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                {theme === "dark"
                  ? t("switchToLightMode")
                  : t("switchToDarkMode")}
              </div>
            </button>

            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 dark:border-slate-700 dark:from-slate-900/80 dark:to-slate-800/70 sm:col-span-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t("emailNotificationsLabel")}
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                {t("comingSoonLabel")}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                {t("settingsNotificationHint")}
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t("permissions")}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
              {t("settingsPermissionHint")}
            </p>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
            {(user?.permissions || []).length} {t("permissionsCountLabel")}
          </span>
        </div>

        {(user?.permissions || []).length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
            <div className="text-2xl">🔒</div>
            <div className="mt-2 font-semibold">{t("noPermissions")}</div>
            <div className="mt-1 text-xs">{t("settingsNoPermissionsHint")}</div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(groupedPermissions).map(([module, actions]) => {
              const moduleConfig = MODULE_LABELS[module] || {
                key: module,
                icon: "🔧",
              };

              return (
                <div
                  key={module}
                  className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-slate-700 dark:bg-slate-900/60"
                >
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    <span>{moduleConfig.icon}</span>
                    <span>{t(moduleConfig.key) || titleCase(module)}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {actions.map((action) => (
                      <span
                        key={action}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${ACTION_COLORS[action] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}
                      >
                        {t(ACTION_LABELS[action]) || titleCase(action)}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
