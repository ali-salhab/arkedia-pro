import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="navbar">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "999px",
            display: "grid",
            placeItems: "center",
            background: "#2563eb",
            color: "#ffffff",
            fontWeight: 700,
          }}
        >
          T
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 600, color: "#1e293b" }}>Travik.com</span>
          <span style={{ fontSize: 11, color: "#64748b" }}>
            Unified Booking Platform
          </span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "#334155" }}>{user?.name}</span>
        <button className="btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
