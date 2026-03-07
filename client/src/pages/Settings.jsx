import { useSelector } from "react-redux";
import { useLanguage } from "../context/LanguageContext";

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
        <h2 style={{ fontWeight: 600, marginBottom: 8, color: textColor }}>{t("settings")}</h2>
        <p style={{ color: mutedColor }}>{t("settingsSubtitle")}</p>
      </div>

      <div className="card" style={cardStyle}>
        <h3 style={{ fontWeight: 600, marginBottom: 12, color: textColor }}>{t("profile")}</h3>
        <div style={{ display: "grid", gap: 12, maxWidth: 400 }}>
          {[
            { label: t("name"), value: user?.name },
            { label: t("email"), value: user?.email },
            { label: t("role"), value: user?.role },
          ].map(({ label, value }) => (
            <div key={label}>
              <label style={{ display: "block", color: labelColor, fontSize: 12, marginBottom: 4 }}>
                {label}
              </label>
              <input className="input" value={value || ""} readOnly style={inputStyle} />
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <h3 style={{ fontWeight: 600, marginBottom: 12, color: textColor }}>{t("preferences")}</h3>
        <div style={{ display: "grid", gap: 0, maxWidth: 440 }}>
          {/* Language */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: `1px solid ${dividerColor}` }}>
            <div>
              <div style={{ fontWeight: 500, color: textColor }}>{t("language")}</div>
              <div style={{ fontSize: 12, color: mutedColor, marginTop: 2 }}>
                {lang === "en" ? "English" : "العربية"}
              </div>
            </div>
            <button
              onClick={toggleLang}
              style={{
                padding: "8px 18px",
                background: lang === "ar" ? "#2563eb" : isDark ? "#334155" : "#f1f5f9",
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: `1px solid ${dividerColor}` }}>
            <div>
              <div style={{ fontWeight: 500, color: textColor }}>{t("theme")}</div>
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0" }}>
            <span style={{ color: textColor }}>{t("emailNotificationsLabel")}</span>
            <span style={{ color: mutedColor, fontSize: 13 }}>{t("comingSoonLabel")}</span>
          </div>
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <h3 style={{ fontWeight: 600, marginBottom: 12, color: textColor }}>{t("permissions")}</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {(user?.permissions || []).map((perm) => (
            <span
              key={perm}
              style={{
                background: isDark ? "#1d4ed8" : "#dbeafe",
                color: isDark ? "#bfdbfe" : "#2563eb",
                border: `1px solid ${isDark ? "#3b82f6" : "#93c5fd"}`,
                padding: "4px 10px",
                borderRadius: 6,
                fontSize: 12,
              }}
            >
              {perm}
            </span>
          ))}
          {(!user?.permissions || user.permissions.length === 0) && (
            <span style={{ color: mutedColor }}>{t("noPermissions")}</span>
          )}
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 style={{ fontWeight: 600, marginBottom: 8 }}>{t("settings")}</h2>
        <p style={{ color: "#64748b" }}>{t("settingsSubtitle")}</p>
      </div>

      <div className="card">
        <h3 style={{ fontWeight: 600, marginBottom: 12 }}>{t("profile")}</h3>
        <div style={{ display: "grid", gap: 12, maxWidth: 400 }}>
          <div>
            <label
              style={{
                display: "block",
                color: "#475569",
                fontSize: 12,
                marginBottom: 4,
              }}
            >
              {t("name")}
            </label>
            <input
              className="input"
              value={user?.name || ""}
              readOnly
              style={{ background: "#f8fafc" }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                color: "#475569",
                fontSize: 12,
                marginBottom: 4,
              }}
            >
              {t("email")}
            </label>
            <input
              className="input"
              value={user?.email || ""}
              readOnly
              style={{ background: "#f8fafc" }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                color: "#475569",
                fontSize: 12,
                marginBottom: 4,
              }}
            >
              {t("role")}
            </label>
            <input
              className="input"
              value={user?.role || ""}
              readOnly
              style={{ background: "#f8fafc" }}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontWeight: 600, marginBottom: 12 }}>
          {t("preferences")}
        </h3>
        <div style={{ display: "grid", gap: 16, maxWidth: 400 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 0",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <div>
              <div style={{ fontWeight: 500, color: "#1e293b" }}>
                {t("language")}
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                {lang === "en" ? "English" : "العربية"}
              </div>
            </div>
            <button
              onClick={toggleLang}
              style={{
                padding: "8px 18px",
                background: lang === "ar" ? "#2563eb" : "#f1f5f9",
                color: lang === "ar" ? "#fff" : "#1e293b",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
                transition: "all 0.2s",
              }}
            >
              {lang === "en" ? "🇸🇦 العربية" : "🇺🇸 English"}
            </button>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 0",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <span style={{ color: "#1e293b" }}>Email Notifications</span>
            <span style={{ color: "#64748b", fontSize: 13 }}>Coming soon</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 0",
            }}
          >
            <span style={{ color: "#1e293b" }}>Theme</span>
            <span
              style={{
                background: "#dbeafe",
                color: "#2563eb",
                padding: "4px 12px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Light Mode
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontWeight: 600, marginBottom: 12 }}>
          {t("permissions")}
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {(user?.permissions || []).map((perm) => (
            <span
              key={perm}
              style={{
                background: "#dbeafe",
                color: "#2563eb",
                border: "1px solid #93c5fd",
                padding: "4px 10px",
                borderRadius: 6,
                fontSize: 12,
              }}
            >
              {perm}
            </span>
          ))}
          {(!user?.permissions || user.permissions.length === 0) && (
            <span style={{ color: "#64748b" }}>
              No explicit permissions (inherited from role)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
