import { useState } from "react";
import DataTable from "../components/DataTable";
import UserFormModal from "../components/UserFormModal";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "../store/services/api";

export default function HotelsPage() {
  const { data: users = [], isLoading, error } = useGetUsersQuery();
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);

  const usersArray = Array.isArray(users) ? users : [];
  const hotelAccounts = usersArray.filter((u) => u.role === "hotel");
  const adminsList = usersArray.filter((u) => u.role === "admin");

  const hotelColumns = [
    { key: "name", label: "Hotel Name" },
    { key: "email", label: "Account Email" },
    {
      key: "adminId",
      label: "Linked Admin",
      render: (v) => {
        const admin = adminsList.find((a) => a._id === v || a._id === v?._id);
        return admin ? (
          <span style={{ color: "#60a5fa", fontSize: 12 }}>{admin.name}</span>
        ) : (
          <span style={{ color: "#ef4444", fontSize: 12 }}>⚠️ No Admin</span>
        );
      },
    },
    {
      key: "logo",
      label: "Logo",
      render: (v) =>
        v ? (
          <img src={v} alt="logo" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
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
      await updateUser({ _id: data._id, ...data });
    } else {
      await createUser({ ...data, role: "hotel" });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this hotel account?")) {
      await deleteUser(id);
    }
  };

  if (isLoading) return <div className="p-6 text-center">Loading hotel accounts...</div>;
  if (error) return <div className="p-6 text-center text-red-500">Error loading data</div>;

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
            Hotel Accounts
          </h1>
          <p style={{ color: "#9ca3af", fontSize: 14, marginTop: 4 }}>
            Manage hotel user accounts — each must be linked to an Admin
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
          <span style={{ fontSize: 18 }}>+</span> Add Hotel Account
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, borderLeft: "4px solid #22c55e" }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🏨</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#22c55e" }}>{hotelAccounts.length}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Hotel Accounts</div>
        </div>
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, borderLeft: "4px solid #60a5fa" }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🔗</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#60a5fa" }}>{hotelAccounts.filter(h => h.adminId).length}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Linked to Admin</div>
        </div>
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, borderLeft: "4px solid #ef4444" }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#ef4444" }}>{hotelAccounts.filter(h => !h.adminId).length}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>No Admin Linked</div>
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
            (a) => a._id === hotel.adminId || a._id === hotel.adminId?._id
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
                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
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
                    style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "3px solid #fff" }}
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
                    ⚠️ NO ADMIN
                  </span>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: 16 }}>
                <h3 style={{ margin: "0 0 4px 0", fontSize: 16, fontWeight: 600, color: "#1e293b" }}>
                  {hotel.name}
                </h3>
                <p style={{ margin: "0 0 8px 0", fontSize: 13, color: "#9ca3af" }}>{hotel.email}</p>
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
                    Edit
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
                    Delete
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
            <p>No hotel accounts yet. Click "+ Add Hotel Account" to create one.</p>
          </div>
        )}
      </div>

      {/* Table View */}
      <div className="card" style={{ marginTop: 32 }}>
        <h3 style={{ marginBottom: 16, fontWeight: 600 }}>
          All Hotel Accounts (Table View)
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


export default function HotelsPage() {
  const { data: hotels = [], isLoading, error } = useGetHotelsQuery();
  const [createHotel] = useCreateHotelMutation();
  const [updateHotel] = useUpdateHotelMutation();
  const [deleteHotel] = useDeleteHotelMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);

  const hotelColumns = [
    { key: "name", label: "Name" },
    { key: "type", label: "Type" },
    { key: "city", label: "City" },
    { key: "country", label: "Country" },
    { key: "stars", label: "Stars", render: (v) => "⭐".repeat(v || 0) },
    {
      key: "status",
      label: "Status",
      render: (v) => (
        <span
          style={{
            padding: "4px 8px",
            borderRadius: 4,
            fontSize: 12,
            background:
              v === "active"
                ? "#22c55e20"
                : v === "inactive"
                  ? "#ef444420"
                  : "#f59e0b20",
            color:
              v === "active"
                ? "#22c55e"
                : v === "inactive"
                  ? "#ef4444"
                  : "#f59e0b",
          }}
        >
          {v || "active"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      editable: false,
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
      await updateHotel({ id: data._id, ...data });
    } else {
      await createHotel(data);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this hotel?")) {
      await deleteHotel(id);
    }
  };

  if (isLoading)
    return <div className="p-6 text-center">Loading hotels...</div>;
  if (error)
    return (
      <div className="p-6 text-center text-red-500">Error loading hotels</div>
    );

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
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Hotels Management</h1>
        <button
          className="btn btn-primary"
          onClick={handleAddNew}
          style={{
            background: "#3b82f6",
            padding: "10px 20px",
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
          <span style={{ fontSize: 18 }}>+</span> Add Hotel
        </button>
      </div>

      {/* Hotels Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        {(Array.isArray(hotels) ? hotels : []).map((hotel) => (
          <div
            key={hotel._id}
            className="card"
            style={{
              borderRadius: 12,
              overflow: "hidden",
              transition: "transform 0.2s",
            }}
          >
            {/* Hotel Image Placeholder */}
            <div
              style={{
                height: 160,
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <span style={{ fontSize: 48 }}>🏨</span>
              {hotel.featured && (
                <span
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: "#f59e0b",
                    color: "#000",
                    padding: "4px 8px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  FEATURED
                </span>
              )}
              <span
                style={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  background: hotel.status === "active" ? "#22c55e" : "#ef4444",
                  color: "#fff",
                  padding: "4px 8px",
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {hotel.status?.toUpperCase() || "ACTIVE"}
              </span>
            </div>

            {/* Hotel Info */}
            <div style={{ padding: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: 8,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#1e293b",
                  }}
                >
                  {hotel.name}
                </h3>
                <span style={{ color: "#fbbf24" }}>
                  {"⭐".repeat(hotel.stars || 3)}
                </span>
              </div>

              <p style={{ color: "#64748b", fontSize: 14, margin: "8px 0" }}>
                📍 {hotel.city || "N/A"}, {hotel.country || "N/A"}
              </p>

              {hotel.type && (
                <span
                  style={{
                    display: "inline-block",
                    background: "#f1f5f9",
                    color: "#64748b",
                    border: "1px solid #e2e8f0",
                    padding: "4px 10px",
                    borderRadius: 20,
                    fontSize: 12,
                    marginBottom: 12,
                    textTransform: "capitalize",
                  }}
                >
                  {hotel.type}
                </span>
              )}

              {hotel.minPrice && (
                <p
                  style={{
                    color: "#22c55e",
                    fontSize: 16,
                    fontWeight: 600,
                    margin: "8px 0",
                  }}
                >
                  ${hotel.minPrice} - ${hotel.maxPrice} / night
                </p>
              )}

              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
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
                  Edit
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
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table View */}
      <div className="card" style={{ marginTop: 32 }}>
        <h3 style={{ marginBottom: 16, fontWeight: 600 }}>
          All Hotels (Table View)
        </h3>
        <DataTable
          columns={hotelColumns}
          data={Array.isArray(hotels) ? hotels : []}
          editable={false}
          exportFilename="hotels"
        />
      </div>

      {/* Hotel Form Modal */}
      <HotelFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        hotel={editingHotel}
      />
    </div>
  );
}
