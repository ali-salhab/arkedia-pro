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
    module: "restaurant",
    label: "Restaurant Details (Wizard)",
    icon: "🍽️",
    actions: [{ key: "details", label: "Manage Restaurant Main Details" }],
  },
  {
    module: "activity",
    label: "Activity Details (Wizard)",
    icon: "🎯",
    actions: [{ key: "details", label: "Manage Activity Main Details" }],
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
  restaurant: [
    "users",
    "rooms",
    "bookings",
    "finance",
    "reports",
    "settings",
    "restaurant",
  ],
  restaurantuser: [
    "users",
    "rooms",
    "bookings",
    "finance",
    "reports",
    "settings",
    "restaurant",
  ],
  activity: [
    "users",
    "activities",
    "bookings",
    "finance",
    "reports",
    "settings",
    "activity",
  ],
  activityuser: [
    "users",
    "activities",
    "bookings",
    "finance",
    "reports",
    "settings",
    "activity",
  ],
};

// Role presets with default permissions
const rolePresets = {
  super_admin: permissionMatrix.flatMap((m) =>
    m.actions.map((a) => `${m.module}:${a.key}`),
  ),
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
    "restaurant:details",
  ],
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
    "activity:details",
  ],
  activityuser: [
    "activities:view",
    "bookings:view",
    "bookings:add",
    "bookings:edit",
  ],
};

const inputClassName =
  "w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm outline-none transition-all placeholder:text-sm focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)]";

const labelClassName =
  "block mb-1.5 text-[13px] font-medium text-[var(--text-secondary)]";

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
  const backLabel = isRtl ? "رجوع" : "Back";
  const showLogoUpload = [
    "hotel",
    "hoteluser",
    "restaurant",
    "restaurantuser",
    "activity",
    "activityuser",
  ].includes(selectedRole);

  // When the selected role is hotel/restaurant/activity (owner account),
  // hide the permissions tab — they always get the full preset automatically.
  const hidePermissionsTab = ["hotel", "restaurant", "activity"].includes(
    selectedRole,
  );

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
  }, [user, open, fixedRole, defaultRole, isAdmin, currentUser]);

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
      className={`card ${
        pageMode ? "w-full shadow-none border border-[var(--border)]" : "w-[90%] max-w-[900px]"
      } bg-[var(--bg-surface)] p-6 md:p-8 rounded-2xl`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-8 pb-5 border-b border-[var(--border)]">
        <div>
          <h2 className={`font-bold text-[var(--text-primary)] m-0 ${pageMode ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
            {pageMode
              ? isRtl
                ? "المعلومات الأساسية"
                : "Basic Information"
              : user
                ? t("editUser")
                : t("createNewUser")}
          </h2>
          {pageMode && (
            <p className="m-0 mt-2 text-[var(--text-secondary)] text-sm">
              {isRtl
                ? "أدخل تفاصيل الحساب الأساسية ثم راجع إعدادات الصلاحيات."
                : "Enter the account basics, then review permission settings."}
            </p>
          )}
        </div>
        {!pageMode && (
          <button
            className="icon-btn text-[var(--text-secondary)] hover:text-red-500 transition-colors"
            onClick={onClose}
            aria-label={t("close")}
          >
            ✕
          </button>
        )}
      </div>

      {/* Segmented Tabs Control */}
      <div className="flex gap-2 p-1.5 rounded-xl bg-[var(--bg-raised)] w-max mb-8 border border-[var(--border)]/60 shadow-sm">
        <button
          onClick={() => setActiveTab("basic")}
          className={`px-5 py-2 rounded-lg font-medium text-[13px] transition-all ${
            activeTab === "basic"
              ? "bg-[var(--brand)] text-white shadow-md shadow-[var(--brand)]/20"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
          }`}
        >
          👤 {t("basicInfoTab")}
        </button>
        {!hidePermissionsTab && (
          <button
            onClick={() => setActiveTab("permissions")}
            className={`px-5 py-2 rounded-lg font-medium text-[13px] transition-all flex items-center gap-1.5 ${
              activeTab === "permissions"
                ? "bg-[var(--brand)] text-white shadow-md shadow-[var(--brand)]/20"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
            }`}
          >
            🔐 {t("permissionsTab")} 
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] bg-black/10 ${activeTab === "permissions" ? 'text-white/90' : 'text-[var(--text-muted)]'}`}>
              {(form.permissions || []).length}
            </span>
          </button>
        )}
      </div>

      {/* Basic Info Tab */}
      {activeTab === "basic" && (
        <div className="p-6 bg-[var(--bg-raised)]/50 rounded-2xl border border-[var(--border)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClassName}>{t("fullName")} *</label>
              <input
                className={inputClassName}
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className={labelClassName}>{t("emailAddress")} *</label>
              <input
                className={inputClassName}
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className={labelClassName}>
                {t("password")} {user ? t("leaveEmptyPassword") : "*"}
              </label>
              <input
                className={inputClassName}
                type="password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder={user ? "••••••••" : t("password")}
              />
            </div>
            {fixedRole ? (
              <div>
                <label className={labelClassName}>{t("role")}</label>
                <div className={`${inputClassName} !bg-[var(--bg-raised)] !text-[var(--text-secondary)] flex items-center font-semibold cursor-not-allowed`}>
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
                <label className={labelClassName}>{t("role")} *</label>
                <select
                  className={inputClassName}
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
            <div className="mt-6">
              <label className={`${labelClassName} !text-[var(--warning)]`}>
                🔗 {t("linkedAdmin")} *
              </label>
              {adminsList.length === 0 ? (
                <div className="w-full px-4 py-3 rounded-xl border border-[var(--danger)] bg-red-500/10 text-[var(--danger)] text-sm font-medium">
                  ⚠️ No admins found — create an admin account first before
                  adding hotel/restaurant/activity accounts.
                </div>
              ) : (
                <>
                  <select
                    className={`${inputClassName} ${
                      form.adminId ? "border-[var(--success)]" : "border-[var(--danger)]/70"
                    }`}
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
                    <p className="text-[var(--danger)] text-[11px] mt-1.5 font-medium ml-1">
                      ⚠️ {t("adminRequired")}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Logo upload for hotel/restaurant/activity */}
          {showLogoUpload && (
            <div className="mt-8">
              <label className={labelClassName}>🖼️ {t("logoUpload")}</label>
              <div
                className={`group relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
                  form.logo
                    ? "border-[var(--success)] bg-[var(--success)]/5"
                    : "border-[var(--border)] hover:border-[var(--brand)] hover:bg-[var(--brand)]/5"
                }`}
                onClick={() => logoInputRef.current?.click()}
              >
                {form.logo ? (
                  <div className="flex flex-col items-center gap-4">
                    <img
                      src={form.logo}
                      alt="logo preview"
                      className="w-28 h-28 rounded-xl object-contain bg-white shadow-sm ring-1 ring-black/5 p-2 transition-transform group-hover:scale-105"
                    />
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[var(--success)] text-[13px] font-medium flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        {isRtl ? "تم رفع الشعار بنجاح" : "Logo uploaded"}
                      </span>
                      <span className="text-[var(--brand)] text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">
                        {isRtl ? "انقر لتغيير الشعار" : "Click to change logo"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-14 h-14 rounded-full bg-[var(--bg-surface)] shadow-sm border border-[var(--border)] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                      📸
                    </div>
                    <div>
                      <p className="text-[var(--text-primary)] font-semibold text-[14px]">
                        {isRtl ? "انقر لرفع الشعار" : "Click to upload logo"}
                      </p>
                      <p className="text-[var(--text-muted)] text-[12px] mt-1">
                        {isRtl ? "الصيغ المدعومة: JPG, PNG أو GIF" : "Supported formats: JPG, PNG, GIF"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </div>
          )}

          {/* Role Description */}
          <div className="mt-8 p-5 bg-[var(--brand)]/10 rounded-xl border-l-4 border-[var(--brand)]">
            <h4 className="m-0 mb-2 text-[var(--brand)] text-sm font-semibold flex items-center gap-2">
              💡 {t("roleDescription")}
            </h4>
            <p className="m-0 text-[var(--text-secondary)] text-[13.5px] leading-relaxed">
              {t("roleDesc_" + form.role)}
            </p>
          </div>

          {/* Custom Permissions Toggle */}
          <div className="mt-6 flex items-center gap-3">
            <label className="relative flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={useCustomPermissions}
                onChange={(e) => {
                  setUseCustomPermissions(e.target.checked);
                  if (!e.target.checked) {
                    applyRolePreset();
                  }
                }}
              />
              <div className="w-11 h-6 bg-[var(--bg-surface)] border border-[var(--border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--brand)] peer-checked:border-[var(--brand)]"></div>
            </label>
            <span className="text-[var(--text-secondary)] text-sm font-medium cursor-pointer select-none" onClick={() => setUseCustomPermissions(!useCustomPermissions)}>
              {t("useCustomPerms")}
            </span>
          </div>
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === "permissions" && (
        <div className="animate-in fade-in duration-300">
          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 mb-6 bg-[var(--bg-raised)] p-3 rounded-xl border border-[var(--border)]">
            <button
              onClick={selectAllPermissions}
              className="px-4 py-2 bg-[var(--success)] text-white font-medium text-[12px] rounded-lg shadow-sm hover:scale-[1.02] transition-transform"
            >
              ✅ {t("selectAll")}
            </button>
            <button
              onClick={clearAllPermissions}
              className="px-4 py-2 bg-[var(--danger)] text-white font-medium text-[12px] rounded-lg shadow-sm hover:scale-[1.02] transition-transform"
            >
              ❌ {t("clearAll")}
            </button>
            <button
              onClick={applyRolePreset}
              className="px-4 py-2 bg-[var(--brand)] text-white font-medium text-[12px] rounded-lg shadow-sm hover:scale-[1.02] transition-transform"
            >
              🔄 {t("applyRolePreset")}
            </button>
            <span className="ms-auto mr-2 rtl:mr-0 rtl:ml-2 text-[var(--text-secondary)] text-[13px] font-semibold bg-[var(--bg-surface)] px-3 py-1.5 rounded-md border border-[var(--border)]">
              {(form.permissions || []).length} {t("permissionsSelected")}
            </span>
          </div>

          {/* Permission Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {visibleMatrix.map((module) => {
              const fullySelected = isModuleFullySelected(module.module);
              const partiallySelected = isModulePartiallySelected(module.module);
              return (
                <div
                  key={module.module}
                  className={`bg-[var(--bg-raised)] rounded-2xl p-5 border-2 transition-all duration-200 ${
                    fullySelected
                      ? "border-[var(--success)] shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                      : partiallySelected
                      ? "border-[var(--warning)]"
                      : "border-[var(--border)] hover:border-[var(--text-muted)]"
                  }`}
                >
                  {/* Module Header */}
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[var(--border)]/70">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] shadow-sm border border-[var(--border)] flex items-center justify-center text-xl">
                      {module.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="m-0 text-[var(--text-primary)] text-[15px] font-bold">
                        {t(`module_${module.module}`)}
                      </h4>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer bg-[var(--bg-surface)] px-2 py-1 rounded-md border border-[var(--border)] hover:bg-[var(--border)] transition-colors">
                      <input
                        type="checkbox"
                        checked={fullySelected}
                        onChange={(e) =>
                          toggleModuleAll(module.module, e.target.checked)
                        }
                        className="w-4 h-4 rounded text-[var(--brand)] focus:ring-[var(--brand)]"
                      />
                      <span className="text-[var(--text-secondary)] text-[11px] font-semibold uppercase tracking-wider">
                        {t("allLabel")}
                      </span>
                    </label>
                  </div>

                  {/* Module Actions */}
                  <div className="flex flex-col gap-2.5">
                    {module.actions.map((action) => {
                      const perm = `${module.module}:${action.key}`;
                      const isSelected = (form.permissions || []).includes(perm);
                      return (
                        <label
                          key={perm}
                          className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all duration-200 ${
                            isSelected
                              ? "bg-[var(--success)]/10 border-[var(--success)]/30"
                              : "bg-[var(--bg-surface)] border-transparent hover:border-[var(--border)] hover:bg-[var(--bg-surface)]/80"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border ${isSelected ? 'bg-[var(--success)] border-[var(--success)] text-white' : 'border-[var(--border)] bg-transparent'} flex items-center justify-center transition-colors`}>
                            {isSelected && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                          </div>
                          
                          {/* Hide the actual checkbox input but keep logic */}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePermission(perm)}
                            className="hidden"
                          />

                          <span
                            className={`font-medium text-[13px] ${
                              isSelected
                                ? "text-[var(--success)]"
                                : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                            }`}
                          >
                            {t(`action_${action.key}_${module.module}`)}
                          </span>

                          {action.key === "delete" && (
                            <span className="ms-auto rtl:ms-0 rtl:me-auto text-[10px] font-bold bg-red-500/10 text-red-500 px-2 py-0.5 rounded-md border border-red-500/20">
                              {t("dangerLabel")}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Permission Summary box below */}
          <div className="mt-8 p-5 bg-[var(--bg-raised)] rounded-2xl border border-[var(--border)]">
            <h4 className="m-0 mb-4 text-[var(--text-primary)] text-sm font-bold flex items-center gap-2">
              📋 {t("permSummary")}
            </h4>
            <div className="flex flex-wrap gap-2">
              {(form.permissions || []).length === 0 ? (
                <span className="text-[var(--text-muted)] text-[13px] italic bg-[var(--bg-surface)] px-3 py-1 rounded-md border border-[var(--border)]">
                  {t("noPermsSelected")}
                </span>
              ) : (
                (form.permissions || []).map((p) => (
                  <span
                    key={p}
                    className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[11px] font-medium tracking-wide shadow-sm"
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
        <div className="animate-in fade-in slide-in-from-bottom-2 mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm font-semibold flex items-center gap-3 shadow-sm">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          {saveError}
        </div>
      )}

      {!pageMode && (
        <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-[var(--border)]">
          <button className="btn btn-secondary !px-6 !py-2.5 !rounded-xl !font-semibold transition-all hover:bg-[var(--bg-surface)]" onClick={onClose}>
            {t("cancel")}
          </button>
          <button
            className="btn btn-primary !px-8 !py-2.5 !rounded-xl !font-semibold transition-all shadow-md shadow-[var(--brand)]/20 hover:shadow-lg hover:shadow-[var(--brand)]/30 hover:-translate-y-0.5 disabled:shadow-none disabled:hover:translate-y-0"
            onClick={handleSubmit}
            disabled={loading || !form.name || !form.email}
            style={{
              background: loading ? "var(--bg-raised)" : "var(--brand)",
              color: loading ? "var(--text-secondary)" : "#ffffff",
              opacity: !form.name || !form.email ? 0.6 : 1,
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {t("saving")}
              </span>
            ) : user ? (
              t("updateUser")
            ) : (
              t("createUser")
            )}
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
      <div className="space-y-6 animate-in fade-in duration-300" style={{ direction: isRtl ? "rtl" : "ltr" }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[var(--text-muted)] text-[13px] font-medium mb-1.5">
              <span>{t("dashboard")}</span>
              <span className="opacity-50">/</span>
              <span className="text-[var(--text-secondary)]">{selectedRoleLabel}</span>
            </div>
            <h1 className="m-0 text-[var(--text-primary)] text-4xl font-extrabold tracking-tight">
              {pageTitle}
            </h1>
          </div>
          <button className="btn btn-secondary !px-5 !py-2 !rounded-xl font-semibold shadow-sm hover:bg-[var(--bg-raised)] transition-all" onClick={onClose}>
            <span className="flex items-center gap-2">
              <svg className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              {backLabel}
            </span>
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] items-start pb-10">
          {innerContent}

          <div className="sticky top-6 flex flex-col gap-5">
            <div className="card p-6 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] shadow-sm">
              <h3 className="m-0 text-[var(--text-primary)] text-[20px] font-bold">
                {isRtl ? "معلومات الحساب" : "Summary"}
              </h3>
              <p className="mt-1.5 mb-6 text-[var(--text-secondary)] text-[13px]">
                {isRtl ? "ملخص سريع قبل الحفظ" : "Quick summary before saving."}
              </p>

              <div className="flex flex-col gap-4">
                <div>
                  <p className="m-0 mb-1.5 text-[var(--text-muted)] text-[11px] uppercase tracking-widest font-bold">
                    {t("role")}
                  </p>
                  <div className="bg-[var(--bg-raised)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-[14px] font-semibold flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--brand)]"></div>
                    {selectedRoleLabel}
                  </div>
                </div>

                <div>
                  <p className="m-0 mb-1.5 text-[var(--text-muted)] text-[11px] uppercase tracking-widest font-bold">
                    {t("permissions")}
                  </p>
                  <div className="bg-[var(--bg-raised)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-[14px] font-semibold flex items-center justify-between">
                    <span>{t("permissionsSelected")}</span>
                    <span className="bg-[var(--brand)]/10 text-[var(--brand)] px-2 py-0.5 rounded-md text-[12px] border border-[var(--brand)]/20">
                      {(form.permissions || []).length}
                    </span>
                  </div>
                </div>

                {needsLinkedAdmin && (
                  <div>
                    <p className="m-0 mb-1.5 text-[var(--text-muted)] text-[11px] uppercase tracking-widest font-bold">
                      {t("linkedAdmin")}
                    </p>
                    <div
                      className={`bg-[var(--bg-raised)] border rounded-xl px-4 py-3 text-[14px] font-semibold flex flex-col gap-1 ${
                        form.adminId ? "border-[var(--border)] text-[var(--text-primary)]" : "border-[var(--danger)] text-[var(--danger)]"
                      }`}
                    >
                      {selectedAdmin ? (
                        <>
                          <span className="flex items-center gap-2">
                            <span className="text-[16px]">🧑‍💼</span>
                            {selectedAdmin.name}
                          </span>
                          <span className="text-[var(--text-muted)] text-[11px] font-normal ms-6 rtl:ms-0 rtl:me-6">
                            {selectedAdmin.email}
                          </span>
                        </>
                      ) : (
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                          {t("adminRequired")}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card p-5 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] shadow-sm flex flex-col gap-3">
              <button
                onClick={handleSubmit}
                disabled={pagePrimaryDisabled}
                className="btn w-full !py-3 !rounded-xl !text-[15px] !font-bold transition-all flex justify-center items-center gap-2 group disabled:shadow-none"
                style={{
                  background: pagePrimaryDisabled ? "var(--bg-raised)" : "var(--brand)",
                  color: pagePrimaryDisabled ? "var(--text-muted)" : "#ffffff",
                  opacity: pagePrimaryDisabled ? 0.7 : 1,
                  boxShadow: pagePrimaryDisabled ? 'none' : '0 4px 14px -2px var(--brand)',
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    {t("saving")}
                  </>
                ) : (
                  <>
                    {user ? t("updateUser") : t("createUser")}
                    <svg className={`w-4 h-4 transition-transform ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </>
                )}
              </button>
              <button className="btn btn-secondary w-full !py-3 !rounded-xl !text-[14px] !font-semibold hover:bg-[var(--bg-raised)] transition-colors" onClick={onClose}>
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-[1000] overflow-y-auto p-4 md:p-8 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="my-auto w-full flex justify-center">
        {innerContent}
      </div>
    </div>
  );
}


