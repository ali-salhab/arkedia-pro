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

export default function HotelsPage() {
  const { data: users = [], isLoading, isFetching, error } = useGetUsersQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const { t } = useLanguage();

  const isMutating = isCreating || isUpdating || isDeleting;

  const usersArray = Array.isArray(users) ? users : [];
  const hotelAccounts = usersArray.filter((u) => u.role === "hotel");
  const adminsList = usersArray.filter((u) => u.role === "admin");

  const hotelColumns = [
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
          <span style={{ color: "#ef4444", fontSize: 12 }}>
            ⚠️ {t("noAdminLinked")}
          </span>
        );
      },
    },
    {
      key: "logo",
      label: "Logo",
      render: (v) =>
        v ? (
          <img
            src={v}
            alt="logo"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          <span style={{ fontSize: 24 }}>🏨</span>
        ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
    },
  ];

  const handleAddNew = () => {
    setEditingHotel(null);
    setModalOpen(true);
  };

  const handleEdit = (hotel) => {
    setEditingHotel(hotel);
    setModalOpen(true);
  };

  const handleSave = async (data) => {
    if (data._id) {
      await updateUser({ _id: data._id, ...data }).unwrap();
    } else {
      await createUser({ ...data, role: "hotel" }).unwrap();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t("areYouSureDeleteHotelAccount"))) {
      await deleteUser(id);
    }
  };

  if (isLoading)
    return <div className="p-6 text-center">{t("loadingHotelAccounts")}</div>;
  if (error)
    return (
      <div className="p-6 text-center text-red-500">
        {t("errorLoadingData")}
      </div>
    );

  return (
    <div style={{ padding: 24 }}>
      {/* Loading bar — shows during refetch after create/update/delete */}
      {(isFetching || isMutating) && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            zIndex: 9999,
            background:
              "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #3b82f6 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.2s infinite linear",
          }}
        />
      )}
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
            {t("hotelAccounts")}
          </h1>
          <p style={{ color: "#9ca3af", fontSize: 14, marginTop: 4 }}>
            {t("hotelAccountsSubtitle")}
          </p>
        </div>
        <button
          onClick={handleAddNew}
          disabled={isMutating || isFetching}
          style={{
            background: isMutating ? "#93c5fd" : "#3b82f6",
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
              <span
                style={{
                  display: "inline-block",
                  width: 16,
                  height: 16,
                  border: "2px solid #fff",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }}
              />
              {t("saving")}
            </>
          ) : (
            <>
              <span style={{ fontSize: 18 }}>+</span> {t("addHotelAccount")}
            </>
          )}
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
            borderLeft: "4px solid #22c55e",
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 8 }}>🏨</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#22c55e" }}>
            {hotelAccounts.length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            {t("hotelAccounts")}
          </div>
        </div>
        <div
          style={{
            background: "#f8fafc",
            borderRadius: 12,
            padding: 16,
            borderLeft: "4px solid #60a5fa",
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 8 }}>🔗</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#60a5fa" }}>
            {hotelAccounts.filter((h) => h.adminId).length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            {t("linkedToAdmin")}
          </div>
        </div>
        <div
          style={{
            background: "#f8fafc",
            borderRadius: 12,
            padding: 16,
            borderLeft: "4px solid #ef4444",
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#ef4444" }}>
            {hotelAccounts.filter((h) => !h.adminId).length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            {t("noAdminLinked")}
          </div>
        </div>
      </div>

      {/* Hotel Accounts Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        {hotelAccounts.map((hotel) => {
          const linkedAdmin = adminsList.find(
            (a) => a._id === hotel.adminId || a._id === hotel.adminId?._id,
          );
          return (
            <div
              key={hotel._id}
              style={{
                background: "#ffffff",
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid #e2e8f0",
              }}
            >
              {/* Header */}
              <div
                style={{
                  height: 120,
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                {hotel.logo ? (
                  <img
                    src={hotel.logo}
                    alt={hotel.name}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid #fff",
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 56 }}>🏨</span>
                )}
                {!linkedAdmin && (
                  <span
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      background: "#ef4444",
                      color: "#fff",
                      padding: "4px 8px",
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  >
                    ⚠️ {t("noAdminWarning")}
                  </span>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: 16 }}>
                <h3
                  style={{
                    margin: "0 0 4px 0",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#1e293b",
                  }}
                >
                  {hotel.name}
                </h3>
                <p
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: 13,
                    color: "#9ca3af",
                  }}
                >
                  {hotel.email}
                </p>
                {linkedAdmin && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      padding: "4px 10px",
                      borderRadius: 20,
                      fontSize: 12,
                      color: "#2563eb",
                      marginBottom: 12,
                    }}
                  >
                    👔 {linkedAdmin.name}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button
                    onClick={() => handleEdit(hotel)}
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
                    {t("edit")}
                  </button>
                  <button
                    onClick={() => handleDelete(hotel._id)}
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
            </div>
          );
        })}

        {hotelAccounts.length === 0 && (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: 48,
              color: "#9ca3af",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏨</div>
            <p>{t("noHotelAccountsYet")}</p>
          </div>
        )}
      </div>

      {/* Table View */}
      <div className="card" style={{ marginTop: 32 }}>
        <h3 style={{ marginBottom: 16, fontWeight: 600 }}>
          {t("hotelAccountsTable")}
        </h3>
        <DataTable
          columns={hotelColumns}
          data={hotelAccounts}
          editable={false}
          exportFilename="hotel_accounts"
        />
      </div>

      <UserFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        user={editingHotel}
        fixedRole="hotel"
        adminsList={adminsList}
      />
    </div>
  );
}
