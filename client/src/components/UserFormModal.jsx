import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useLanguage } from "../context/LanguageContext";

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
    m.actions.map((a) => `${m.module}:${a.key}`),
  ),
  // super_admin's staff — limited read-only access by default
  superadminuser: [
    "users:view",
    "hotels:view",
    "restaurants:view",
    "activities:view",
    "bookings:view",
    "finance:view",
    "reports:view",
  ],
  admin: [
    "users:view",
    "users:add",
    "users:edit",
    "users:delete",
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
  // admin's staff — limited by default
  adminuser: [
    "hotels:view",
    "restaurants:view",
    "activities:view",
    "bookings:view",
    "finance:view",
    "reports:view",
  ],
  hotel: [
    "users:view",
    "users:add",
    "users:edit",
    "users:delete",
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
  // hotel staff — only room & booking operations by default
  hoteluser: ["rooms:view", "bookings:view", "bookings:add", "bookings:edit"],
  restaurant: [
    "users:view",
    "users:add",
    "users:edit",
    "users:delete",
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
  // restaurant staff — only tables & reservations by default
  restaurantuser: [
    "rooms:view",
    "bookings:view",
    "bookings:add",
    "bookings:edit",
  ],
  activity: [
    "users:view",
    "users:add",
    "users:edit",
    "users:delete",
    "activities:view",
    "activities:edit",
    "bookings:view",
    "bookings:add",
    "bookings:edit",
    "finance:view",
    "reports:view",
    "settings:view",
  ],
  // activity staff — only activities & bookings by default
  activityuser: [
    "activities:view",
    "bookings:view",
    "bookings:add",
    "bookings:edit",
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

export default function UserFormModal({
  open,
  onClose,
  onSave,
  user = null,
  fixedRole = null,
  adminsList = [],
  allowedRoles = null, // if set, restricts which roles appear in the dropdown
}) {
  const currentUser = useSelector((s) => s.auth.user);
  const isSuperAdmin = currentUser?.role === "super_admin";

  // Determine available role options for the dropdown
  const roleOptions =
    allowedRoles ||
    (isSuperAdmin
      ? ["super_admin", "admin", "hotel", "restaurant", "activity"]
      : ["hotel", "restaurant", "activity"]);

  const defaultRole = fixedRole || roleOptions[0] || "hotel";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: defaultRole,
    permissions: [],
    adminId: isSuperAdmin ? "" : currentUser?._id || "",
  });
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [useCustomPermissions, setUseCustomPermissions] = useState(false);
  const { t, dir } = useLanguage();
  const logoInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setForm({
        ...user,
        password: "", // Don't show existing password
        role: fixedRole || user.role,
        adminId: user.adminId || "",
      });
      // Check if user has custom permissions (different from preset)
      const presetPerms = rolePresets[fixedRole || user.role] || [];
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
        role: defaultRole,
        permissions: rolePresets[defaultRole] || [],
        adminId: isSuperAdmin ? "" : currentUser?._id || "",
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
      m.actions.map((a) => `${m.module}:${a.key}`),
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

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const MAX = 300;
        let w = img.width,
          h = img.height;
        if (w > h) {
          if (w > MAX) {
            h = Math.round((h * MAX) / w);
            w = MAX;
          }
        } else {
          if (h > MAX) {
            w = Math.round((w * MAX) / h);
            h = MAX;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        handleChange("logo", canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email) {
      alert(t("fullName") + " & " + t("emailAddress") + " required");
      return;
    }
    if (!user && !form.password) {
      alert(t("password") + " required");
      return;
    }
    if (isSuperAdmin && adminsList.length > 0 && !form.adminId) {
      alert(t("adminRequired"));
      return;
    }

    setSaveError("");
    setLoading(true);
    try {
      const data = { ...form };
      if (!data.password) delete data.password; // Don't send empty password on edit

      // Remove empty relationship IDs so Mongoose doesn't throw CastError
      ["adminId", "companyId", "hotelId", "restaurantId", "activityId"].forEach(
        (field) => {
          if (data[field] === "") {
            delete data[field];
          }
        },
      );

      await onSave(data);
      onClose();
    } catch (error) {
      console.error("Error saving user:", error);
      alert(
        error?.data?.message ||
          error?.message ||
          "An error occurred while saving.",
      );
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
      (form.permissions || []).includes(p),
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
            {user ? t("editUser") : t("createNewUser")}
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
            👤 {t("basicInfoTab")}
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
            🔐 {t("permissionsTab")} ({(form.permissions || []).length})
          </button>
        </div>

        {/* Basic Info Tab */}
        {activeTab === "basic" && (
          <div
            style={{
              padding: 16,
              background: "#f8fafc",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 16,
              }}
            >
              <div>
                <label style={labelStyle}>{t("fullName")} *</label>
                <input
                  style={inputStyle}
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label style={labelStyle}>{t("emailAddress")} *</label>
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
                  {t("password")} {user ? t("leaveEmptyPassword") : "*"}
                </label>
                <input
                  style={inputStyle}
                  type="password"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder={user ? "••••••••" : t("password")}
                />
              </div>
              {fixedRole ? (
                <div>
                  <label style={labelStyle}>{t("role")}</label>
                  <div
                    style={{
                      ...inputStyle,
                      background: "#f1f5f9",
                      color: "#475569",
                      display: "flex",
                      alignItems: "center",
                      fontWeight: 600,
                    }}
                  >
                    {fixedRole === "super_admin" &&
                      "🔑 " + t("role_super_admin")}
                    {fixedRole === "superadminuser" && "👤 Super Admin User"}
                    {fixedRole === "admin" && "👔 " + t("role_admin")}
                    {fixedRole === "adminuser" && "👤 Admin User"}
                    {fixedRole === "hotel" && "🏨 " + t("role_hotel")}
                    {fixedRole === "hoteluser" && "👤 Hotel User"}
                    {fixedRole === "restaurant" && "🍽️ " + t("role_restaurant")}
                    {fixedRole === "restaurantuser" && "👤 Restaurant User"}
                    {fixedRole === "activity" && "🎯 " + t("role_activity")}
                    {fixedRole === "activityuser" && "👤 Activity User"}
                  </div>
                </div>
              ) : (
                <div>
                  <label style={labelStyle}>{t("role")} *</label>
                  <select
                    style={inputStyle}
                    value={form.role}
                    onChange={(e) => handleChange("role", e.target.value)}
                  >
                    {roleOptions.includes("super_admin") && (
                      <option value="super_admin">
                        🔑 {t("role_super_admin")}
                      </option>
                    )}
                    {roleOptions.includes("superadminuser") && (
                      <option value="superadminuser">
                        👤 Super Admin User
                      </option>
                    )}
                    {roleOptions.includes("admin") && (
                      <option value="admin">👔 {t("role_admin")}</option>
                    )}
                    {roleOptions.includes("adminuser") && (
                      <option value="adminuser">👤 Admin User</option>
                    )}
                    {roleOptions.includes("hotel") && (
                      <option value="hotel">
                        🏨 {t("role_hotel_manager")}
                      </option>
                    )}
                    {roleOptions.includes("hoteluser") && (
                      <option value="hoteluser">👤 Hotel User</option>
                    )}
                    {roleOptions.includes("restaurant") && (
                      <option value="restaurant">
                        🍽️ {t("role_restaurant_manager")}
                      </option>
                    )}
                    {roleOptions.includes("restaurantuser") && (
                      <option value="restaurantuser">👤 Restaurant User</option>
                    )}
                    {roleOptions.includes("activity") && (
                      <option value="activity">
                        🎯 {t("role_activity_manager")}
                      </option>
                    )}
                    {roleOptions.includes("activityuser") && (
                      <option value="activityuser">👤 Activity User</option>
                    )}
                  </select>
                </div>
              )}
            </div>

            {/* Admin Selector for hotel/restaurant/activity — only shown to super_admin */}
            {isSuperAdmin && adminsList.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <label style={{ ...labelStyle, color: "#f59e0b" }}>
                  🔗 {t("linkedAdmin")} *
                </label>
                <select
                  style={{
                    ...inputStyle,
                    borderColor: form.adminId ? "#22c55e" : "#ef4444",
                  }}
                  value={form.adminId}
                  onChange={(e) => handleChange("adminId", e.target.value)}
                >
                  <option value="">{t("selectAdmin")}</option>
                  {adminsList.map((admin) => (
                    <option key={admin._id} value={admin._id}>
                      {admin.name} ({admin.email})
                    </option>
                  ))}
                </select>
                {!form.adminId && (
                  <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
                    ⚠️ {t("adminRequired")}
                  </p>
                )}
              </div>
            )}

            {/* Logo URL for hotel/restaurant/activity */}
            {fixedRole &&
              fixedRole !== "super_admin" &&
              fixedRole !== "admin" && (
                <div style={{ marginTop: 16 }}>
                  <label style={labelStyle}>🖼️ {t("logoUpload")}</label>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    {form.logo && (
                      <img
                        src={form.logo}
                        alt="logo"
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid #e2e8f0",
                        }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      style={{
                        padding: "10px 18px",
                        background: "#f1f5f9",
                        border: "1px dashed #94a3b8",
                        borderRadius: 8,
                        color: "#475569",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      📂 {t("logoUpload")}
                    </button>
                    {form.logo && (
                      <span style={{ color: "#22c55e", fontSize: 12 }}>
                        {t("logoPreview")}
                      </span>
                    )}
                  </div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleLogoUpload}
                  />
                </div>
              )}

            {/* Role Description */}
            <div
              style={{
                marginTop: 20,
                padding: 16,
                background: "#eff6ff",
                borderRadius: 8,
                borderLeft: "4px solid #3b82f6",
              }}
            >
              <h4
                style={{ margin: "0 0 8px 0", color: "#2563eb", fontSize: 14 }}
              >
                {t("roleDescription")}
              </h4>
              <p style={{ margin: 0, color: "#475569", fontSize: 13 }}>
                {t("roleDesc_" + form.role)}
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
              <label htmlFor="customPerms" style={{ color: "#374151" }}>
                {t("useCustomPerms")}
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
                ✅ {t("selectAll")}
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
                ❌ {t("clearAll")}
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
                🔄 {t("applyRolePreset")}
              </button>
              <span
                style={{
                  color: "#6b7280",
                  fontSize: 13,
                  alignSelf: "center",
                  marginLeft: "auto",
                }}
              >
                {(form.permissions || []).length} {t("permissionsSelected")}
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
                    background: "#f8fafc",
                    borderRadius: 12,
                    padding: 16,
                    border: isModuleFullySelected(module.module)
                      ? "2px solid #22c55e"
                      : isModulePartiallySelected(module.module)
                        ? "2px solid #f59e0b"
                        : "2px solid #e2e8f0",
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
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{module.icon}</span>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, color: "#1e293b", fontSize: 15 }}>
                        {t(`module_${module.module}`)}
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
                      <span style={{ color: "#475569", fontSize: 12 }}>
                        {t("allLabel")}
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
                        perm,
                      );
                      return (
                        <label
                          key={perm}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "8px 12px",
                            background: isSelected ? "#dcfce7" : "#ffffff",
                            borderRadius: 6,
                            cursor: "pointer",
                            border: isSelected
                              ? "1px solid #86efac"
                              : "1px solid #e2e8f0",
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
                              color: isSelected ? "#16a34a" : "#4b5563",
                              fontSize: 13,
                            }}
                          >
                            {t(`action_${action.key}_${module.module}`)}
                          </span>
                          {action.key === "delete" && (
                            <span
                              style={{
                                marginLeft: "auto",
                                fontSize: 10,
                                background: "#fee2e2",
                                color: "#ef4444",
                                padding: "2px 6px",
                                borderRadius: 4,
                              }}
                            >
                              {t("dangerLabel")}
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
                background: "#f8fafc",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
              }}
            >
              <h4
                style={{ margin: "0 0 12px 0", color: "#1e293b", fontSize: 14 }}
              >
                📋 {t("permSummary")}
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(form.permissions || []).length === 0 ? (
                  <span style={{ color: "#9ca3af", fontSize: 13 }}>
                    {t("noPermsSelected")}
                  </span>
                ) : (
                  (form.permissions || []).map((p) => (
                    <span
                      key={p}
                      style={{
                        padding: "4px 10px",
                        background: "#e2e8f0",
                        borderRadius: 20,
                        fontSize: 11,
                        color: "#475569",
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

        {/* Error Banner */}
        {saveError && (
          <div
            style={{
              marginTop: 16,
              padding: "12px 16px",
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              borderRadius: 8,
              color: "#dc2626",
              fontSize: 13,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            ⚠️ {saveError}
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
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <button
            className="btn"
            onClick={onClose}
            style={{ background: "#475569" }}
          >
            {t("cancel")}
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
            {loading ? t("saving") : user ? t("updateUser") : t("createUser")}
          </button>
        </div>
      </div>
    </div>
  );
}
