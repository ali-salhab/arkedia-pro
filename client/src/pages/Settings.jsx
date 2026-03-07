import { useSelector } from "react-redux";

export default function SettingsPage() {
  const user = useSelector((s) => s.auth.user);

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Settings</h2>
        <p style={{ color: "#9ca3af" }}>Manage your account and preferences.</p>
      </div>

      <div className="card">
        <h3 style={{ fontWeight: 600, marginBottom: 12 }}>Profile</h3>
        <div style={{ display: "grid", gap: 12, maxWidth: 400 }}>
          <div>
            <label
              style={{
                display: "block",
                color: "#9ca3af",
                fontSize: 12,
                marginBottom: 4,
              }}
            >
              Name
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
              Email
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
              Role
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
        <h3 style={{ fontWeight: 600, marginBottom: 12 }}>Preferences</h3>
        <div style={{ display: "grid", gap: 12, maxWidth: 400 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>Dark Mode</span>
            <span style={{ color: "#22d3ee" }}>Enabled</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>Email Notifications</span>
            <span style={{ color: "#9ca3af" }}>Coming soon</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>Language</span>
            <span>English</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontWeight: 600, marginBottom: 12 }}>Permissions</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {(user?.permissions || []).map((perm) => (
            <span
              key={perm}
              style={{
                background: "#334155",
                padding: "4px 10px",
                borderRadius: 6,
                fontSize: 12,
              }}
            >
              {perm}
            </span>
          ))}
          {(!user?.permissions || user.permissions.length === 0) && (
            <span style={{ color: "#9ca3af" }}>
              No explicit permissions (inherited from role)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
