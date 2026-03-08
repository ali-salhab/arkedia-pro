import { useState } from "react";
import DataTable from "../components/DataTable";
import UserFormModal from "../components/UserFormModal";
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

  const userColumns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    {
      key: "permissions",
      label: "Permissions",
      render: (v) => (
        <span style={{ color: "#9ca3af", fontSize: 12 }}>
          {Array.isArray(v) ? v.length : 0} permissions
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
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
    if (data._id) {
      await updateUser({ _id: data._id, ...data });
    } else {
      await createUser({ ...data, role: "admin" });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this admin?")) {
      await deleteUser(id);
    }
  };

  if (isLoading)
    return <div className="p-6 text-center">Loading admins...</div>;
  if (error)
    return (
      <div className="p-6 text-center text-red-500">Error loading admins</div>
    );

  const usersArray = Array.isArray(users) ? users : [];
  const admins = usersArray.filter((u) => u.role === "admin");

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
            Admins Management
          </h1>
          <p style={{ color: "#9ca3af", fontSize: 14, marginTop: 4 }}>
            Company administrators — manage hotels, restaurants & activities
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
          <span style={{ fontSize: 18 }}>+</span> Add Admin
        </button>
      </div>

      {/* Stats */}
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
            borderLeft: "4px solid #60a5fa",
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 8 }}>👔</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#60a5fa" }}>
            {admins.length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Total Admins</div>
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
          <div style={{ fontSize: 12, color: "#64748b" }}>With Permissions</div>
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
          <div style={{ fontSize: 12, color: "#64748b" }}>Managed Accounts</div>
        </div>
      </div>

      {/* Admins Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
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
                  <p style={{ margin: 0, fontSize: 13, color: "#9ca3af" }}>
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
                Permissions
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
                    +{(user.permissions || []).length - 5} more
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
                Edit Admin
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
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Table View */}
      <div className="card" style={{ marginTop: 32 }}>
        <h3 style={{ marginBottom: 16, fontWeight: 600 }}>
          All Admins (Table View)
        </h3>
        <DataTable
          columns={userColumns}
          data={admins}
          editable={false}
          exportFilename="admins"
        />
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
