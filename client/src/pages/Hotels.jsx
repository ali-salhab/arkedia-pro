import { useState } from "react";
import DataTable from "../components/DataTable";
import HotelFormModal from "../components/HotelFormModal";
import {
  useGetHotelsQuery,
  useCreateHotelMutation,
  useUpdateHotelMutation,
  useDeleteHotelMutation,
} from "../store/services/api";

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
              background: "#1e293b",
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
                    color: "#f1f5f9",
                  }}
                >
                  {hotel.name}
                </h3>
                <span style={{ color: "#fbbf24" }}>
                  {"⭐".repeat(hotel.stars || 3)}
                </span>
              </div>

              <p style={{ color: "#9ca3af", fontSize: 14, margin: "8px 0" }}>
                📍 {hotel.city || "N/A"}, {hotel.country || "N/A"}
              </p>

              {hotel.type && (
                <span
                  style={{
                    display: "inline-block",
                    background: "#334155",
                    color: "#94a3b8",
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
