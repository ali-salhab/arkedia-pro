import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useLanguage } from "../context/LanguageContext";
import {
  Users, UserCog, Building2, UtensilsCrossed, Target, CalendarDays, BedDouble,
  DollarSign, BarChart2, Settings, ClipboardList, Link2, Globe, UsersRound,
  Calendar, Plus, CornerDownLeft, Bed, Boxes, Check, X, RefreshCw, Key, Image as ImageIcon, Lightbulb, AlertCircle, Shield, User, Lock, Briefcase, Mail, Loader2, Camera
} from "lucide-react";

// All available permissions matrix
const permissionMatrix = [
  {
    module: "users",
    label: "Users Management",
    icon: <Users size={20} className="text-blue-500" />,
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
    icon: <UserCog size={20} className="text-indigo-500" />,
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
    icon: <Building2 size={20} className="text-emerald-500" />,
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
    icon: <UtensilsCrossed size={20} className="text-orange-500" />,
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
    icon: <Target size={20} className="text-yellow-500" />,
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
    icon: <CalendarDays size={20} className="text-teal-500" />,
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
    icon: <BedDouble size={20} className="text-cyan-500" />,
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
    icon: <DollarSign size={20} className="text-green-600" />,
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
    icon: <BarChart2 size={20} className="text-purple-500" />,
    actions: [{ key: "view", label: "View Reports" }],
  },
  {
    module: "settings",
    label: "Settings",
    icon: <Settings size={20} className="text-slate-500" />,
    actions: [
      { key: "view", label: "View Settings" },
      { key: "edit", label: "Edit Settings" },
    ],
  },
  {
    module: "hotel",
    label: "Hotel Details (Wizard)",
    icon: <Building2 size={20} className="text-emerald-500" />,
    actions: [{ key: "details", label: "Manage Hotel Main Details" }],
  },
  {
    module: "restaurant",
    label: "Restaurant Details (Wizard)",
    icon: <UtensilsCrossed size={20} className="text-orange-500" />,
    actions: [{ key: "details", label: "Manage Restaurant Main Details" }],
  },
  {
    module: "activity",
    label: "Activity Details (Wizard)",
    icon: <Target size={20} className="text-yellow-500" />,
    actions: [{ key: "details", label: "Manage Activity Main Details" }],
  },
  {
    module: "channel_manager",
    label: "Channel Manager",
    icon: <Link2 size={20} className="text-blue-500" />,
    actions: [{ key: "view", label: "View Channel Manager" }],
  },
  {
    module: "channel_manager_travky",
    label: "Travky",
    icon: <Globe size={20} className="text-indigo-500" />,
    actions: [{ key: "view", label: "View Travky" }],
  },
  {
    module: "channel_manager_external",
    label: "External",
    icon: <Globe size={20} className="text-slate-500" />,
    actions: [{ key: "view", label: "View External Channels" }],
  },
  {
    module: "guest_groups",
    label: "Guest Groups",
    icon: <UsersRound size={20} className="text-rose-500" />,
    actions: [{ key: "view", label: "View Guest Groups" }],
  },
  {
    module: "meal_plans",
    label: "Meal Plans",
    icon: <UtensilsCrossed size={20} className="text-orange-500" />,
    actions: [{ key: "view", label: "View Meal Plans" }],
  },
  {
    module: "periods",
    label: "Periods",
    icon: <Calendar size={20} className="text-teal-500" />,
    actions: [{ key: "view", label: "View Periods" }],
  },
  {
    module: "supplements",
    label: "Supplements",
    icon: <Plus size={20} className="text-cyan-500" />,
    actions: [{ key: "view", label: "View Supplements" }],
  },
  {
    module: "refund_policies",
    label: "Refund Policies",
    icon: <CornerDownLeft size={20} className="text-red-500" />,
    actions: [{ key: "view", label: "View Refund Policies" }],
  },
  {
    module: "channel_manager_rooms",
    label: "Channel Rooms",
    icon: <Bed size={20} className="text-emerald-500" />,
    actions: [{ key: "view", label: "View Channel Rooms" }],
  },
  {
    module: "rates",
    label: "Rates",
    icon: <DollarSign size={20} className="text-green-600" />,
    actions: [{ key: "view", label: "View Rates" }],
  },
  {
    module: "availability",
    label: "Availability",
    icon: <Boxes size={20} className="text-indigo-500" />,
    actions: [{ key: "view", label: "View Availability" }],
  },
];

const roleModules = {
  super_admin: ["users", "admins", "hotels", "restaurants", "activities", "bookings", "rooms", "finance", "reports", "settings"],
  superadminuser: ["users", "admins", "hotels", "restaurants", "activities", "bookings", "rooms", "finance", "reports", "settings"],
  admin: ["users", "hotels", "restaurants", "activities", "bookings", "finance", "reports", "settings"],
  adminuser: ["users", "hotels", "restaurants", "activities", "bookings", "finance", "reports", "settings"],
  hotel: ["users", "rooms", "bookings", "finance", "reports", "settings", "hotel", "channel_manager", "channel_manager_travky", "channel_manager_external", "guest_groups", "meal_plans", "periods", "supplements", "refund_policies", "channel_manager_rooms", "rates", "availability"],
  hoteluser: ["users", "rooms", "bookings", "finance", "reports", "settings", "hotel", "channel_manager", "channel_manager_travky", "channel_manager_external", "guest_groups", "meal_plans", "periods", "supplements", "refund_policies", "channel_manager_rooms", "rates", "availability"],
  restaurant: ["users", "rooms", "bookings", "finance", "reports", "settings", "restaurant"],
  restaurantuser: ["users", "rooms", "bookings", "finance", "reports", "settings", "restaurant"],
  activity: ["users", "activities", "bookings", "finance", "reports", "settings", "activity"],
  activityuser: ["users", "activities", "bookings", "finance", "reports", "settings", "activity"],
};

const rolePresets = {
  super_admin: permissionMatrix.flatMap((m) => m.actions.map((a) => `${m.module}:${a.key}`)),
  superadminuser: ["users:view", "users:add", "users:edit", "users:delete", "admins:view", "admins:add", "admins:edit", "admins:delete", "hotels:view", "hotels:add", "hotels:edit", "hotels:delete", "restaurants:view", "restaurants:add", "restaurants:edit", "restaurants:delete", "activities:view", "activities:add", "activities:edit", "activities:delete", "bookings:view", "rooms:view", "finance:view", "reports:view", "settings:view"],
  admin: ["users:view", "users:add", "users:edit", "users:delete", "hotels:view", "hotels:add", "hotels:edit", "hotels:delete", "restaurants:view", "restaurants:add", "restaurants:edit", "restaurants:delete", "activities:view", "activities:add", "activities:edit", "activities:delete", "bookings:view", "bookings:add", "bookings:edit", "rooms:view", "rooms:add", "rooms:edit", "rooms:delete", "finance:view", "reports:view", "settings:view", "settings:edit"],
  adminuser: ["hotels:view", "restaurants:view", "activities:view", "bookings:view", "finance:view", "reports:view"],
  hotel: ["users:view", "users:add", "users:edit", "users:delete", "rooms:view", "rooms:add", "rooms:edit", "rooms:delete", "bookings:view", "bookings:add", "bookings:edit", "finance:view", "reports:view", "settings:view", "channel_manager:view", "channel_manager_travky:view", "channel_manager_external:view", "guest_groups:view", "meal_plans:view", "periods:view", "supplements:view", "refund_policies:view", "channel_manager_rooms:view", "rates:view", "availability:view", "hotel:details"],
  hoteluser: ["rooms:view", "bookings:view", "bookings:add", "bookings:edit", "channel_manager:view", "channel_manager_travky:view", "channel_manager_external:view", "guest_groups:view", "meal_plans:view", "periods:view", "supplements:view", "refund_policies:view", "channel_manager_rooms:view", "rates:view", "availability:view", "hotel:details"],
  restaurant: ["users:view", "users:add", "users:edit", "users:delete", "rooms:view", "rooms:add", "rooms:edit", "rooms:delete", "bookings:view", "bookings:add", "bookings:edit", "finance:view", "reports:view", "settings:view", "restaurant:details"],
  restaurantuser: ["rooms:view", "bookings:view", "bookings:add", "bookings:edit"],
  activity: ["users:view", "users:add", "users:edit", "users:delete", "activities:view", "activities:edit", "bookings:view", "bookings:add", "bookings:edit", "finance:view", "reports:view", "settings:view", "activity:details"],
  activityuser: ["activities:view", "bookings:view", "bookings:add", "bookings:edit"],
};

const inputClassName = "w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400";
const labelClassName = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2";

const ADMIN_OWNED_ROLES = new Set(["hotel", "hoteluser", "restaurant", "restaurantuser", "activity", "activityuser"]);

export default function UserFormModal({
  open, onClose, onSave, user = null, fixedRole = null, adminsList = [], allowedRoles = null, pageMode = false,
}) {
  const currentUser = useSelector((s) => s.auth.user);
  const isPlatformRole = ["super_admin", "superadminuser"].includes(currentUser?.role);
  const allowedModules = roleModules[currentUser?.role] || Object.keys(Object.fromEntries(permissionMatrix.map((m) => [m.module, true])));
  const visibleMatrix = permissionMatrix.filter((m) => allowedModules.includes(m.module));
  const isSuperAdmin = currentUser?.role === "super_admin";
  const isAdmin = currentUser?.role === "admin";
  const roleOptions = allowedRoles || (isSuperAdmin ? ["super_admin", "superadminuser", "admin", "hotel", "restaurant", "activity"] : isPlatformRole ? ["superadminuser", "admin", "hotel", "restaurant", "activity"] : ["hotel", "restaurant", "activity"]);
  const defaultRole = fixedRole || roleOptions[0] || "hotel";

  const [form, setForm] = useState({
    name: "", email: "", password: "", role: defaultRole, permissions: [], adminId: isAdmin ? currentUser?._id || "" : "",
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
  const pageTitle = user ? `${isRtl ? "تعديل" : "Edit"} ${selectedRoleLabel}` : `${isRtl ? "إضافة" : "New"} ${selectedRoleLabel}`;
  const backLabel = isRtl ? "رجوع" : "Back";
  const showLogoUpload = ["hotel", "hoteluser", "restaurant", "restaurantuser", "activity", "activityuser"].includes(selectedRole);
  const hidePermissionsTab = ["hotel", "restaurant", "activity"].includes(selectedRole);

  const selectedAdmin = adminsList.find((admin) => admin._id === form.adminId);

  useEffect(() => {
    if (user) {
      setForm({ ...user, password: "", role: fixedRole || user.role, adminId: user.adminId || "" });
      const presetPerms = rolePresets[fixedRole || user.role] || [];
      const hasCustom = user.permissions?.length > 0 && JSON.stringify([...user.permissions].sort()) !== JSON.stringify([...presetPerms].sort());
      setUseCustomPermissions(hasCustom);
    } else {
      setForm({ name: "", email: "", password: "", role: defaultRole, permissions: rolePresets[defaultRole] || [], adminId: isAdmin ? currentUser?._id || "" : "" });
      setUseCustomPermissions(false);
    }
  }, [user, open, fixedRole, defaultRole, isAdmin, currentUser]);

  if (!open && !pageMode) return null;

  const handleChange = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "role" && !useCustomPermissions) updated.permissions = rolePresets[value] || [];
      return updated;
    });
  };

  const togglePermission = (permission) => setForm((prev) => {
    const perms = prev.permissions || [];
    if (perms.includes(permission)) return { ...prev, permissions: perms.filter((p) => p !== permission) };
    return { ...prev, permissions: [...perms, permission] };
  });

  const toggleModuleAll = (module, checked) => {
    const modulePerms = permissionMatrix.find((m) => m.module === module)?.actions.map((a) => `${module}:${a.key}`) || [];
    setForm((prev) => {
      let perms = prev.permissions || [];
      if (checked) perms = [...new Set([...perms, ...modulePerms])];
      else perms = perms.filter((p) => !modulePerms.includes(p));
      return { ...prev, permissions: perms };
    });
  };

  const selectAllPermissions = () => setForm((prev) => ({ ...prev, permissions: visibleMatrix.flatMap((m) => m.actions.map((a) => `${m.module}:${a.key}`)) }));
  const clearAllPermissions = () => setForm((prev) => ({ ...prev, permissions: [] }));
  const applyRolePreset = () => setForm((prev) => ({ ...prev, permissions: rolePresets[prev.role] || [] }));

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const MAX = 300; let w = img.width, h = img.height;
        if (w > h) { if (w > MAX) { h = Math.round((h * MAX) / w); w = MAX; } } 
        else { if (h > MAX) { w = Math.round((w * MAX) / h); h = MAX; } }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        handleChange("logo", canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email) return alert(t("fullName") + " & " + t("emailAddress") + " required");
    if (!user && !form.password) return alert(t("password") + " required");
    const needsAdmin = ADMIN_OWNED_ROLES.has(selectedRole);
    if (isPlatformRole && needsAdmin && !form.adminId) return alert(t("adminRequired"));

    setSaveError(""); setLoading(true);
    try {
      const data = { ...form };
      if (!data.password) delete data.password;
      ["adminId", "companyId", "hotelId", "restaurantId", "activityId"].forEach((field) => { if (data[field] === "") delete data[field]; });
      await onSave(data);
      onClose();
    } catch (error) {
      console.error("Error saving user:", error);
      alert(error?.data?.message || error?.message || "An error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  const isModuleFullySelected = (module) => {
    const modulePerms = permissionMatrix.find((m) => m.module === module)?.actions.map((a) => `${module}:${a.key}`) || [];
    return modulePerms.every((p) => (form.permissions || []).includes(p));
  };
  const isModulePartiallySelected = (module) => {
    const modulePerms = permissionMatrix.find((m) => m.module === module)?.actions.map((a) => `${module}:${a.key}`) || [];
    const selected = modulePerms.filter((p) => (form.permissions || []).includes(p));
    return selected.length > 0 && selected.length < modulePerms.length;
  };

  const innerContent = (
    <div className={`card ${pageMode ? "w-full shadow-none border border-[var(--border)]" : "w-[90%] max-w-[900px]"} bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl p-6 md:p-8 rounded-3xl shadow-2xl`}>
      <div className="flex justify-between items-start mb-8 pb-5 border-b border-slate-200/50 dark:border-slate-800/50">
        <div>
          <h2 className={`font-extrabold text-slate-900 dark:text-white m-0 ${pageMode ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
            {pageMode ? (isRtl ? "المعلومات الأساسية" : "Basic Information") : user ? t("editUser") : t("createNewUser")}
          </h2>
          {pageMode && (
            <p className="m-0 mt-2 text-slate-500 dark:text-slate-400 text-sm">
              {isRtl ? "أدخل تفاصيل الحساب الأساسية ثم راجع إعدادات الصلاحيات." : "Enter the account basics, then review permission settings."}
            </p>
          )}
        </div>
        {!pageMode && (
          <button className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-red-100 hover:text-red-500 transition-colors" onClick={onClose} aria-label={t("close")}>
            <X size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>

      <div className="flex gap-2 p-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 w-max mb-8 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-xl shadow-sm">
        <button
          onClick={() => setActiveTab("basic")}
          className={`px-5 py-2.5 rounded-lg font-semibold text-[13px] transition-all flex items-center gap-2 ${activeTab === "basic" ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50"}`}
        >
          <User size={16} strokeWidth={2.5} /> {t("basicInfoTab")}
        </button>
        {!hidePermissionsTab && (
          <button
            onClick={() => setActiveTab("permissions")}
            className={`px-5 py-2.5 rounded-lg font-semibold text-[13px] transition-all flex items-center gap-2 ${activeTab === "permissions" ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50"}`}
          >
            <Shield size={16} strokeWidth={2.5} /> {t("permissionsTab")} 
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] bg-black/10 ${activeTab === "permissions" ? 'text-white/90' : 'text-slate-500'}`}>
              {(form.permissions || []).length}
            </span>
          </button>
        )}
      </div>

      {activeTab === "basic" && (
        <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border border-slate-200/60 dark:border-slate-700/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClassName}>{t("fullName")} *</label>
              <div className="relative">
                <span className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`}>
                  <User size={16} />
                </span>
                <input className={`${inputClassName} ${isRtl ? 'pr-11' : 'pl-11'}`} value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="John Doe" />
              </div>
            </div>
            <div>
              <label className={labelClassName}>{t("emailAddress")} *</label>
              <div className="relative">
                <span className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`}>
                  <Mail size={16} />
                </span>
                <input className={`${inputClassName} ${isRtl ? 'pr-11' : 'pl-11'}`} type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="john@example.com" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className={labelClassName}>{t("password")} {user ? t("leaveEmptyPassword") : "*"}</label>
              <div className="relative">
                <span className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`}>
                  <Lock size={16} />
                </span>
                <input className={`${inputClassName} ${isRtl ? 'pr-11' : 'pl-11'}`} type="password" value={form.password} onChange={(e) => handleChange("password", e.target.value)} placeholder={user ? "••••••••" : t("password")} />
              </div>
            </div>
            {fixedRole ? (
              <div>
                <label className={labelClassName}>{t("role")}</label>
                <div className={`${inputClassName} !bg-slate-100/80 dark:!bg-slate-800/80 !text-slate-500 dark:!text-slate-400 flex items-center font-bold cursor-not-allowed gap-2`}>
                  {fixedRole === "super_admin" && <><Key size={16} className="text-purple-500" /> {t("role_super_admin")}</>}
                  {fixedRole === "superadminuser" && <><User size={16} className="text-purple-400" /> Super Admin User</>}
                  {fixedRole === "admin" && <><Briefcase size={16} className="text-blue-500" /> {t("role_admin")}</>}
                  {fixedRole === "adminuser" && <><User size={16} className="text-blue-400" /> Admin User</>}
                  {fixedRole === "hotel" && <><Building2 size={16} className="text-emerald-500" /> {t("role_hotel")}</>}
                  {fixedRole === "hoteluser" && <><User size={16} className="text-emerald-400" /> Hotel User</>}
                  {fixedRole === "restaurant" && <><UtensilsCrossed size={16} className="text-orange-500" /> {t("role_restaurant")}</>}
                  {fixedRole === "restaurantuser" && <><User size={16} className="text-orange-400" /> Restaurant User</>}
                  {fixedRole === "activity" && <><Target size={16} className="text-yellow-500" /> {t("role_activity")}</>}
                  {fixedRole === "activityuser" && <><User size={16} className="text-yellow-400" /> Activity User</>}
                </div>
              </div>
            ) : (
              <div>
                <label className={labelClassName}>{t("role")} *</label>
                <select className={inputClassName} value={form.role} onChange={(e) => handleChange("role", e.target.value)}>
                  {roleOptions.includes("super_admin") && <option value="super_admin">{t("role_super_admin")}</option>}
                  {roleOptions.includes("superadminuser") && <option value="superadminuser">Super Admin User</option>}
                  {roleOptions.includes("admin") && <option value="admin">{t("role_admin")}</option>}
                  {roleOptions.includes("adminuser") && <option value="adminuser">Admin User</option>}
                  {roleOptions.includes("hotel") && <option value="hotel">{t("role_hotel_manager")}</option>}
                  {roleOptions.includes("hoteluser") && <option value="hoteluser">Hotel User</option>}
                  {roleOptions.includes("restaurant") && <option value="restaurant">{t("role_restaurant_manager")}</option>}
                  {roleOptions.includes("restaurantuser") && <option value="restaurantuser">Restaurant User</option>}
                  {roleOptions.includes("activity") && <option value="activity">{t("role_activity_manager")}</option>}
                  {roleOptions.includes("activityuser") && <option value="activityuser">Activity User</option>}
                </select>
              </div>
            )}
          </div>

          {isPlatformRole && ADMIN_OWNED_ROLES.has(selectedRole) && (
            <div className="mt-8 p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
              <label className={`${labelClassName} text-blue-800 dark:text-blue-300 flex items-center gap-2`}>
                <Link2 size={16} /> {t("linkedAdmin")} *
              </label>
              {adminsList.length === 0 ? (
                <div className="w-full px-5 py-4 rounded-xl border border-red-200 bg-red-50 text-red-600 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400 text-sm font-semibold flex items-center gap-3">
                  <AlertCircle size={18} /> No admins found — create an admin account first.
                </div>
              ) : (
                <>
                  <select className={`${inputClassName} ${form.adminId ? "border-emerald-500 dark:border-emerald-600 ring-4 ring-emerald-500/10" : "border-red-300 dark:border-red-700/70"}`} value={form.adminId} onChange={(e) => handleChange("adminId", e.target.value)}>
                    <option value="">{t("selectAdmin")}</option>
                    {adminsList.map((admin) => (
                      <option key={admin._id} value={admin._id}>{admin.name} ({admin.email})</option>
                    ))}
                  </select>
                  {!form.adminId && <p className="text-red-500 text-[12px] mt-2 font-semibold flex items-center gap-1.5"><AlertCircle size={14} /> {t("adminRequired")}</p>}
                </>
              )}
            </div>
          )}

          {showLogoUpload && (
            <div className="mt-8">
              <label className={labelClassName}>
                <span className="flex items-center gap-2 mb-2"><ImageIcon size={16} className="text-slate-500" /> {t("logoUpload")}</span>
              </label>
              <div className={`group relative flex flex-col items-center justify-center p-10 rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden backdrop-blur-sm ${form.logo ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-600/50" : "border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"}`} onClick={() => logoInputRef.current?.click()}>
                {form.logo ? (
                  <div className="flex flex-col items-center gap-5">
                    <img src={form.logo} alt="preview" className="w-32 h-32 rounded-2xl object-contain bg-white shadow-lg ring-1 ring-slate-200 dark:ring-slate-800 p-2 transition-transform duration-300 group-hover:scale-110" />
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center gap-2"><Check size={16} strokeWidth={3} /> {isRtl ? "تم رفع الشعار بنجاح" : "Logo uploaded"}</span>
                      <span className="text-blue-600 dark:text-blue-400 text-[13px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5"><RefreshCw size={14} /> {isRtl ? "انقر لتغيير الشعار" : "Click to change logo"}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-300">
                      <Camera size={28} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-white font-bold text-[15px]">{isRtl ? "انقر لرفع الشعار" : "Click to upload logo"}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-[13px] mt-1.5 font-medium">{isRtl ? "الصيغ المدعومة: JPG, PNG أو GIF" : "Supported formats: JPG, PNG, GIF"}</p>
                    </div>
                  </div>
                )}
              </div>
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>
          )}

          <div className="mt-8 p-6 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800/50">
            <h4 className="m-0 mb-3 text-amber-700 dark:text-amber-400 text-[15px] font-bold flex items-center gap-2"><Lightbulb size={18} strokeWidth={2.5}/> {t("roleDescription")}</h4>
            <p className="m-0 text-amber-900/80 dark:text-amber-200/70 text-sm leading-relaxed font-medium">{t("roleDesc_" + form.role)}</p>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <label className="relative flex items-center cursor-pointer">
              <input type="checkbox" className="peer sr-only" checked={useCustomPermissions} onChange={(e) => { setUseCustomPermissions(e.target.checked); if (!e.target.checked) applyRolePreset(); }} />
              <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
            </label>
            <span className="text-slate-600 dark:text-slate-300 text-[14px] font-bold cursor-pointer select-none" onClick={() => setUseCustomPermissions(!useCustomPermissions)}>{t("useCustomPerms")}</span>
          </div>
        </div>
      )}

      {activeTab === "permissions" && (
        <div className="animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center gap-3 mb-8 bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/50">
            <button onClick={selectAllPermissions} className="px-5 py-2.5 bg-emerald-500 text-white font-bold text-[13px] rounded-xl shadow-md hover:-translate-y-0.5 transition-transform flex items-center gap-2"><Check size={16} strokeWidth={2.5}/> {t("selectAll")}</button>
            <button onClick={clearAllPermissions} className="px-5 py-2.5 bg-red-500 text-white font-bold text-[13px] rounded-xl shadow-md hover:-translate-y-0.5 transition-transform flex items-center gap-2"><X size={16} strokeWidth={2.5}/> {t("clearAll")}</button>
            <button onClick={applyRolePreset} className="px-5 py-2.5 bg-blue-600 text-white font-bold text-[13px] rounded-xl shadow-md hover:-translate-y-0.5 transition-transform flex items-center gap-2"><RefreshCw size={16} strokeWidth={2.5}/> {t("applyRolePreset")}</button>
            <span className="ms-auto mr-2 rtl:mr-0 rtl:ml-2 text-slate-700 dark:text-slate-300 text-sm font-extrabold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl shadow-sm">{(form.permissions || []).length} {t("permissionsSelected")}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleMatrix.map((module) => {
              const fullySelected = isModuleFullySelected(module.module);
              const partiallySelected = isModulePartiallySelected(module.module);
              return (
                <div key={module.module} className={`bg-white/40 dark:bg-slate-900/40 rounded-3xl p-6 border-2 transition-all duration-300 backdrop-blur-sm ${fullySelected ? "border-emerald-400 shadow-[0_4px_20px_rgba(52,211,153,0.15)] ring-4 ring-emerald-400/10" : partiallySelected ? "border-amber-400" : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"}`}>
                  <div className="flex items-center gap-4 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                      {module.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="m-0 text-slate-900 dark:text-white text-[16px] font-extrabold">{t(`module_${module.module}`)}</h4>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <input type="checkbox" checked={fullySelected} onChange={(e) => toggleModuleAll(module.module, e.target.checked)} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
                      <span className="text-slate-600 dark:text-slate-400 text-[12px] font-bold uppercase tracking-wider">{t("allLabel")}</span>
                    </label>
                  </div>

                  <div className="flex flex-col gap-3">
                    {module.actions.map((action) => {
                      const perm = `${module.module}:${action.key}`;
                      const isSelected = (form.permissions || []).includes(perm);
                      return (
                        <label key={perm} className={`group flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer border-2 transition-all duration-200 ${isSelected ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800" : "bg-white/50 dark:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700"}`}>
                          <div className={`w-5 h-5 rounded-[6px] border-[2px] ${isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600 bg-transparent'} flex items-center justify-center transition-colors`}>
                            {isSelected && <Check size={14} strokeWidth={4} />}
                          </div>
                          <input type="checkbox" checked={isSelected} onChange={() => togglePermission(perm)} className="hidden" />
                          <span className={`font-bold text-[13.5px] ${isSelected ? "text-emerald-700 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"}`}>
                            {t(`action_${action.key}_${module.module}`)}
                          </span>
                          {action.key === "delete" && (
                            <span className="ms-auto rtl:ms-0 rtl:me-auto text-[10px] font-black uppercase tracking-wider bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2.5 py-1 rounded-[6px]">
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

          <div className="mt-8 p-6 bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700/50 rounded-3xl">
            <h4 className="m-0 mb-4 text-slate-900 dark:text-white text-[15px] font-extrabold flex items-center gap-2"><ClipboardList size={18} className="text-slate-400"/> {t("permSummary")}</h4>
            <div className="flex flex-wrap gap-2.5">
              {(form.permissions || []).length === 0 ? (
                <span className="text-slate-500 text-[13.5px] font-medium italic bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">{t("noPermsSelected")}</span>
              ) : (
                (form.permissions || []).map((p) => (
                  <span key={p} className="px-3.5 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-xl text-[12px] font-bold border border-blue-200 dark:border-blue-800 shadow-sm">{p}</span>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {saveError && (
        <div className="mt-8 p-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-2xl text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-3">
          <AlertCircle size={20} /> {saveError}
        </div>
      )}

      {!pageMode && (
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <button className="btn btn-secondary !px-6 !py-3 !rounded-xl !font-bold" onClick={onClose}>{t("cancel")}</button>
          <button
            className="btn btn-primary !px-8 !py-3 !rounded-xl !font-bold flex items-center gap-2"
            onClick={handleSubmit}
            disabled={loading || !form.name || !form.email}
            style={{ background: loading ? "var(--bg-raised)" : "var(--brand)", opacity: !form.name || !form.email ? 0.6 : 1 }}
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> {t("saving")}</> : user ? t("updateUser") : t("createUser")}
          </button>
        </div>
      )}
    </div>
  );

  const needsLinkedAdmin = isPlatformRole && ADMIN_OWNED_ROLES.has(selectedRole);
  const pagePrimaryDisabled = loading || !form.name || !form.email || (!user && !form.password) || (needsLinkedAdmin && !form.adminId);

  if (pageMode) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300" style={{ direction: isRtl ? "rtl" : "ltr" }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-slate-500 font-bold mb-2 uppercase tracking-wide text-[12px]">
              <span>{t("dashboard")}</span><span className="opacity-50 text-[10px]">▶</span><span className="text-blue-600 dark:text-blue-400">{selectedRoleLabel}</span>
            </div>
            <h1 className="m-0 text-slate-900 dark:text-white text-3xl md:text-4xl font-black tracking-tight drop-shadow-sm">{pageTitle}</h1>
          </div>
          <button className="h-11 px-5 rounded-2xl font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-all" onClick={onClose}>
            <CornerDownLeft size={16} className={isRtl ? 'rotate-180 -scale-y-100' : ''} /> {backLabel}
          </button>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px] items-start pb-10">
          {innerContent}
          
          <div className="sticky top-6 flex flex-col gap-5">
            <div className="card p-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl rounded-3xl border border-slate-200/60 dark:border-slate-800/50 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full"></div>
              
              <h3 className="m-0 text-slate-900 dark:text-white text-[22px] font-black tracking-tight">{isRtl ? "معلومات الحساب" : "Summary"}</h3>
              <p className="mt-1 mb-8 text-slate-500 font-medium text-[13px]">{isRtl ? "ملخص سريع قبل الحفظ" : "Quick summary before saving."}</p>

              <div className="flex flex-col gap-5 relative z-10">
                <div>
                  <p className="m-0 mb-2 text-slate-400 text-[11px] uppercase tracking-widest font-black flex items-center gap-1.5"><Key size={12}/> {t("role")}</p>
                  <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 rounded-2xl px-5 py-3.5 text-slate-900 dark:text-white text-[15px] font-extrabold flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span> {selectedRoleLabel}
                  </div>
                </div>

                <div>
                  <p className="m-0 mb-2 text-slate-400 text-[11px] uppercase tracking-widest font-black flex items-center gap-1.5"><Shield size={12}/> {t("permissions")}</p>
                  <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 rounded-2xl px-5 py-3.5 text-slate-900 dark:text-white text-[14px] font-bold flex items-center justify-between">
                    <span>{t("permissionsSelected")}</span>
                    <span className="bg-blue-600 text-white px-2.5 py-1 rounded-lg text-[13px] shadow-sm">{(form.permissions || []).length}</span>
                  </div>
                </div>

                {needsLinkedAdmin && (
                  <div>
                    <p className="m-0 mb-2 text-slate-400 text-[11px] uppercase tracking-widest font-black flex items-center gap-1.5"><Link2 size={12}/> {t("linkedAdmin")}</p>
                    <div className={`bg-slate-50 dark:bg-slate-800/80 border rounded-2xl px-5 py-3.5 text-[14px] font-bold flex flex-col gap-1.5 transition-colors ${form.adminId ? "border-slate-100 dark:border-slate-700/50 text-slate-900 dark:text-white" : "border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400"}`}>
                      {selectedAdmin ? (
                        <>
                          <span className="flex items-center gap-2"><UserCog size={16} className="text-indigo-500" /> {selectedAdmin.name}</span>
                          <span className="text-slate-500 text-[12px] font-semibold ms-6 rtl:ms-0 rtl:me-6 flex items-center gap-1.5 border-l-2 border-slate-200 pl-2 rtl:border-l-0 rtl:border-r-2 rtl:pl-0 rtl:pr-2"><Mail size={12}/> {selectedAdmin.email}</span>
                        </>
                      ) : (
                        <span className="flex items-center gap-2 text-[13.5px]"><AlertCircle size={16} /> {t("adminRequired")}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card p-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl rounded-3xl border border-slate-200/60 dark:border-slate-800/50 shadow-xl">
              <button
                onClick={handleSubmit}
                disabled={pagePrimaryDisabled}
                className={`w-full py-4 rounded-2xl text-[16px] font-black transition-all flex justify-center items-center gap-2.5 group ${pagePrimaryDisabled ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)] hover:-translate-y-1'}`}
              >
                {loading ? (
                  <><Loader2 size={20} className="animate-spin" /> {t("saving")}</>
                ) : (
                  <>
                    {user ? t("updateUser") : t("createUser")}
                    <CornerDownLeft size={18} className={`transition-transform ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                  </>
                )}
              </button>
              <button className="w-full mt-3 py-3 rounded-2xl text-[15px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={onClose}>
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-start justify-center z-[1000] overflow-y-auto p-4 md:p-8 animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="my-auto w-full flex justify-center">
        {innerContent}
      </div>
    </div>
  );
}
