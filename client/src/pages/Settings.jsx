import { useSelector } from "react-redux";
import { useLanguage } from "../context/LanguageContext";

const ROLE_BADGE = {
  super_admin: {
    label: "Super Admin",
    icon: "🔑",
    color: "#a78bfa",
    bg: "#8b5cf620",
    border: "#a78bfa40",
  },
  admin: {
    label: "Admin",
    icon: "👔",
    color: "#60a5fa",
    bg: "#3b82f620",
    border: "#60a5fa40",
  },
  hotel: {
    label: "Hotel Manager",
    icon: "🏨",
    color: "#4ade80",
    bg: "#22c55e20",
    border: "#4ade8040",
  },
  restaurant: {
    label: "Restaurant Manager",
    icon: "🍽️",
    color: "#fbbf24",
    bg: "#f59e0b20",
    border: "#fbbf2440",
  },
  activity: {
    label: "Activity Manager",
    icon: "🎯",
    color: "#f472b6",
    bg: "#ec489920",
    border: "#f472b640",
  },
};

const MODULE_LABELS = {
  users: { label: "Users", icon: "👥" },
  roles: { label: "Roles", icon: "🔐" },
  hotels: { label: "Hotels", icon: "🏨" },
  restaurants: { label: "Restaurants", icon: "🍽️" },
  activities: { label: "Activities", icon: "🎯" },
  bookings: { label: "Bookings", icon: "📅" },
  rooms: { label: "Rooms / Tables", icon: "🚪" },
  finance: { label: "Finance", icon: "💰" },
  reports: { label: "Reports", icon: "📊" },
  settings: { label: "Settings", icon: "⚙️" },
};

const ACTION_COLORS = {
  view: {
    bg: "#dbeafe",
    color: "#2563eb",
    dark_bg: "#1d4ed820",
    dark_color: "#93c5fd",
  },
  add: {
    bg: "#dcfce7",
    color: "#16a34a",
    dark_bg: "#16a34a20",
    dark_color: "#86efac",
  },
  edit: {
    bg: "#fef9c3",
    color: "#ca8a04",
    dark_bg: "#ca8a0420",
    dark_color: "#fde047",
  },
  delete: {
    bg: "#fee2e2",
    color: "#dc2626",
    dark_bg: "#dc262620",
    dark_color: "#fca5a5",
  },
};

export default function SettingsPage() {
  const user = useSelector((s) => s.auth.user);
  const { lang, toggleLang, t, theme, toggleTheme } = useLanguage();

  const isDark = theme === "dark";

  const cardStyle = isDark
    ? { background: "#1e293b", borderColor: "#334155", color: "#f1f5f9" }
    : {};
  const labelColor = isDark ? "#94a3b8" : "#475569";
  const inputStyle = isDark
    ? { background: "#0f172a", color: "#f1f5f9", borderColor: "#475569" }
    : { background: "#f8fafc" };
  const dividerColor = isDark ? "#334155" : "#f1f5f9";
  const textColor = isDark ? "#f1f5f9" : "#1e293b";
  const mutedColor = isDark ? "#94a3b8" : "#64748b";

  return (
    <div className="space-y-6">
      <div className="card" style={cardStyle}>
        <h2 style={{ fontWeight: 600, marginBottom: 8, color: textColor }}>
          {t("settings")}
        </h2>
        <p style={{ color: mutedColor }}>{t("settingsSubtitle")}</p>
      </div>

      <div className="card" style={cardStyle}>
        <h3 style={{ fontWeight: 600, marginBottom: 12, color: textColor }}>
          {t("profile")}
        </h3>
        <div style={{ display: "grid", gap: 12, maxWidth: 400 }}>
          {[
            { label: t("name"), value: user?.name },
            { label: t("email"), value: user?.email },
            { label: t("role"), value: user?.role },
          ].map(({ label, value }) => (
            <div key={label}>
              <label
                style={{
                  display: "block",
                  color: labelColor,
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                {label}
              </label>
              <input
                className="input"
                value={value || ""}
                readOnly
                style={inputStyle}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <h3 style={{ fontWeight: 600, marginBottom: 12, color: textColor }}>
          {t("preferences")}
        </h3>
        <div style={{ display: "grid", gap: 0, maxWidth: 440 }}>
          {/* Language */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
              borderBottom: `1px solid ${dividerColor}`,
            }}
          >
            <div>
              <div style={{ fontWeight: 500, color: textColor }}>
                {t("language")}
              </div>
              <div style={{ fontSize: 12, color: mutedColor, marginTop: 2 }}>
                {lang === "en" ? "English" : "العربية"}
              </div>
            </div>
            <button
              onClick={toggleLang}
              style={{
                padding: "8px 18px",
                background:
                  lang === "ar" ? "#2563eb" : isDark ? "#334155" : "#f1f5f9",
                color: lang === "ar" ? "#fff" : textColor,
                borderRadius: 8,
                border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
                transition: "all 0.2s",
              }}
            >
              {lang === "en" ? "🇸🇦 العربية" : "🇺🇸 English"}
            </button>
          </div>

          {/* Theme */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
              borderBottom: `1px solid ${dividerColor}`,
            }}
          >
            <div>
              <div style={{ fontWeight: 500, color: textColor }}>
                {t("theme")}
              </div>
              <div style={{ fontSize: 12, color: mutedColor, marginTop: 2 }}>
                {isDark ? t("darkMode") : t("lightMode")}
              </div>
            </div>
            <button
              onClick={toggleTheme}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 18px",
                background: isDark ? "#2563eb" : "#f1f5f9",
                color: isDark ? "#fff" : "#1e293b",
                borderRadius: 8,
                border: `1px solid ${isDark ? "#3b82f6" : "#cbd5e1"}`,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
                transition: "all 0.2s",
              }}
            >
              {isDark ? "☀️ " + t("lightMode") : "🌙 " + t("darkMode")}
            </button>
          </div>

          {/* Email notifications */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
            }}
          >
            <span style={{ color: textColor }}>
              {t("emailNotificationsLabel")}
            </span>
            <span style={{ color: mutedColor, fontSize: 13 }}>
              {t("comingSoonLabel")}
            </span>
          </div>
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <h3 style={{ fontWeight: 600, marginBottom: 4, color: textColor }}>
          🎭 {t("role")} &amp; {t("permissions")}
        </h3>
        <p style={{ color: mutedColor, fontSize: 13, marginBottom: 20 }}>
          Permissions granted to your account by the system administrator.
        </p>

        {/* Role Badge */}
        {(() => {
          const badge = ROLE_BADGE[user?.role];
          return badge ? (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 18px",
                borderRadius: 12,
                background: isDark ? badge.bg : badge.bg,
                border: `1px solid ${badge.border}`,
                marginBottom: 24,
              }}
            >
              <span style={{ fontSize: 22 }}>{badge.icon}</span>
              <div>
                <div
                  style={{ fontWeight: 700, fontSize: 15, color: badge.color }}
                >
                  {badge.label}
                </div>
                <div style={{ fontSize: 12, color: mutedColor }}>
                  {(user?.permissions || []).length} permissions granted
                </div>
              </div>
            </div>
          ) : null;
        })()}

        {/* Permissions grouped by module */}
        {(user?.permissions || []).length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "32px 0",
              color: mutedColor,
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 8 }}>🔒</div>
            <div style={{ fontWeight: 500 }}>{t("noPermissions")}</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              Contact your administrator to grant access.
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            {Object.entries(
              (user?.permissions || []).reduce((acc, perm) => {
                const [module, action] = perm.split(":");
                if (!acc[module]) acc[module] = [];
                acc[module].push(action);
                return acc;
              }, {}),
            ).map(([module, actions]) => {
              const mod = MODULE_LABELS[module] || {
                label: module,
                icon: "🔧",
              };
              return (
                <div
                  key={module}
                  style={{
                    background: isDark ? "#0f172a" : "#f8fafc",
                    borderRadius: 10,
                    padding: "12px 14px",
                    border: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      marginBottom: 10,
                      fontWeight: 600,
                      fontSize: 13,
                      color: textColor,
                    }}
                  >
                    <span>{mod.icon}</span>
                    {mod.label}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {actions.map((action) => {
                      const ac = ACTION_COLORS[action] || {
                        bg: "#f1f5f9",
                        color: "#64748b",
                        dark_bg: "#33415520",
                        dark_color: "#94a3b8",
                      };
                      return (
                        <span
                          key={action}
                          style={{
                            padding: "3px 9px",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 500,
                            background: isDark ? ac.dark_bg : ac.bg,
                            color: isDark ? ac.dark_color : ac.color,
                            textTransform: "capitalize",
                          }}
                        >
                          {action}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
