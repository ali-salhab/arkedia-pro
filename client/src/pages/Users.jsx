import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable";
import LoadingScreen from "../components/LoadingScreen";
import { useLanguage } from "../context/LanguageContext";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "../store/services/api";

// Config per dashboard type
const ROLE_CONFIG = {
  super_admin: {
    teamRole: "superadminuser",
    titleKey: "usersTeamPlatform",
    subtitleKey: "usersSubPlatform",
    addLabelKey: "addPlatformMember",
    icon: "🔑",
    color: "#a78bfa",
    statLabelKey: "superAdminsLabel",
  },
  superadminuser: {
    teamRole: "superadminuser",
    titleKey: "usersTeamPlatform",
    subtitleKey: "usersSubColleaguesPlatform",
    addLabelKey: "addPlatformMember",
    icon: "🔑",
    color: "#a78bfa",
    statLabelKey: "colleaguesLabel",
  },
  admin: {
    teamRole: "adminuser",
    titleKey: "usersTeamCompany",
    subtitleKey: "usersSubCompany",
    addLabelKey: "addTeamMember",
    icon: "👔",
    color: "#60a5fa",
    statLabelKey: "staffLabel",
  },
  adminuser: {
    teamRole: "adminuser",
    titleKey: "usersTeamCompany",
    subtitleKey: "usersSubColleaguesCompany",
    addLabelKey: "addTeamMember",
    icon: "👔",
    color: "#60a5fa",
    statLabelKey: "colleaguesLabel",
  },
  hotel: {
    teamRole: "hoteluser",
    titleKey: "usersTeamHotel",
    subtitleKey: "usersSubHotel",
    addLabelKey: "addStaffMember",
    icon: "🏨",
    color: "#4ade80",
    statLabelKey: "hotelStaffLabel",
  },
  hoteluser: {
    teamRole: "hoteluser",
    titleKey: "usersTeamHotel",
    subtitleKey: "usersSubColleaguesHotel",
    addLabelKey: "addStaffMember",
    icon: "🏨",
    color: "#4ade80",
    statLabelKey: "colleaguesLabel",
  },
  restaurant: {
    teamRole: "restaurantuser",
    titleKey: "usersTeamRestaurant",
    subtitleKey: "usersSubRestaurant",
    addLabelKey: "addStaffMember",
    icon: "🍽️",
    color: "#fbbf24",
    statLabelKey: "restaurantStaffLabel",
  },
  restaurantuser: {
    teamRole: "restaurantuser",
    titleKey: "usersTeamRestaurant",
    subtitleKey: "usersSubColleaguesRestaurant",
    addLabelKey: "addStaffMember",
    icon: "🍽️",
    color: "#fbbf24",
    statLabelKey: "colleaguesLabel",
  },
  activity: {
    teamRole: "activityuser",
    titleKey: "usersTeamActivity",
    subtitleKey: "usersSubActivity",
    addLabelKey: "addStaffMember",
    icon: "🎯",
    color: "#f472b6",
    statLabelKey: "activityStaffLabel",
  },
  activityuser: {
    teamRole: "activityuser",
    titleKey: "usersTeamActivity",
    subtitleKey: "usersSubColleaguesActivity",
    addLabelKey: "addStaffMember",
    icon: "🎯",
    color: "#f472b6",
    statLabelKey: "colleaguesLabel",
  },
};

export default function UsersPage() {
  const currentUser = useSelector((s) => s.auth.user);
  const config = ROLE_CONFIG[currentUser?.role] || ROLE_CONFIG.super_admin;
  const { t, lang } = useLanguage();

  const { data: users = [], isLoading, error } = useGetUsersQuery();
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const roleLabels = {
    super_admin: t("role_super_admin"),
    superadminuser: t("role_super_admin"),
    admin: t("role_admin"),
    adminuser: t("role_admin"),
    hotel: t("role_hotel"),
    hoteluser: t("role_hotel"),
    restaurant: t("role_restaurant"),
    restaurantuser: t("role_restaurant"),
    activity: t("role_activity"),
    activityuser: t("role_activity"),
  };

  const roleColors = {
    super_admin: {
      bg: "#8b5cf620",
      color: "#a78bfa",
      label: `🔑 ${roleLabels.super_admin}`,
    },
    superadminuser: {
      bg: "#8b5cf620",
      color: "#a78bfa",
      label: `🔐 ${roleLabels.superadminuser}`,
    },
    admin: {
      bg: "#3b82f620",
      color: "#60a5fa",
      label: `👔 ${roleLabels.admin}`,
    },
    adminuser: {
      bg: "#3b82f620",
      color: "#60a5fa",
      label: `🧩 ${roleLabels.adminuser}`,
    },
    hotel: {
      bg: "#22c55e20",
      color: "#4ade80",
      label: `🏨 ${roleLabels.hotel}`,
    },
    hoteluser: {
      bg: "#22c55e20",
      color: "#4ade80",
      label: `🛎️ ${roleLabels.hoteluser}`,
    },
    restaurant: {
      bg: "#f59e0b20",
      color: "#fbbf24",
      label: `🍽️ ${roleLabels.restaurant}`,
    },
    restaurantuser: {
      bg: "#f59e0b20",
      color: "#fbbf24",
      label: `🍴 ${roleLabels.restaurantuser}`,
    },
    activity: {
      bg: "#ec489920",
      color: "#f472b6",
      label: `🎯 ${roleLabels.activity}`,
    },
    activityuser: {
      bg: "#ec489920",
      color: "#f472b6",
      label: `🧭 ${roleLabels.activityuser}`,
    },
  };

  const userColumns = [
    { key: "name", label: t("name") },
    { key: "email", label: t("email") },
    {
      key: "role",
      label: t("role"),
      render: (v) => {
        const role = roleColors[v] || {
          bg: "#33415520",
          color: "#94a3b8",
          label: v || "-",
        };
        return (
          <span
            style={{
              padding: "4px 12px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 500,
              background: role.bg,
              color: role.color,
            }}
          >
            {role.label}
          </span>
        );
      },
    },
    {
      key: "permissions",
      label: t("permissions"),
      render: (v) => (
        <span style={{ color: "#9ca3af", fontSize: 12 }}>
          {Array.isArray(v) ? v.length : 0} {t("permissionsSelected")}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: t("createdAt"),
      editable: false,
      render: (v) =>
        v
          ? new Date(v).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")
          : "-",
    },
  ];

  const handleAddNew = () => {
    navigate("/users/new", {
      state: { fixedRole: config.teamRole, backTo: "/users" },
    });
  };

  const handleEdit = (user) => {
    navigate(`/users/${user._id}/edit`, {
      state: { user, fixedRole: config.teamRole, backTo: "/users" },
    });
  };

  const handleSave = async (data) => {
    try {
      if (data._id) {
        await updateUser({ _id: data._id, ...data }).unwrap();
      } else {
        await createUser(data).unwrap();
      }
    } catch (err) {
      throw err; // throw so UserFormModal can catch it and not close
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t("confirmDeleteUser"))) {
      await deleteUser(id);
    }
  };

  if (isLoading) {
    return (
      <LoadingScreen
        label={t("loadingUsers")}
        statCount={3}
        tableRows={6}
        tableCols={5}
      />
    );
  }

  if (error)
    return (
      <div className="card text-center text-sm font-medium text-rose-500">
        {error?.data?.message || t("errorLoadingUsers")}
      </div>
    );

  const usersArray = Array.isArray(users) ? users : [];
  const filteredUsers = usersArray.filter((u) => u.role === config.teamRole);

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
            {t(config.titleKey)}
          </h1>
          <p style={{ color: "#9ca3af", fontSize: 14, marginTop: 4 }}>
            {t(config.subtitleKey)}
          </p>
        </div>
        <button
          onClick={handleAddNew}
          style={{
            background: "#3b82f6",
            padding: "12px 24px",
            borderRadius: 8,
            border: "none",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 18 }}>+</span> {t(config.addLabelKey)}
        </button>
      </div>

      {/* Stats Card */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: "#f8fafc",
            borderRadius: 12,
            padding: 16,
            borderLeft: `4px solid ${config.color}`,
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 8 }}>{config.icon}</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: config.color }}>
            {filteredUsers.length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            {t(config.statLabelKey)}
          </div>
        </div>
        <div
          style={{
            background: "#f8fafc",
            borderRadius: 12,
            padding: 16,
            borderLeft: "4px solid #22c55e",
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#22c55e" }}>
            {filteredUsers.filter((u) => u.permissions?.length > 0).length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            {t("withPermissions")}
          </div>
        </div>
        <div
          style={{
            background: "#f8fafc",
            borderRadius: 12,
            padding: 16,
            borderLeft: "4px solid #3b82f6",
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 8 }}>📊</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#3b82f6" }}>
            {usersArray.length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            {t("totalPlatformUsers")}
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {filteredUsers.map((user) => {
          const role = roleColors[user.role] || {
            bg: "#33415520",
            color: "#94a3b8",
            label: user.role,
          };
          return (
            <div
              key={user._id}
              style={{
                background: "rgba(255,255,255,0.88)",
                borderRadius: 18,
                padding: 20,
                border: "1px solid rgba(148,163,184,0.18)",
                boxShadow: "0 18px 36px rgba(15, 23, 42, 0.06)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${role.bg}, #ffffff)`,
                      border: `1px solid ${role.color}22`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      color: role.color,
                    }}
                  >
                    {user.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#000111",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user.name}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        color: "#9ca3af",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "6px 12px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    background: role.bg,
                    color: role.color,
                    whiteSpace: "nowrap",
                    border: `1px solid ${role.color}22`,
                  }}
                >
                  {role.label}
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "6px 12px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    background: "#eef6ff",
                    color: "#0f4c81",
                    whiteSpace: "nowrap",
                    border: "1px solid rgba(14, 116, 144, 0.12)",
                  }}
                >
                  {(user.permissions || []).length} {t("permissionsSelected")}
                </span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div
                  style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}
                >
                  {t("permissions")}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {(user.permissions || []).slice(0, 5).map((p) => (
                    <span
                      key={p}
                      style={{
                        padding: "4px 9px",
                        background: "#edf4ff",
                        borderRadius: 999,
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#355070",
                        border: "1px solid rgba(59,130,246,0.1)",
                      }}
                    >
                      {p}
                    </span>
                  ))}
                  {(user.permissions || []).length > 5 && (
                    <span
                      style={{
                        padding: "4px 9px",
                        background: "#dff4ff",
                        borderRadius: 999,
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#0f766e",
                      }}
                    >
                      +{(user.permissions || []).length - 5} {t("moreLabel")}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => handleEdit(user)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    background: "#3b82f6",
                    border: "none",
                    borderRadius: 6,
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {t("editUserBtn")}
                </button>
                <button
                  onClick={() => handleDelete(user._id)}
                  style={{
                    padding: "8px 12px",
                    background: "#ef4444",
                    border: "none",
                    borderRadius: 6,
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {t("deleteUserBtn")}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table View */}
      <div className="card" style={{ marginTop: 32 }}>
        <h3 style={{ marginBottom: 16, fontWeight: 600 }}>
          {t(config.titleKey)} ({t("tableView")})
        </h3>
        <DataTable
          columns={userColumns}
          data={filteredUsers}
          editable={false}
          exportFilename="team_users"
        />
      </div>
    </div>
  );
}
