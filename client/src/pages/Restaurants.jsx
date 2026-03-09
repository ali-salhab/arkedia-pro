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

export default function RestaurantsPage() {
  const { data: users = [], isLoading, isFetching, error } = useGetUsersQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const { t } = useLanguage();

  const isMutating = isCreating || isUpdating || isDeleting;

  const usersArray = Array.isArray(users) ? users : [];
  const restaurantAccounts = usersArray.filter((u) => u.role === "restaurant");
  const adminsList = usersArray.filter((u) => u.role === "admin");

  const restaurantColumns = [
    { key: "name", label: t("name") },
    { key: "email", label: t("email") },
    {
      key: "adminId",
      label: t("linkedAdmin"),
      render: (v) => {
        const admin = adminsList.find((a) => a._id === v || a._id === v?._id);
        return admin ? (
          <span style={{ color: "#60a5fa", fontSize: 12 }}>{admin.name}</span>
        ) : (
          <span style={{ color: "#ef4444", fontSize: 12 }}>⚠️ {t("noAdminLinked")}</span>
        );
      },
    },
    {
      key: "logo",
      label: "Logo",
      render: (v) =>
        v ? (
          <img src={v} alt="logo" style={{ width: 48, height: 36, borderRadius: 6, objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 24 }}>🍽️</span>
        ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
    },
  ];

  const handleAddNew = () => {
    setEditingRestaurant(null);
    setModalOpen(true);
  };

  const handleEdit = (restaurant) => {
    setEditingRestaurant(restaurant);
    setModalOpen(true);
  };

  const handleSave = async (data) => {
    if (data._id) {
      await updateUser({ _id: data._id, ...data }).unwrap();
    } else {
      await createUser({ ...data, role: "restaurant" }).unwrap();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this restaurant account?")) {
      await deleteUser(id);
    }
  };

  if (isLoading) return <div className="p-6 text-center">Loading restaurant accounts...</div>;
  if (error) return <div className="p-6 text-center text-red-500">Error loading data</div>;

  return (
    <div style={{ padding: 24 }}>
      {(isFetching || isMutating) && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0,
            height: 3,
            zIndex: 9999,
            background: "linear-gradient(90deg, #f59e0b 0%, #ef4444 50%, #f59e0b 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.2s infinite linear",
          }}
        />
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Restaurant Accounts</h1>
          <p style={{ color: "#9ca3af", fontSize: 14, marginTop: 4 }}>Manage restaurant manager accounts linked to admins</p>
        </div>
        <button
          onClick={handleAddNew}
          disabled={isMutating || isFetching}
          style={{
            background: isMutating ? "#fcd34d" : "#f59e0b",
            padding: "12px 24px",
            borderRadius: 8,
            border: "none",
            color: "#fff",
            fontWeight: 600,
            cursor: isMutating ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            opacity: isMutating ? 0.7 : 1,
            transition: "all 0.2s",
          }}
        >
          {isMutating ? (
            <>
              <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              Saving...
            </>
          ) : (
            <><span style={{ fontSize: 18 }}>+</span> Add Restaurant Account</>
          )}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, borderLeft: "4px solid #f59e0b" }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🍽️</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#f59e0b" }}>{restaurantAccounts.length}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Restaurant Accounts</div>
        </div>
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, borderLeft: "4px solid #60a5fa" }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🔗</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#60a5fa" }}>{restaurantAccounts.filter((r) => r.adminId).length}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>{t("linkedToAdmin")}</div>
        </div>
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, borderLeft: "4px solid #ef4444" }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#ef4444" }}>{restaurantAccounts.filter((r) => !r.adminId).length}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>{t("noAdminLinked")}</div>
        </div>
      </div>

      {/* Restaurant Accounts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20, marginBottom: 32 }}>
        {restaurantAccounts.map((restaurant) => {
          const linkedAdmin = adminsList.find(
            (a) => a._id === restaurant.adminId || a._id === restaurant.adminId?._id,
          );
          return (
            <div key={restaurant._id} style={{ background: "#ffffff", borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0" }}>
              <div
                style={{
                  height: 120,
                  background: restaurant.logo
                    ? `url(${restaurant.logo}) center/cover no-repeat`
                    : "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                {!restaurant.logo && <span style={{ fontSize: 56 }}>🍽️</span>}
                {!linkedAdmin && (
                  <span style={{ position: "absolute", top: 8, right: 8, background: "#ef4444", color: "#fff", padding: "4px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600 }}>
                    ⚠️ {t("noAdminWarning")}
                  </span>
                )}
              </div>
              <div style={{ padding: 16 }}>
                <h3 style={{ margin: "0 0 4px 0", fontSize: 16, fontWeight: 600, color: "#1e293b" }}>{restaurant.name}</h3>
                <p style={{ margin: "0 0 8px 0", fontSize: 13, color: "#9ca3af" }}>{restaurant.email}</p>
                {linkedAdmin && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff7ed", border: "1px solid #fed7aa", padding: "4px 10px", borderRadius: 20, fontSize: 12, color: "#ea580c", marginBottom: 12 }}>
                    👔 {linkedAdmin.name}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button onClick={() => handleEdit(restaurant)} style={{ flex: 1, padding: "8px 12px", background: "#f59e0b", border: "none", borderRadius: 6, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                    {t("edit")}
                  </button>
                  <button onClick={() => handleDelete(restaurant._id)} style={{ padding: "8px 12px", background: "#ef4444", border: "none", borderRadius: 6, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                    {t("delete")}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {restaurantAccounts.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 48, color: "#9ca3af" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🍽️</div>
            <p>No restaurant accounts yet. Add one to get started.</p>
          </div>
        )}
      </div>

      {/* Table View */}
      <div className="card" style={{ marginTop: 32 }}>
        <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Restaurant Accounts Table</h3>
        <DataTable columns={restaurantColumns} data={restaurantAccounts} editable={false} exportFilename="restaurant_accounts" />
      </div>

      <UserFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        user={editingRestaurant}
        fixedRole="restaurant"
        adminsList={adminsList}
      />
    </div>
  );
}
