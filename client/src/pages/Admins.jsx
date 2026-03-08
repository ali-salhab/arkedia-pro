import { useState } from "react";
import DataTable from "../components/DataTable";
import UserFormModal from "../components/UserFormModal";
import { useLanguage } from "../context/LanguageContext";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "../store/services/api";

export default function AdminsPage() {
  const { data: users = [], isLoading, error } = useGetUsersQuery();
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

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
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleSave = async (data) => {
    try {
      if (data._id) {
        await updateUser({ _id: data._id, ...data }).unwrap();
      } else {
        await createUser({ ...data, role: "admin" }).unwrap();
      }
    } catch (err) {
      alert(err.data?.message || "Failed to save admin");
      throw err;
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t("areYouSureDeleteAdmin"))) {
      await deleteUser(id);
    }
  };

  if (isLoading)
    return <div className="p-6 text-center">{t("loadingAdmins")}</div>;
  if (error)
    return (
      <div className="p-6 text-center text-red-500">
        {t("errorLoadingAdmins")}
      </div>
    );

  const usersArray = Array.isArray(users) ? users : [];
  const admins = usersArray.filter((u) => u.role === "admin");

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
                justifyContent: "space-between",
                alignItems: "start",
                marginBottom: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "#3b82f620",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  {user.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#1e293b",
                    }}
                  >
                    {user.name}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      color: "#9ca3af",
                      wordBreak: "break-all",
                    }}
                  >
                    {user.email}
                  </p>
                </div>
              </div>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 500,
                  background: "#3b82f620",
                  color: "#60a5fa",
                }}
              >
                👔 Admin
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
                      padding: "2px 8px",
                      background: "#f1f5f9",
                      borderRadius: 4,
                      fontSize: 10,
                      color: "#64748b",
                    }}
                  >
                    {p}
                  </span>
                ))}
                {(user.permissions || []).length > 5 && (
                  <span
                    style={{
                      padding: "2px 8px",
                      background: "#3b82f620",
                      borderRadius: 4,
                      fontSize: 10,
                      color: "#60a5fa",
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

      <UserFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        user={editingUser}
        fixedRole="admin"
      />
    </div>
  );
}
