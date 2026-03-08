import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { MoreVertical, LogOut, User } from "lucide-react";

const ROLE_LABELS = {
  super_admin: "Super Admin",
  admin: "Admin",
  hotel: "Hotel",
  restaurant: "Restaurant",
  activity: "Activity",
};

const ROLE_BADGE = {
  super_admin: { bg: "#ede9fe", color: "#7c3aed" },
  admin: { bg: "#dbeafe", color: "#1d4ed8" },
  hotel: { bg: "#d1fae5", color: "#065f46" },
  restaurant: { bg: "#fef3c7", color: "#92400e" },
  activity: { bg: "#ffe4e6", color: "#be123c" },
};

export default function Navbar() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, theme, dir } = useLanguage();
  const isDark = theme === "dark";
  const isRtl = dir === "rtl";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    setMenuOpen(false);
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

  const roleLabel = ROLE_LABELS[user?.role] || user?.role || "";
  const badge = ROLE_BADGE[user?.role] || { bg: "#f1f5f9", color: "#475569" };
  const avatar = user?.name?.[0]?.toUpperCase() || "U";

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: isDark
          ? "linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(30,41,59,0.88) 100%)"
          : "linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(241,245,249,0.82) 100%)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`,
        boxShadow: isDark
          ? "0 2px 20px rgba(0,0,0,0.4)"
          : "0 2px 20px rgba(99,102,241,0.08), 0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {/* ── Left: Logo ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img
          src="/logo.png"
          alt="Travky.com"
          style={{
            height: 44,
            width: "auto",
            objectFit: "contain",
            display: "block",
          }}
          onError={(e) => {
            e.target.src = "/logo.svg";
          }}
        />
        <div
          style={{ display: "flex", flexDirection: "column", lineHeight: 1.25 }}
        >
          <span
            style={{
              fontWeight: 800,
              fontSize: 15,
              background: "linear-gradient(90deg, #1d4ed8 0%, #7c3aed 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.2px",
            }}
          >
            Travky.com
          </span>
          <span
            style={{
              fontSize: 10,
              color: isDark ? "#94a3b8" : "#64748b",
              letterSpacing: 0.2,
            }}
          >
            {t("unifiedBookingPlatform")}
          </span>
        </div>
      </div>

      {/* ── Right: User info + three-dot menu ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Avatar + name + role */}
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            {avatar}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              lineHeight: 1.3,
            }}
          >
            <span
              style={{
                fontWeight: 600,
                fontSize: 13,
                color: isDark ? "#f1f5f9" : "#1e293b",
                whiteSpace: "nowrap",
              }}
            >
              {user?.name || "User"}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "1px 6px",
                borderRadius: 999,
                background: badge.bg,
                color: badge.color,
                width: "fit-content",
              }}
            >
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Three-dots menu */}
        <div style={{ position: "relative" }} ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            title="More options"
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: "none",
              background: menuOpen
                ? isDark
                  ? "#1e293b"
                  : "#f1f5f9"
                : "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.15s",
              color: isDark ? "#94a3b8" : "#64748b",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = isDark
                ? "#1e293b"
                : "#f1f5f9")
            }
            onMouseLeave={(e) => {
              if (!menuOpen) e.currentTarget.style.background = "transparent";
            }}
          >
            <MoreVertical size={18} />
          </button>

          {menuOpen && (
            <div
              style={{
                position: "absolute",
                right: isRtl ? "auto" : 0,
                left: isRtl ? 0 : "auto",
                top: 40,
                width: 180,
                background: isDark ? "#1e293b" : "#ffffff",
                border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
                borderRadius: 12,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                zIndex: 200,
                overflow: "hidden",
              }}
            >
              {/* user info header (visible on small screens) */}
              <div
                style={{
                  padding: "10px 14px",
                  borderBottom: `1px solid ${isDark ? "#334155" : "#f1f5f9"}`,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: isDark ? "#f1f5f9" : "#1e293b",
                  }}
                >
                  {user?.name || "User"}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: isDark ? "#94a3b8" : "#64748b",
                    marginTop: 1,
                  }}
                >
                  {user?.email || ""}
                </div>
              </div>

              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "10px 14px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#ef4444",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = isDark
                    ? "rgba(239,68,68,0.1)"
                    : "#fef2f2")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
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
