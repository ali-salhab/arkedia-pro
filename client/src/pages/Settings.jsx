import { useSelector } from "react-redux";
import { useLanguage } from "../context/LanguageContext";

export default function SettingsPage() {
  const user = useSelector((s) => s.auth.user);
  const { lang, toggleLang, t } = useLanguage();

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
