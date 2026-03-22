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
    module: "admins",
    label: "Admins Management",
    icon: "🧑‍💼",
    actions: [
      { key: "view", label: "View Admins" },
      { key: "add", label: "Add Admins" },
      { key: "edit", label: "Edit Admins" },
      { key: "delete", label: "Delete Admins" },
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
  {
    module: "hotel",
    label: "Hotel Details (Wizard)",
    icon: "🏩",
    actions: [{ key: "details", label: "Manage Hotel Main Details" }],
  },
  {
    module: "channel_manager",
    label: "Channel Manager",
    icon: "🔗",
    actions: [{ key: "view", label: "View Channel Manager" }],
  },
  {
    module: "channel_manager_travky",
    label: "Travky",
    icon: "🧭",
    actions: [{ key: "view", label: "View Travky" }],
  },
  {
    module: "channel_manager_external",
    label: "External",
    icon: "🌐",
    actions: [{ key: "view", label: "View External Channels" }],
  },
  {
    module: "guest_groups",
    label: "Guest Groups",
    icon: "👨‍👩‍👧‍👦",
    actions: [{ key: "view", label: "View Guest Groups" }],
  },
  {
    module: "meal_plans",
    label: "Meal Plans",
    icon: "🍽️",
    actions: [{ key: "view", label: "View Meal Plans" }],
  },
  {
    module: "periods",
    label: "Periods",
    icon: "🗓️",
    actions: [{ key: "view", label: "View Periods" }],
  },
  {
    module: "supplements",
    label: "Supplements",
    icon: "➕",
    actions: [{ key: "view", label: "View Supplements" }],
  },
  {
    module: "refund_policies",
    label: "Refund Policies",
    icon: "↩️",
    actions: [{ key: "view", label: "View Refund Policies" }],
  },
  {
    module: "channel_manager_rooms",
    label: "Channel Rooms",
    icon: "🛏️",
    actions: [{ key: "view", label: "View Channel Rooms" }],
  },
  {
    module: "rates",
    label: "Rates",
    icon: "💲",
    actions: [{ key: "view", label: "View Rates" }],
  },
  {
    module: "availability",
    label: "Availability",
    icon: "📦",
    actions: [{ key: "view", label: "View Availability" }],
  },
];

// Modules visible per role context (mirrors sidebar items)
const roleModules = {
  super_admin: [
    "users",
    "admins",
    "hotels",
    "restaurants",
    "activities",
    "bookings",
    "rooms",
    "finance",
    "reports",
    "settings",
  ],
  superadminuser: [
    "users",
    "admins",
    "hotels",
    "restaurants",
    "activities",
    "bookings",
    "rooms",
    "finance",
    "reports",
    "settings",
  ],
  admin: [
    "users",
    "hotels",
    "restaurants",
    "activities",
    "bookings",
    "finance",
    "reports",
    "settings",
  ],
  adminuser: [
    "users",
    "hotels",
    "restaurants",
    "activities",
    "bookings",
    "finance",
    "reports",
    "settings",
  ],
  hotel: [
    "users",
    "rooms",
    "bookings",
    "finance",
    "reports",
    "settings",
    "hotel",
    "channel_manager",
    "channel_manager_travky",
    "channel_manager_external",
    "guest_groups",
    "meal_plans",
    "periods",
    "supplements",
    "refund_policies",
    "channel_manager_rooms",
    "rates",
    "availability",
  ],
  hoteluser: [
    "users",
    "rooms",
    "bookings",
    "finance",
    "reports",
    "settings",
    "hotel",
    "channel_manager",
    "channel_manager_travky",
    "channel_manager_external",
    "guest_groups",
    "meal_plans",
    "periods",
    "supplements",
    "refund_policies",
    "channel_manager_rooms",
    "rates",
    "availability",
  ],
  restaurant: ["users", "rooms", "bookings", "finance", "reports", "settings"],
  restaurantuser: [
    "users",
    "rooms",
    "bookings",
    "finance",
    "reports",
    "settings",
  ],
  activity: [
    "users",
    "activities",
    "bookings",
    "finance",
    "reports",
    "settings",
  ],
  activityuser: [
    "users",
    "activities",
    "bookings",
    "finance",
    "reports",
    "settings",
  ],
};

// Role presets with default permissions
const rolePresets = {
  super_admin: permissionMatrix.flatMap((m) =>
    m.actions.map((a) => `${m.module}:${a.key}`),
  ),
  // super_admin's staff — limited read-only access by default
  superadminuser: [
    "users:view",
    "users:add",
    "users:edit",
    "users:delete",
    "admins:view",
    "admins:add",
    "admins:edit",
    "admins:delete",
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
    "rooms:view",
    "finance:view",
    "reports:view",
    "settings:view",
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
    "channel_manager:view",
    "channel_manager_travky:view",
    "channel_manager_external:view",
    "guest_groups:view",
    "meal_plans:view",
    "periods:view",
    "supplements:view",
    "refund_policies:view",
    "channel_manager_rooms:view",
    "rates:view",
    "availability:view",
    "hotel:details",
  ],
  // hotel staff — only room & booking operations by default
  hoteluser: [
    "rooms:view",
    "bookings:view",
    "bookings:add",
    "bookings:edit",
    "channel_manager:view",
    "channel_manager_travky:view",
    "channel_manager_external:view",
    "guest_groups:view",
    "meal_plans:view",
    "periods:view",
    "supplements:view",
    "refund_policies:view",
    "channel_manager_rooms:view",
    "rates:view",
    "availability:view",
    "hotel:details",
  ],
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
  background: "var(--bg-surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "10px 14px",
  color: "var(--text-primary)",
  width: "100%",
  fontSize: 14,
};

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontWeight: 500,
  color: "var(--text-secondary)",
  fontSize: 13,
};

// Roles that must be owned by an admin (set adminId)
const ADMIN_OWNED_ROLES = new Set([
  "hotel",
  "hoteluser",
  "restaurant",
  "restaurantuser",
  "activity",
  "activityuser",
]);

export default function UserFormModal({
  open,
  onClose,
  onSave,
  user = null,
  fixedRole = null,
  adminsList = [],
  allowedRoles = null, // if set, restricts which roles appear in the dropdown
  pageMode = false,
}) {
  const currentUser = useSelector((s) => s.auth.user);
  const isPlatformRole = ["super_admin", "superadminuser"].includes(
    currentUser?.role,
  );

  // Filter permission modules to only those relevant to this dashboard context
  const allowedModules =
    roleModules[currentUser?.role] ||
    Object.keys(
      Object.fromEntries(permissionMatrix.map((m) => [m.module, true])),
    );
  const visibleMatrix = permissionMatrix.filter((m) =>
    allowedModules.includes(m.module),
  );
  const isSuperAdmin = currentUser?.role === "super_admin";
  const isAdmin = currentUser?.role === "admin";

  // Determine available role options for the dropdown
  const roleOptions =
    allowedRoles ||
    (isSuperAdmin
      ? [
          "super_admin",
          "superadminuser",
          "admin",
          "hotel",
          "restaurant",
          "activity",
        ]
      : isPlatformRole
        ? ["superadminuser", "admin", "hotel", "restaurant", "activity"]
        : ["hotel", "restaurant", "activity"]);

  const defaultRole = fixedRole || roleOptions[0] || "hotel";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: defaultRole,
    permissions: [],
    adminId: isAdmin ? currentUser?._id || "" : "",
  });
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [useCustomPermissions, setUseCustomPermissions] = useState(false);
  const { t, dir } = useLanguage();
  const isRtl = dir === "rtl";
  const logoInputRef = useRef(null);

  const selectedRole = fixedRole || form.role;
  const roleLabels = {
    super_admin: t("role_super_admin"),
    superadminuser: isRtl ? "مستخدم مسؤول رئيسي" : "Super Admin User",
    admin: t("role_admin"),
    adminuser: isRtl ? "مستخدم مدير" : "Admin User",
    hotel: t("role_hotel"),
    hoteluser: isRtl ? "مستخدم فندق" : "Hotel User",
    restaurant: t("role_restaurant"),
    restaurantuser: isRtl ? "مستخدم مطعم" : "Restaurant User",
    activity: t("role_activity"),
    activityuser: isRtl ? "مستخدم نشاط" : "Activity User",
  };
  const selectedRoleLabel = roleLabels[selectedRole] || selectedRole;
  const pageTitle = user
    ? `${isRtl ? "تعديل" : "Edit"} ${selectedRoleLabel}`
    : `${isRtl ? "إضافة" : "New"} ${selectedRoleLabel}`;
  const pageSubtitle = isRtl
    ? "أدخل البيانات الأساسية ثم راجع الصلاحيات قبل الحفظ."
    : "Enter the essential details and review permissions before saving.";
  const backLabel = isRtl ? "رجوع" : "Back";
  const showLogoUpload = [
    "hotel",
    "hoteluser",
    "restaurant",
    "restaurantuser",
    "activity",
    "activityuser",
  ].includes(selectedRole);
  const selectedAdmin = adminsList.find((admin) => admin._id === form.adminId);

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
        // Admin auto-links to themselves; super_admin must pick via selector
        adminId: isAdmin ? currentUser?._id || "" : "",
      });
      setUseCustomPermissions(false);
    }
  }, [user, open]);

  if (!open && !pageMode) return null;

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
    const allPerms = visibleMatrix.flatMap((m) =>
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
    const needsAdmin = ADMIN_OWNED_ROLES.has(selectedRole);
    if (isPlatformRole && needsAdmin && !form.adminId) {
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

  const innerContent = (
    <div
      className="card"
      style={{
        width: pageMode ? "100%" : "90%",
        maxWidth: pageMode ? "none" : 900,
        maxHeight: pageMode ? "none" : "90vh",
        overflow: "auto",
        background: "var(--bg-surface)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
          padding: "0 0 16px 0",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: "var(--text-primary)",
              fontSize: pageMode ? 28 : 22,
              fontWeight: 700,
            }}
          >
            {pageMode
              ? isRtl
                ? "المعلومات الأساسية"
                : "Basic Information"
              : user
                ? t("editUser")
                : t("createNewUser")}
          </h2>
          {pageMode && (
            <p
              style={{
                margin: "6px 0 0 0",
                color: "var(--text-secondary)",
                fontSize: 14,
              }}
            >
              {isRtl
                ? "أدخل تفاصيل الحساب الأساسية ثم راجع إعدادات الصلاحيات."
                : "Enter the account basics, then review permission settings."}
            </p>
          )}
        </div>
        {!pageMode && (
          <button
            className="icon-btn"
            onClick={onClose}
            aria-label={t("close")}
          >
            ✕
          </button>
        )}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          borderBottom: "1px solid var(--border)",
          paddingBottom: 12,
        }}
      >
        <button
          onClick={() => setActiveTab("basic")}
          style={{
            padding: "10px 20px",
            background:
              activeTab === "basic" ? "var(--brand)" : "var(--bg-raised)",
            border: "none",
            borderRadius: 8,
            color: activeTab === "basic" ? "#fff" : "var(--text-secondary)",
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
            background:
              activeTab === "permissions" ? "var(--brand)" : "var(--bg-raised)",
            border: "none",
            borderRadius: 8,
            color:
              activeTab === "permissions" ? "#fff" : "var(--text-secondary)",
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
            background: "var(--bg-raised)",
            borderRadius: 12,
            border: "1px solid var(--border)",
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
                    background: "var(--bg-raised)",
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 600,
                  }}
                >
                  {fixedRole === "super_admin" && "🔑 " + t("role_super_admin")}
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
                    <option value="superadminuser">👤 Super Admin User</option>
                  )}
                  {roleOptions.includes("admin") && (
                    <option value="admin">👔 {t("role_admin")}</option>
                  )}
                  {roleOptions.includes("adminuser") && (
                    <option value="adminuser">👤 Admin User</option>
                  )}
                  {roleOptions.includes("hotel") && (
                    <option value="hotel">🏨 {t("role_hotel_manager")}</option>
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

          {/* Admin Selector — required for platform roles when creating hotel/restaurant/activity accounts */}
          {isPlatformRole && ADMIN_OWNED_ROLES.has(selectedRole) && (
            <div style={{ marginTop: 16 }}>
              <label style={{ ...labelStyle, color: "var(--warning)" }}>
                🔗 {t("linkedAdmin")} *
              </label>
              {adminsList.length === 0 ? (
                <div
                  style={{
                    ...inputStyle,
                    background: "rgba(220, 38, 38, 0.12)",
                    borderColor: "var(--danger)",
                    color: "var(--danger)",
                  }}
                >
                  ⚠️ No admins found — create an admin account first before
                  adding hotel/restaurant/activity accounts.
                </div>
              ) : (
                <>
                  <select
                    style={{
                      ...inputStyle,
                      borderColor: form.adminId
                        ? "var(--success)"
                        : "var(--danger)",
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
                    <p
                      style={{
                        color: "var(--danger)",
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      ⚠️ {t("adminRequired")}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Logo URL for hotel/restaurant/activity */}
          {showLogoUpload && (
            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>🖼️ {t("logoUpload")}</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {form.logo && (
                  <img
                    src={form.logo}
                    alt="logo"
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid var(--border)",
                    }}
                  />
                )}
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  style={{
                    padding: "10px 18px",
                    background: "var(--bg-raised)",
                    border: "1px dashed var(--text-muted)",
                    borderRadius: 8,
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  📂 {t("logoUpload")}
                </button>
                {form.logo && (
                  <span style={{ color: "var(--success)", fontSize: 12 }}>
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
              background: "var(--brand-muted)",
              borderRadius: 8,
              borderLeft: "4px solid var(--brand)",
            }}
          >
            <h4
              style={{
                margin: "0 0 8px 0",
                color: "var(--brand)",
                fontSize: 14,
              }}
            >
              {t("roleDescription")}
            </h4>
            <p
              style={{
                margin: 0,
                color: "var(--text-secondary)",
                fontSize: 13,
              }}
            >
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
            <label
              htmlFor="customPerms"
              style={{ color: "var(--text-secondary)" }}
            >
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
                background: "var(--success)",
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
                background: "var(--danger)",
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
                background: "var(--brand)",
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
                color: "var(--text-secondary)",
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
            {visibleMatrix.map((module) => (
              <div
                key={module.module}
                style={{
                  background: "var(--bg-raised)",
                  borderRadius: 12,
                  padding: 16,
                  border: isModuleFullySelected(module.module)
                    ? "2px solid var(--success)"
                    : isModulePartiallySelected(module.module)
                      ? "2px solid var(--warning)"
                      : "2px solid var(--border)",
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
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span style={{ fontSize: 24 }}>{module.icon}</span>
                  <div style={{ flex: 1 }}>
                    <h4
                      style={{
                        margin: 0,
                        color: "var(--text-primary)",
                        fontSize: 15,
                      }}
                    >
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
                    <span
                      style={{ color: "var(--text-secondary)", fontSize: 12 }}
                    >
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
                    const isSelected = (form.permissions || []).includes(perm);
                    return (
                      <label
                        key={perm}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "8px 12px",
                          background: isSelected
                            ? "rgba(34, 197, 94, 0.14)"
                            : "var(--bg-surface)",
                          borderRadius: 6,
                          cursor: "pointer",
                          border: isSelected
                            ? "1px solid rgba(34, 197, 94, 0.45)"
                            : "1px solid var(--border)",
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
                            color: isSelected
                              ? "var(--success)"
                              : "var(--text-secondary)",
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
                              background: "rgba(220, 38, 38, 0.12)",
                              color: "var(--danger)",
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
              background: "var(--bg-raised)",
              borderRadius: 12,
              border: "1px solid var(--border)",
            }}
          >
            <h4
              style={{
                margin: "0 0 12px 0",
                color: "var(--text-primary)",
                fontSize: 14,
              }}
            >
              📋 {t("permSummary")}
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(form.permissions || []).length === 0 ? (
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                  {t("noPermsSelected")}
                </span>
              ) : (
                (form.permissions || []).map((p) => (
                  <span
                    key={p}
                    style={{
                      padding: "4px 10px",
                      background: "#1e3a8a",
                      borderRadius: 20,
                      fontSize: 11,
                      color: "#93c5fd",
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
            background: "rgba(220, 38, 38, 0.12)",
            border: "1px solid rgba(220, 38, 38, 0.35)",
            borderRadius: 8,
            color: "var(--danger)",
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

      {!pageMode && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 20,
            paddingTop: 16,
            borderTop: "1px solid var(--border)",
          }}
        >
          <button className="btn btn-secondary" onClick={onClose}>
            {t("cancel")}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading || !form.name || !form.email}
            style={{
              background: loading ? "var(--bg-raised)" : "var(--brand)",
              color: loading ? "var(--text-secondary)" : "#ffffff",
              opacity: !form.name || !form.email ? 0.5 : 1,
            }}
          >
            {loading ? t("saving") : user ? t("updateUser") : t("createUser")}
          </button>
        </div>
      )}
    </div>
  );

  const needsLinkedAdmin =
    isPlatformRole && ADMIN_OWNED_ROLES.has(selectedRole);
  const pagePrimaryDisabled =
    loading ||
    !form.name ||
    !form.email ||
    (!user && !form.password) ||
    (needsLinkedAdmin && !form.adminId);

  if (pageMode) {
    return (
      <div className="space-y-6" style={{ direction: isRtl ? "rtl" : "ltr" }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              style={{
                margin: 0,
                color: "var(--text-muted)",
                fontSize: 13,
              }}
            >
              {t("dashboard")} / {selectedRoleLabel}
            </p>
            <h1
              style={{
                margin: "6px 0 0",
                color: "var(--text-primary)",
                fontSize: 40,
                lineHeight: 1.1,
                fontWeight: 700,
              }}
            >
              {pageTitle}
            </h1>
            <p
              style={{
                margin: "8px 0 0",
                color: "var(--text-secondary)",
                fontSize: 14,
              }}
            >
              {pageSubtitle}
            </p>
          </div>
          <button className="btn btn-secondary" onClick={onClose}>
            {backLabel}
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          {innerContent}

          <div className="space-y-4">
            <div className="card">
              <h3
                style={{
                  margin: 0,
                  color: "var(--text-primary)",
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                {isRtl ? "معلومات الحساب" : "Organization"}
              </h3>
              <p
                style={{
                  margin: "6px 0 16px",
                  color: "var(--text-secondary)",
                  fontSize: 13,
                }}
              >
                {isRtl ? "ملخص سريع قبل الحفظ" : "Quick summary before saving."}
              </p>

              <div style={{ display: "grid", gap: 10 }}>
                <div>
                  <p
                    style={{
                      margin: "0 0 6px",
                      color: "var(--text-muted)",
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {t("role")}
                  </p>
                  <div
                    style={{
                      background: "var(--bg-raised)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      padding: "10px 12px",
                      color: "var(--text-primary)",
                      fontWeight: 600,
                    }}
                  >
                    {selectedRoleLabel}
                  </div>
                </div>

                <div>
                  <p
                    style={{
                      margin: "0 0 6px",
                      color: "var(--text-muted)",
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {t("permissions")}
                  </p>
                  <div
                    style={{
                      background: "var(--bg-raised)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      padding: "10px 12px",
                      color: "var(--text-primary)",
                      fontWeight: 600,
                    }}
                  >
                    {(form.permissions || []).length} {t("permissionsSelected")}
                  </div>
                </div>

                {needsLinkedAdmin && (
                  <div>
                    <p
                      style={{
                        margin: "0 0 6px",
                        color: "var(--text-muted)",
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {t("linkedAdmin")}
                    </p>
                    <div
                      style={{
                        background: "var(--bg-raised)",
                        border: `1px solid ${
                          form.adminId ? "var(--border)" : "var(--danger)"
                        }`,
                        borderRadius: 10,
                        padding: "10px 12px",
                        color: form.adminId
                          ? "var(--text-primary)"
                          : "var(--danger)",
                        fontWeight: 600,
                      }}
                    >
                      {selectedAdmin
                        ? `${selectedAdmin.name} (${selectedAdmin.email})`
                        : t("adminRequired")}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card" style={{ display: "grid", gap: 10 }}>
              <button
                onClick={handleSubmit}
                disabled={pagePrimaryDisabled}
                className="btn"
                style={{
                  width: "100%",
                  background: pagePrimaryDisabled ? "#444" : "#111111",
                  color: "#ffffff",
                  opacity: pagePrimaryDisabled ? 0.65 : 1,
                }}
              >
                {loading
                  ? t("saving")
                  : user
                    ? t("updateUser")
                    : t("createUser")}
              </button>
              <button className="btn btn-secondary" onClick={onClose}>
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      {innerContent}
    </div>
  );
}
