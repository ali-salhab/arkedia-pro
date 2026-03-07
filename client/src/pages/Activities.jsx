import { useState } from "react";
import DataTable from "../components/DataTable";
import ActivityFormModal from "../components/ActivityFormModal";
import {
  useGetActivitiesQuery,
  useCreateActivityMutation,
  useUpdateActivityMutation,
  useDeleteActivityMutation,
} from "../store/services/api";

export default function ActivitiesPage() {
  const { data: activities = [], isLoading, error } = useGetActivitiesQuery();
  const [createActivity] = useCreateActivityMutation();
  const [updateActivity] = useUpdateActivityMutation();
  const [deleteActivity] = useDeleteActivityMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  const activityColumns = [
    { key: "name", label: "Name" },
    { key: "type", label: "Type" },
    { key: "city", label: "City" },
    { key: "country", label: "Country" },
    {
      key: "duration",
      label: "Duration",
      render: (v, row) => (v ? `${v} ${row.durationUnit || "hours"}` : "-"),
    },
    {
      key: "pricePerPerson",
      label: "Price",
      render: (v) => (v ? `$${v}/person` : "-"),
    },
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
    setEditingActivity(null);
    setModalOpen(true);
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setModalOpen(true);
  };

  const handleSave = async (data) => {
    if (data._id) {
      await updateActivity({ id: data._id, ...data });
    } else {
      await createActivity(data);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      await deleteActivity(id);
    }
  };

  if (isLoading)
    return <div className="p-6 text-center">Loading activities...</div>;
  if (error)
    return (
      <div className="p-6 text-center text-red-500">
        Error loading activities
      </div>
    );

  const typeColors = {
    adventure: { bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
    cultural: { bg: "#ede9fe", color: "#5b21b6", border: "#c4b5fd" },
    water: { bg: "#dbeafe", color: "#1e40af", border: "#93c5fd" },
    sports: { bg: "#dcfce7", color: "#166534", border: "#86efac" },
    wellness: { bg: "#fce7f3", color: "#9d174d", border: "#f9a8d4" },
    food: { bg: "#fff7ed", color: "#9a3412", border: "#fdba74" },
    nature: { bg: "#ecfdf5", color: "#065f46", border: "#6ee7b7" },
    entertainment: { bg: "#f0f9ff", color: "#0c4a6e", border: "#7dd3fc" },
  };

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
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Activities Management</h1>
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
          <span style={{ fontSize: 18 }}>+</span> Add Activity
        </button>
      </div>

      {/* Activities Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        {(Array.isArray(activities) ? activities : []).map((activity) => {
          const tc = typeColors[activity.type] || {
            bg: "#f1f5f9",
            color: "#475569",
            border: "#e2e8f0",
          };
          return (
            <div
              key={activity._id}
              className="card"
              style={{
                borderRadius: 12,
                overflow: "hidden",
                transition: "transform 0.2s",
              }}
            >
              {/* Activity Header */}
              <div
                style={{
                  height: 160,
                  background: `linear-gradient(135deg, ${tc.bg} 0%, #e0f2fe 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  border: `1px solid ${tc.border}`,
                }}
              >
                <span style={{ fontSize: 56 }}>🎯</span>
                {activity.featured && (
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
                      activity.status === "active" ? "#22c55e" : "#ef4444",
                    color: "#fff",
                    padding: "4px 8px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {activity.status?.toUpperCase() || "ACTIVE"}
                </span>
                {activity.difficultyLevel && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 12,
                      right: 12,
                      background: "#fff",
                      color: tc.color,
                      border: `1px solid ${tc.border}`,
                      padding: "4px 8px",
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {activity.difficultyLevel}
                  </span>
                )}
              </div>

              {/* Activity Info */}
              <div style={{ padding: 16 }}>
                <h3
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#1e293b",
                  }}
                >
                  {activity.name}
                </h3>

                <p
                  style={{
                    color: "#64748b",
                    fontSize: 14,
                    margin: "0 0 8px 0",
                  }}
                >
                  📍 {activity.city || "N/A"}, {activity.country || "N/A"}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginBottom: 8,
                  }}
                >
                  {activity.type && (
                    <span
                      style={{
                        display: "inline-block",
                        background: tc.bg,
                        color: tc.color,
                        border: `1px solid ${tc.border}`,
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 12,
                        textTransform: "capitalize",
                      }}
                    >
                      {activity.type}
                    </span>
                  )}
                  {activity.duration && (
                    <span
                      style={{
                        display: "inline-block",
                        background: "#f1f5f9",
                        color: "#64748b",
                        border: "1px solid #e2e8f0",
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 12,
                      }}
                    >
                      ⏱ {activity.duration} {activity.durationUnit || "hrs"}
                    </span>
                  )}
                </div>

                {activity.pricePerPerson && (
                  <p
                    style={{
                      color: "#16a34a",
                      fontSize: 15,
                      fontWeight: 600,
                      margin: "8px 0",
                    }}
                  >
                    ${activity.pricePerPerson} / person
                  </p>
                )}

                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button
                    onClick={() => handleEdit(activity)}
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
                    onClick={() => handleDelete(activity._id)}
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
      </div>

      {/* Table View */}
      <div className="card" style={{ marginTop: 32 }}>
        <h3 style={{ marginBottom: 16, fontWeight: 600 }}>
          All Activities (Table View)
        </h3>
        <DataTable
          columns={activityColumns}
          data={Array.isArray(activities) ? activities : []}
          editable={false}
          exportFilename="activities"
        />
      </div>

      {/* Activity Form Modal */}
      <ActivityFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        activity={editingActivity}
      />
    </div>
  );
}
