import { useState } from "react";
import DataTable from "../components/DataTable";
import RestaurantFormModal from "../components/RestaurantFormModal";
import {
  useGetRestaurantsQuery,
  useCreateRestaurantMutation,
  useUpdateRestaurantMutation,
  useDeleteRestaurantMutation,
} from "../store/services/api";

export default function RestaurantsPage() {
  const { data: restaurants = [], isLoading, error } = useGetRestaurantsQuery();
  const [createRestaurant] = useCreateRestaurantMutation();
  const [updateRestaurant] = useUpdateRestaurantMutation();
  const [deleteRestaurant] = useDeleteRestaurantMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);

  const restaurantColumns = [
    { key: "name", label: "Name" },
    { key: "cuisineType", label: "Cuisine" },
    { key: "restaurantType", label: "Type" },
    { key: "city", label: "City" },
    { key: "country", label: "Country" },
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
    setEditingRestaurant(null);
    setModalOpen(true);
  };

  const handleEdit = (restaurant) => {
    setEditingRestaurant(restaurant);
    setModalOpen(true);
  };

  const handleSave = async (data) => {
    if (data._id) {
      await updateRestaurant({ id: data._id, ...data });
    } else {
      await createRestaurant(data);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this restaurant?")) {
      await deleteRestaurant(id);
    }
  };

  if (isLoading)
    return <div className="p-6 text-center">Loading restaurants...</div>;
  if (error)
    return (
      <div className="p-6 text-center text-red-500">
        Error loading restaurants
      </div>
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
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>
          Restaurants Management
        </h1>
        <button
          className="btn btn-primary"
          onClick={handleAddNew}
          style={{
            background: "#2563eb",
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
          <span style={{ fontSize: 18 }}>+</span> Add Restaurant
        </button>
      </div>

      {/* Restaurants Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        {(Array.isArray(restaurants) ? restaurants : []).map((restaurant) => (
          <div
            key={restaurant._id}
            className="card"
            style={{
              borderRadius: 12,
              overflow: "hidden",
              transition: "transform 0.2s",
            }}
          >
            {/* Restaurant Image Placeholder */}
            <div
              style={{
                height: 160,
                background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <span style={{ fontSize: 48 }}>🍽️</span>
              {restaurant.featured && (
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
                  background:
                    restaurant.status === "active" ? "#22c55e" : "#ef4444",
                  color: "#fff",
                  padding: "4px 8px",
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {restaurant.status?.toUpperCase() || "ACTIVE"}
              </span>
              {restaurant.michelinStars > 0 && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 12,
                    right: 12,
                    background: "#fff",
                    color: "#e11d48",
                    padding: "4px 8px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {"⭐".repeat(restaurant.michelinStars)} Michelin
                </span>
              )}
            </div>

            {/* Restaurant Info */}
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
                  {restaurant.name}
                </h3>
                {restaurant.verified && (
                  <span
                    style={{
                      background: "#dbeafe",
                      color: "#2563eb",
                      padding: "2px 8px",
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    ✓ Verified
                  </span>
                )}
              </div>

              <p style={{ color: "#64748b", fontSize: 14, margin: "8px 0" }}>
                📍 {restaurant.city || "N/A"}, {restaurant.country || "N/A"}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 8,
                }}
              >
                {restaurant.cuisineType && (
                  <span
                    style={{
                      display: "inline-block",
                      background: "#fef3c7",
                      color: "#92400e",
                      border: "1px solid #fde68a",
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: 12,
                      textTransform: "capitalize",
                    }}
                  >
                    {restaurant.cuisineType}
                  </span>
                )}
                {restaurant.restaurantType && (
                  <span
                    style={{
                      display: "inline-block",
                      background: "#f1f5f9",
                      color: "#64748b",
                      border: "1px solid #e2e8f0",
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: 12,
                      textTransform: "capitalize",
                    }}
                  >
                    {restaurant.restaurantType}
                  </span>
                )}
              </div>

              {restaurant.averagePrice && (
                <p
                  style={{
                    color: "#16a34a",
                    fontSize: 15,
                    fontWeight: 600,
                    margin: "8px 0",
                  }}
                >
                  ~${restaurant.averagePrice} avg / person
                </p>
              )}

              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button
                  onClick={() => handleEdit(restaurant)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    background: "#2563eb",
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
                  onClick={() => handleDelete(restaurant._id)}
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
          All Restaurants (Table View)
        </h3>
        <DataTable
          columns={restaurantColumns}
          data={Array.isArray(restaurants) ? restaurants : []}
          editable={false}
          exportFilename="restaurants"
        />
      </div>

      {/* Restaurant Form Modal */}
      <RestaurantFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        restaurant={editingRestaurant}
      />
    </div>
  );
}
