import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function Navbar() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, theme } = useLanguage();
  const isDark = theme === "dark";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="navbar">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <img
          src="/logo.png"
          alt="Travky.com"
          style={{
            width: 100,
            height: 100,
            borderRadius: "999px",
            objectFit: "cover",
          }}
          onError={(e) => {
            e.target.src = "/logo.svg";
          }}
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 600, color: "#1e293b" }}>Travky.com</span>
          <span style={{ fontSize: 11, color: isDark ? "#94a3b8" : "#64748b" }}>
            {t("unifiedBookingPlatform")}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: isDark ? "#f1f5f9" : "#334155" }}>
          {user?.name}
        </span>
        <button className="btn" onClick={handleLogout}>
          {t("logout")}
        </button>
      </div>
    </div>
  );
}
