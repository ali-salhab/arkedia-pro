import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function NotificationPanel({ notifications = [], onClear }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { t, theme, dir } = useLanguage();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unread = notifications.length;

  const bg = isDark ? "#1e293b" : "#fff";
  const border = isDark ? "#334155" : "#e2e8f0";
  const textColor = isDark ? "#f1f5f9" : "#1e293b";
  const mutedColor = isDark ? "#94a3b8" : "#64748b";

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "relative",
          width: 38,
          height: 38,
          borderRadius: 10,
          border: `1px solid ${border}`,
          background: isDark ? "#1e293b" : "#f8fafc",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: isDark ? "#94a3b8" : "#64748b",
          transition: "all 0.2s",
        }}
        aria-label={t("notifications")}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              background: "#ef4444",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              width: 18,
              height: 18,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid " + (isDark ? "#0f172a" : "#fff"),
              animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
            }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            ...(dir === "rtl" ? { left: 0 } : { right: 0 }),
            width: 320,
            background: bg,
            border: `1px solid ${border}`,
            borderRadius: 14,
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            zIndex: 1200,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderBottom: `1px solid ${border}`,
            }}
          >
            <span style={{ fontWeight: 600, fontSize: 14, color: textColor }}>
              {t("notifications")}
            </span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {unread > 0 && (
                <button
                  onClick={onClear}
                  style={{
                    fontSize: 12,
                    color: "#3b82f6",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  {t("clearAll")}
                </button>
              )}
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/notifications");
                }}
                style={{
                  fontSize: 12,
                  color: "#64748b",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                View all
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div
              style={{
                padding: "32px 16px",
                textAlign: "center",
                color: mutedColor,
                fontSize: 13,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
              {t("noNotifications")}
            </div>
          ) : (
            <div style={{ maxHeight: 320, overflowY: "auto" }}>
              {notifications.map((n, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px 16px",
                    borderBottom:
                      i < notifications.length - 1
                        ? `1px solid ${border}`
                        : "none",
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background:
                        n.type === "permissions"
                          ? isDark
                            ? "#1d4ed820"
                            : "#dbeafe"
                          : isDark
                            ? "#33415520"
                            : "#f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    {n.type === "permissions" ? "🔐" : "🔔"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        color: textColor,
                        marginBottom: 2,
                      }}
                    >
                      {n.title}
                    </div>
                    <div style={{ fontSize: 12, color: mutedColor }}>
                      {n.body}
                    </div>
                    {n.time && (
                      <div
                        style={{
                          fontSize: 11,
                          color: mutedColor,
                          marginTop: 4,
                        }}
                      >
                        {n.time}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
