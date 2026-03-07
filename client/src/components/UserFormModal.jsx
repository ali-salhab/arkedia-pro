import { useState, useEffect } from "react";

// All available permissions matrix
const permissionMatrix = [
  {
    module: "users",
    label: "Users Management",
    icon: "👥",
    actions: [
      { key: "view", label: "View Users" },
      { key: "add", label: "Add Users" },
      { key: "edit", label: "Edit Users" },
      { key: "delete", label: "Delete Users" },
    ],
  },
  {
    module: "hotels",
    label: "Hotels",
    icon: "🏨",
    actions: [
      { key: "view", label: "View Hotels" },
      { key: "add", label: "Add Hotels" },
      { key: "edit", label: "Edit Hotels" },
      { key: "delete", label: "Delete Hotels" },
    ],
  },
  {
    module: "restaurants",
    label: "Restaurants",
    icon: "🍽️",
    actions: [
      { key: "view", label: "View Restaurants" },
      { key: "add", label: "Add Restaurants" },
      { key: "edit", label: "Edit Restaurants" },
      { key: "delete", label: "Delete Restaurants" },
    ],
  },
  {
    module: "activities",
    label: "Activities",
    icon: "🎯",
    actions: [
      { key: "view", label: "View Activities" },
      { key: "add", label: "Add Activities" },
      { key: "edit", label: "Edit Activities" },
      { key: "delete", label: "Delete Activities" },
    ],
  },
  {
    module: "bookings",
    label: "Bookings",
    icon: "📅",
    actions: [
      { key: "view", label: "View Bookings" },
      { key: "add", label: "Add Bookings" },
      { key: "edit", label: "Edit Bookings" },
      { key: "delete", label: "Delete Bookings" },
    ],
  },
  {
    module: "rooms",
    label: "Rooms / Tables",
    icon: "🚪",
    actions: [
      { key: "view", label: "View Rooms" },
      { key: "add", label: "Add Rooms" },
      { key: "edit", label: "Edit Rooms" },
      { key: "delete", label: "Delete Rooms" },
    ],
  },
  {
    module: "finance",
    label: "Finance",
    icon: "💰",
    actions: [
      { key: "view", label: "View Finance" },
      { key: "add", label: "Add Transactions" },
      { key: "edit", label: "Edit Transactions" },
      { key: "delete", label: "Delete Transactions" },
    ],
  },
  {
    module: "reports",
    label: "Reports",
    icon: "📊",
    actions: [{ key: "view", label: "View Reports" }],
  },
  {
    module: "settings",
    label: "Settings",
    icon: "⚙️",
    actions: [
      { key: "view", label: "View Settings" },
      { key: "edit", label: "Edit Settings" },
    ],
  },
];

// Role presets with default permissions
const rolePresets = {
  super_admin: permissionMatrix.flatMap((m) =>
    m.actions.map((a) => `${m.module}:${a.key}`)
  ),
  admin: [
    "hotels:view",
    "hotels:add",
    "hotels:edit",
    "hotels:delete",
    "restaurants:view",
    "restaurants:add",
    "restaurants:edit",
    "restaurants:delete",
    "activities:view",
    "activities:add",
    "activities:edit",
    "activities:delete",
    "bookings:view",
    "bookings:add",
    "bookings:edit",
    "rooms:view",
    "rooms:add",
    "rooms:edit",
    "rooms:delete",
    "finance:view",
    "reports:view",
    "settings:view",
    "settings:edit",
  ],
  hotel: [
    "rooms:view",
    "rooms:add",
    "rooms:edit",
    "rooms:delete",
    "bookings:view",
    "bookings:add",
    "bookings:edit",
    "finance:view",
    "reports:view",
    "settings:view",
  ],
  restaurant: [
    "rooms:view",
    "rooms:add",
    "rooms:edit",
    "rooms:delete",
    "bookings:view",
    "bookings:add",
    "bookings:edit",
    "finance:view",
    "reports:view",
    "settings:view",
  ],
  activity: [
    "activities:view",
    "activities:edit",
    "bookings:view",
    "bookings:add",
    "bookings:edit",
    "finance:view",
    "reports:view",
    "settings:view",
  ],
};

const inputStyle = {
  background: "#ffffff",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  padding: "10px 14px",
  color: "#1e293b",
  width: "100%",
  fontSize: 14,
};

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontWeight: 500,
  color: "#475569",
  fontSize: 13,
};

export default function UserFormModal({ open, onClose, onSave, user = null }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
    permissions: [],
  });
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [useCustomPermissions, setUseCustomPermissions] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        ...user,
        password: "", // Don't show existing password
      });
      // Check if user has custom permissions (different from preset)
      const presetPerms = rolePresets[user.role] || [];
      const hasCustom =
        user.permissions?.length > 0 &&
        JSON.stringify([...user.permissions].sort()) !==
          JSON.stringify([...presetPerms].sort());
      setUseCustomPermissions(hasCustom);
    } else {
      setForm({
        name: "",
        email: "",
        password: "",
        role: "admin",
        permissions: rolePresets.admin,
      });
      setUseCustomPermissions(false);
    }
  }, [user, open]);

  if (!open) return null;

  const handleChange = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-update permissions when role changes (if not using custom)
      if (field === "role" && !useCustomPermissions) {
        updated.permissions = rolePresets[value] || [];
      }
      return updated;
    });
  };

  const togglePermission = (permission) => {
    setForm((prev) => {
      const perms = prev.permissions || [];
      if (perms.includes(permission)) {
        return { ...prev, permissions: perms.filter((p) => p !== permission) };
      }
      return { ...prev, permissions: [...perms, permission] };
    });
  };

  const toggleModuleAll = (module, checked) => {
    const modulePerms =
      permissionMatrix
        .find((m) => m.module === module)
        ?.actions.map((a) => `${module}:${a.key}`) || [];

    setForm((prev) => {
      let perms = prev.permissions || [];
      if (checked) {
        perms = [...new Set([...perms, ...modulePerms])];
      } else {
        perms = perms.filter((p) => !modulePerms.includes(p));
      }
      return { ...prev, permissions: perms };
    });
  };

  const selectAllPermissions = () => {
    const allPerms = permissionMatrix.flatMap((m) =>
      m.actions.map((a) => `${m.module}:${a.key}`)
    );
    setForm((prev) => ({ ...prev, permissions: allPerms }));
  };

  const clearAllPermissions = () => {
    setForm((prev) => ({ ...prev, permissions: [] }));
  };

  const applyRolePreset = () => {
    setForm((prev) => ({
      ...prev,
      permissions: rolePresets[prev.role] || [],
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email) {
      alert("Please fill in name and email");
      return;
    }
    if (!user && !form.password) {
      alert("Please enter a password for new user");
      return;
    }

    setLoading(true);
    try {
      const data = { ...form };
      if (!data.password) delete data.password; // Don't send empty password on edit
      await onSave(data);
      onClose();
    } catch (error) {
      console.error("Error saving user:", error);
    } finally {
      setLoading(false);
    }
  };

  const isModuleFullySelected = (module) => {
    const modulePerms =
      permissionMatrix
        .find((m) => m.module === module)
        ?.actions.map((a) => `${module}:${a.key}`) || [];
    return modulePerms.every((p) => (form.permissions || []).includes(p));
  };

  const isModulePartiallySelected = (module) => {
    const modulePerms =
      permissionMatrix
        .find((m) => m.module === module)
        ?.actions.map((a) => `${module}:${a.key}`) || [];
    const selected = modulePerms.filter((p) =>
      (form.permissions || []).includes(p)
    );
    return selected.length > 0 && selected.length < modulePerms.length;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000,
        overflow: "auto",
        padding: "20px 0",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="card"
        style={{
          width: "90%",
          maxWidth: 900,
          maxHeight: "90vh",
          overflow: "auto",
          background: "#ffffff",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            padding: "0 0 16px 0",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <h2 style={{ margin: 0, color: "#1e293b" }}>
            {user ? "Edit User" : "Create New User"}
          </h2>
          <button
            className="btn"
            onClick={onClose}
            style={{ background: "#475569" }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 20,
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: 12,
          }}
        >
          <button
            onClick={() => setActiveTab("basic")}
            style={{
              padding: "10px 20px",
              background: activeTab === "basic" ? "#2563eb" : "#f1f5f9",
              border: "none",
              borderRadius: 8,
              color: activeTab === "basic" ? "#fff" : "#64748b",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            👤 Basic Info
          </button>
          <button
            onClick={() => setActiveTab("permissions")}
            style={{
              padding: "10px 20px",
              background: activeTab === "permissions" ? "#2563eb" : "#f1f5f9",
              border: "none",
              borderRadius: 8,
              color: activeTab === "permissions" ? "#fff" : "#64748b",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            🔐 Permissions ({(form.permissions || []).length})
          </button>
        </div>

        {/* Basic Info Tab */}
        {activeTab === "basic" && (
          <div style={{ padding: 16, background: "#1e293b", borderRadius: 12 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 16,
              }}
            >
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input
                  style={inputStyle}
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label style={labelStyle}>Email Address *</label>
                <input
                  style={inputStyle}
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 16,
                marginTop: 16,
              }}
            >
              <div>
                <label style={labelStyle}>
                  Password {user ? "(leave empty to keep current)" : "*"}
                </label>
                <input
                  style={inputStyle}
                  type="password"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder={user ? "••••••••" : "Enter password"}
                />
              </div>
              <div>
                <label style={labelStyle}>Role *</label>
                <select
                  style={inputStyle}
                  value={form.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                >
                  <option value="super_admin">🔑 Super Admin</option>
                  <option value="admin">👔 Admin (Company)</option>
                  <option value="hotel">🏨 Hotel Manager</option>
                  <option value="restaurant">🍽️ Restaurant Manager</option>
                  <option value="activity">🎯 Activity Manager</option>
                </select>
              </div>
            </div>

            {/* Role Description */}
            <div
              style={{
                marginTop: 20,
                padding: 16,
                background: "#0f172a",
                borderRadius: 8,
                borderLeft: "4px solid #3b82f6",
              }}
            >
              <h4
                style={{ margin: "0 0 8px 0", color: "#60a5fa", fontSize: 14 }}
              >
                Role Description
              </h4>
              <p style={{ margin: 0, color: "#9ca3af", fontSize: 13 }}>
                {form.role === "super_admin" &&
                  "Full access to all system features. Can manage all users, hotels, restaurants, activities, and system settings."}
                {form.role === "admin" &&
                  "Company administrator. Can manage hotels, restaurants, and activities under their company."}
                {form.role === "hotel" &&
                  "Hotel manager. Can manage rooms, bookings, and view reports for their hotel."}
                {form.role === "restaurant" &&
                  "Restaurant manager. Can manage tables, reservations, and view reports for their restaurant."}
                {form.role === "activity" &&
                  "Activity manager. Can manage activities and bookings for their activities."}
              </p>
            </div>

            {/* Custom Permissions Toggle */}
            <div
              style={{
                marginTop: 20,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <input
                type="checkbox"
                id="customPerms"
                checked={useCustomPermissions}
                onChange={(e) => {
                  setUseCustomPermissions(e.target.checked);
                  if (!e.target.checked) {
                    applyRolePreset();
                  }
                }}
              />
              <label htmlFor="customPerms" style={{ color: "#e5e7eb" }}>
                Use custom permissions (override role defaults)
              </label>
            </div>
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === "permissions" && (
          <div>
            {/* Quick Actions */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 16,
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={selectAllPermissions}
                style={{
                  padding: "8px 16px",
                  background: "#22c55e",
                  border: "none",
                  borderRadius: 6,
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                ✅ Select All
              </button>
              <button
                onClick={clearAllPermissions}
                style={{
                  padding: "8px 16px",
                  background: "#ef4444",
                  border: "none",
                  borderRadius: 6,
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                ❌ Clear All
              </button>
              <button
                onClick={applyRolePreset}
                style={{
                  padding: "8px 16px",
                  background: "#8b5cf6",
                  border: "none",
                  borderRadius: 6,
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                🔄 Apply Role Preset
              </button>
              <span
                style={{
                  color: "#6b7280",
                  fontSize: 13,
                  alignSelf: "center",
                  marginLeft: "auto",
                }}
              >
                {(form.permissions || []).length} permissions selected
              </span>
            </div>

            {/* Permission Modules */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 16,
              }}
            >
              {permissionMatrix.map((module) => (
                <div
                  key={module.module}
                  style={{
                    background: "#1e293b",
                    borderRadius: 12,
                    padding: 16,
                    border: isModuleFullySelected(module.module)
                      ? "2px solid #22c55e"
                      : isModulePartiallySelected(module.module)
                      ? "2px solid #f59e0b"
                      : "2px solid transparent",
                  }}
                >
                  {/* Module Header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 12,
                      paddingBottom: 10,
                      borderBottom: "1px solid #334155",
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{module.icon}</span>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, color: "#f1f5f9", fontSize: 15 }}>
                        {module.label}
                      </h4>
                    </div>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isModuleFullySelected(module.module)}
                        onChange={(e) =>
                          toggleModuleAll(module.module, e.target.checked)
                        }
                        style={{ width: 18, height: 18 }}
                      />
                      <span style={{ color: "#9ca3af", fontSize: 12 }}>
                        All
                      </span>
                    </label>
                  </div>

                  {/* Module Actions */}
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {module.actions.map((action) => {
                      const perm = `${module.module}:${action.key}`;
                      const isSelected = (form.permissions || []).includes(
                        perm
                      );
                      return (
                        <label
                          key={perm}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "8px 12px",
                            background: isSelected ? "#22c55e20" : "#0f172a",
                            borderRadius: 6,
                            cursor: "pointer",
                            border: isSelected
                              ? "1px solid #22c55e40"
                              : "1px solid transparent",
                            transition: "all 0.15s",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePermission(perm)}
                            style={{ width: 16, height: 16 }}
                          />
                          <span
                            style={{
                              color: isSelected ? "#22c55e" : "#9ca3af",
                              fontSize: 13,
                            }}
                          >
                            {action.label}
                          </span>
                          {action.key === "delete" && (
                            <span
                              style={{
                                marginLeft: "auto",
                                fontSize: 10,
                                background: "#ef444430",
                                color: "#ef4444",
                                padding: "2px 6px",
                                borderRadius: 4,
                              }}
                            >
                              DANGER
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Permission Summary */}
            <div
              style={{
                marginTop: 20,
                padding: 16,
                background: "#1e293b",
                borderRadius: 12,
              }}
            >
              <h4
                style={{ margin: "0 0 12px 0", color: "#f1f5f9", fontSize: 14 }}
              >
                📋 Permission Summary
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(form.permissions || []).length === 0 ? (
                  <span style={{ color: "#6b7280", fontSize: 13 }}>
                    No permissions selected
                  </span>
                ) : (
                  (form.permissions || []).map((p) => (
                    <span
                      key={p}
                      style={{
                        padding: "4px 10px",
                        background: "#334155",
                        borderRadius: 20,
                        fontSize: 11,
                        color: "#94a3b8",
                      }}
                    >
                      {p}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 20,
            paddingTop: 16,
            borderTop: "1px solid #334155",
          }}
        >
          <button
            className="btn"
            onClick={onClose}
            style={{ background: "#475569" }}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading || !form.name || !form.email}
            style={{
              background: loading ? "#475569" : "#3b82f6",
              opacity: !form.name || !form.email ? 0.5 : 1,
            }}
          >
            {loading ? "Saving..." : user ? "Update User" : "Create User"}
          </button>
        </div>
      </div>
    </div>
  );
}
