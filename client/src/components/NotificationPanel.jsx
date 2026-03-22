import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

function resolveNotification(notification, t) {
  if (notification.type === "permissions") {
    return {
      title: t("notif_permissionsUpdated"),
      body: t("notif_permissionsUpdatedBody"),
    };
  }

  if (notification.type === "icon_requested") {
    const legacyMatch = String(notification.body || "").match(
      /^(.*?) requested a new icon: "(.*)"$/,
    );
    const params = notification.params || {
      hotelName: legacyMatch?.[1] || "",
      label: legacyMatch?.[2] || "",
    };

    return {
      title: t("notif_iconRequestedTitle", params),
      body: t("notif_iconRequestedBody", params),
    };
  }

  if (notification.type === "icon_designed") {
    const legacyMatch = String(notification.body || "").match(/"(.*)"/);
    const params = notification.params || {
      label: legacyMatch?.[1] || "",
    };

    return {
      title: t("notif_iconDesignedTitle", params),
      body: t("notif_iconDesignedBody", params),
    };
  }

  return {
    title: notification.titleKey
      ? t(notification.titleKey, notification.params)
      : notification.title,
    body: notification.bodyKey
      ? t(notification.bodyKey, notification.params)
      : notification.body || notification.message || notification.text || "",
  };
}

function formatNotificationTime(value, lang) {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleTimeString(lang === "ar" ? "ar-EG" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function NotificationPanel({ notifications = [], onClear }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { t, dir, lang } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unread = notifications.filter(
    (notification) => !notification.read,
  ).length;

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "relative",
          width: 38,
          height: 38,
          borderRadius: 10,
          border: "1px solid var(--border)",
          background: "var(--bg-raised)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-secondary)",
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
              background: "var(--danger)",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              width: 18,
              height: 18,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid var(--bg-surface)",
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
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
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
              borderBottom: "1px solid var(--border)",
            }}
          >
            <span
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: "var(--text-primary)",
              }}
            >
              {t("notifications")}
            </span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {unread > 0 && (
                <button
                  onClick={onClear}
                  style={{
                    fontSize: 12,
                    color: "var(--brand)",
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
                  color: "var(--text-secondary)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                {t("viewAll")}
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div
              style={{
                padding: "32px 16px",
                textAlign: "center",
                color: "var(--text-secondary)",
                fontSize: 13,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
              {t("noNotifications")}
            </div>
          ) : (
            <div style={{ maxHeight: 320, overflowY: "auto" }}>
              {notifications.map((n, i) => {
                const content = resolveNotification(n, t);

                return (
                  <div
                    key={n.id || i}
                    style={{
                      padding: "12px 16px",
                      backgroundColor: n.read
                        ? "transparent"
                        : "rgba(37, 99, 235, 0.05)",
                      borderBottom:
                        i < notifications.length - 1
                          ? "1px solid var(--border)"
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
                            ? "var(--brand-muted)"
                            : "var(--bg-raised)",
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
                          color: "var(--text-primary)",
                          marginBottom: 2,
                        }}
                      >
                        {content.title}
                        {!n.read && (
                          <span
                            style={{
                              display: "inline-block",
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              marginInlineStart: 8,
                              backgroundColor: "var(--brand)",
                              verticalAlign: "middle",
                            }}
                          />
                        )}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "var(--text-secondary)" }}
                      >
                        {content.body}
                      </div>
                      {n.time && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--text-muted)",
                            marginTop: 4,
                          }}
                        >
                          {formatNotificationTime(n.time, lang)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
