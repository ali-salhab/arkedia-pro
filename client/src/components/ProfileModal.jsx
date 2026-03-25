import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import { api } from "../store/services/api";
import { useLanguage } from "../context/LanguageContext";
import { Settings, LogOut } from "lucide-react";

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
  super_admin: "#8b5cf6",
  superadminuser: "#8b5cf6",
  admin: "#3b82f6",
  adminuser: "#3b82f6",
  hotel: "#10b981",
  hoteluser: "#10b981",
  restaurant: "#f59e0b",
  restaurantuser: "#f59e0b",
  activity: "#ef4444",
  activityuser: "#ef4444",
};

export default function ProfileModal({ open, onClose }) {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const isRtl = dir === "rtl";

  if (!open) return null;

  const initials =
    user?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const roleLabel = ROLE_LABELS[user?.role] || user?.role || "User";
  const roleColor = ROLE_COLORS[user?.role] || "var(--brand)";
  const permCount = (user?.permissions || []).length;

  const handleLogout = () => {
    onClose();
    dispatch(api.util.resetApiState());
    dispatch(logout());
    navigate("/login");
  };

  const handleSettings = () => {
    onClose();
    navigate("/settings");
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        ...(isRtl ? { left: 0 } : { right: 0 }),
        width: 320,
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
        zIndex: 1200,
        overflow: "hidden",
        direction: isRtl ? "rtl" : "ltr",
      }}
    >
      {/* Header with close */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 20px 14px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          {isRtl ? "الملف الشخصي" : "My Profile"}
        </span>
        <button className="icon-btn" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      {/* Avatar + name section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          padding: "24px 20px 20px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {/* Logo / Avatar */}
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: 20,
            overflow: "hidden",
            border: "3px solid var(--border)",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg-raised)",
          }}
        >
          {user?.logo ? (
            <img
              src={user.logo}
              alt={user.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: roleColor,
                color: "#fff",
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              {initials}
            </div>
          )}
        </div>

        {/* Name */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 4,
            }}
          >
            {user?.name || "User"}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              marginBottom: 8,
            }}
          >
            {user?.email || ""}
          </div>
          {/* Role badge */}
          <span
            style={{
              display: "inline-block",
              padding: "3px 12px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              color: "#fff",
              background: roleColor,
            }}
          >
            {roleLabel}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {permCount}
          </div>
          <div
            style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}
          >
            {isRtl ? "صلاحية" : "Permissions"}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          padding: "12px 16px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <button
          onClick={handleSettings}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "11px 14px",
            borderRadius: 12,
            border: "none",
            background: "var(--bg-raised)",
            color: "var(--text-secondary)",
            fontWeight: 500,
            fontSize: 14,
            cursor: "pointer",
            textAlign: isRtl ? "right" : "left",
          }}
        >
          <Settings size={16} />
          {t("settings")}
        </button>
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "11px 14px",
            borderRadius: 12,
            border: "none",
            background: "rgba(239,68,68,0.08)",
            color: "#ef4444",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            textAlign: isRtl ? "right" : "left",
          }}
        >
          <LogOut size={16} />
          {t("logout")}
        </button>
      </div>
    </div>
  );
}
