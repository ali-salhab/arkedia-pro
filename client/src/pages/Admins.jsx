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

export default function AdminsPage() {
  const permissions = useSelector((s) => s.auth.user?.permissions || []);
  const canViewAdmins = permissions.includes("admins:view");

  const {
    data: users = [],
    isLoading,
    error,
  } = useGetUsersQuery({ role: "admin" }, { skip: !canViewAdmins });
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { t } = useLanguage();

  const userColumns = [
    { key: "name", label: t("name") },
    { key: "email", label: t("email") },
    {
      key: "permissions",
      label: t("permissionsLabel"),
      render: (v) => (
        <span style={{ color: "#9ca3af", fontSize: 12 }}>
          {Array.isArray(v) ? v.length : 0} {t("permissionsSelected")}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: t("status"),
      render: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
    },
  ];

  const handleAddNew = () => {
    navigate("/admins/new", {
      state: { fixedRole: "admin", backTo: "/admins" },
    });
  };

  const handleEdit = (user) => {
    navigate(`/admins/${user._id}/edit`, {
      state: { user, fixedRole: "admin", backTo: "/admins" },
    });
  };

  const handleSave = async (data) => {
    try {
      if (data._id) {
        await updateUser({ _id: data._id, ...data }).unwrap();
      } else {
        await createUser({ ...data, role: "admin" }).unwrap();
      }
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t("areYouSureDeleteAdmin"))) {
      await deleteUser(id);
    }
  };

  if (!canViewAdmins) {
    return (
      <div className="card text-center text-sm font-medium text-rose-500">
        {t("error")} 403: Missing admins:view permission
      </div>
    );
  }

  if (isLoading)
    return (
      <LoadingScreen
        label={t("loadingAdmins")}
        statCount={3}
        tableRows={6}
        tableCols={4}
      />
    );
  if (error)
    return (
      <div className="p-6 text-center text-red-500">
        {t("errorLoadingAdmins")}
      </div>
    );

  const usersArray = Array.isArray(users) ? users : [];
  const admins = usersArray;

  return (
    <div
      style={{
        padding: 24,
        overflowX: "hidden",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
            {t("adminsManagement")}
          </h1>
          <p
            style={{
              color: "#9ca3af",
              fontSize: 14,
              marginTop: 4,
              wordBreak: "break-word",
            }}
          >
            {t("adminsSubtitle")}
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
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontSize: 18 }}>+</span> {t("addAdmin")}
        </button>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: "#f8fafc",
            borderRadius: 12,
            padding: 16,
            borderLeft: "4px solid #60a5fa",
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 8 }}>👔</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#60a5fa" }}>
            {admins.length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            {t("totalAdmins")}
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
            {admins.filter((u) => u.permissions?.length > 0).length}
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
            borderLeft: "4px solid #f59e0b",
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 8 }}>🏢</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#f59e0b" }}>
            {
              usersArray.filter(
                (u) =>
                  u.role === "hotel" ||
                  u.role === "restaurant" ||
                  u.role === "activity",
              ).length
            }
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            {t("managedAccounts")}
          </div>
        </div>
      </div>

      {/* Admins Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {admins.map((user) => (
          <div
            key={user._id}
            style={{
              background: "#ffffff",
              borderRadius: 12,
              padding: 20,
              border: "1px solid #e2e8f0",
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
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #dbeafe, #eff6ff)",
                    border: "1px solid rgba(37,99,235,0.14)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    color: "#2563eb",
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
                      color: "#1e293b",
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
                  background: "#dbeafe",
                  color: "#2563eb",
                  border: "1px solid rgba(37,99,235,0.14)",
                  whiteSpace: "nowrap",
                }}
              >
                👔 Admin
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
                  border: "1px solid rgba(14, 116, 144, 0.12)",
                  whiteSpace: "nowrap",
                }}
              >
                {(user.permissions || []).length} {t("permissionsSelected")}
              </span>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
                {t("permissionsLabel")}
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
                {t("editAdmin")}
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
                {t("delete")}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Table View */}
      <div className="card" style={{ marginTop: 32, overflowX: "auto" }}>
        <h3 style={{ marginBottom: 16, fontWeight: 600 }}>
          {t("adminsManagement")} — {t("allBookings").replace("جميع ", "")}
        </h3>
        <div style={{ overflowX: "auto" }}>
          <DataTable
            columns={userColumns}
            data={admins}
            editable={false}
            exportFilename="admins"
          />
        </div>
      </div>
    </div>
  );
}
