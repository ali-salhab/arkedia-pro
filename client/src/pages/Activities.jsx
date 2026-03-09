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

export default function ActivitiesPage() {
  const { data: users = [], isLoading, isFetching, error } = useGetUsersQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const { t } = useLanguage();

  const isMutating = isCreating || isUpdating || isDeleting;

  const usersArray = Array.isArray(users) ? users : [];
  const activityAccounts = usersArray.filter((u) => u.role === "activity");
  const adminsList = usersArray.filter((u) => u.role === "admin");

  const activityColumns = [
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
          <span style={{ fontSize: 24 }}>🎯</span>
        ),
    },
    {
      key: "createdAt",
      label: "Created",
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
      await updateUser({ _id: data._id, ...data }).unwrap();
    } else {
      await createUser({ ...data, role: "activity" }).unwrap();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this activity account?")) {
      await deleteUser(id);
    }
  };

  if (isLoading) return <div className="p-6 text-center">Loading activity accounts...</div>;
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
            background: "linear-gradient(90deg, #8b5cf6 0%, #6366f1 50%, #8b5cf6 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.2s infinite linear",
          }}
        />
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Activity Accounts</h1>
          <p style={{ color: "#9ca3af", fontSize: 14, marginTop: 4 }}>Manage activity manager accounts linked to admins</p>
        </div>
        <button
          onClick={handleAddNew}
          disabled={isMutating || isFetching}
          style={{
            background: isMutating ? "#c4b5fd" : "#8b5cf6",
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
            <><span style={{ fontSize: 18 }}>+</span> Add Activity Account</>
          )}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, borderLeft: "4px solid #8b5cf6" }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🎯</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#8b5cf6" }}>{activityAccounts.length}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Activity Accounts</div>
        </div>
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, borderLeft: "4px solid #60a5fa" }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🔗</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#60a5fa" }}>{activityAccounts.filter((a) => a.adminId).length}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>{t("linkedToAdmin")}</div>
        </div>
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, borderLeft: "4px solid #ef4444" }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#ef4444" }}>{activityAccounts.filter((a) => !a.adminId).length}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>{t("noAdminLinked")}</div>
        </div>
      </div>

      {/* Activity Accounts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20, marginBottom: 32 }}>
        {activityAccounts.map((activity) => {
          const linkedAdmin = adminsList.find(
            (a) => a._id === activity.adminId || a._id === activity.adminId?._id,
          );
          return (
            <div key={activity._id} style={{ background: "#ffffff", borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0" }}>
              <div
                style={{
                  height: 120,
                  background: activity.logo
                    ? `url(${activity.logo}) center/cover no-repeat`
                    : "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                {!activity.logo && <span style={{ fontSize: 56 }}>🎯</span>}
                {!linkedAdmin && (
                  <span style={{ position: "absolute", top: 8, right: 8, background: "#ef4444", color: "#fff", padding: "4px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600 }}>
                    ⚠️ {t("noAdminWarning")}
                  </span>
                )}
              </div>
              <div style={{ padding: 16 }}>
                <h3 style={{ margin: "0 0 4px 0", fontSize: 16, fontWeight: 600, color: "#1e293b" }}>{activity.name}</h3>
                <p style={{ margin: "0 0 8px 0", fontSize: 13, color: "#9ca3af" }}>{activity.email}</p>
                {linkedAdmin && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f5f3ff", border: "1px solid #ddd6fe", padding: "4px 10px", borderRadius: 20, fontSize: 12, color: "#7c3aed", marginBottom: 12 }}>
                    👔 {linkedAdmin.name}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button onClick={() => handleEdit(activity)} style={{ flex: 1, padding: "8px 12px", background: "#8b5cf6", border: "none", borderRadius: 6, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                    {t("edit")}
                  </button>
                  <button onClick={() => handleDelete(activity._id)} style={{ padding: "8px 12px", background: "#ef4444", border: "none", borderRadius: 6, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                    {t("delete")}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {activityAccounts.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 48, color: "#9ca3af" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
            <p>No activity accounts yet. Add one to get started.</p>
          </div>
        )}
      </div>

      {/* Table View */}
      <div className="card" style={{ marginTop: 32 }}>
        <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Activity Accounts Table</h3>
        <DataTable columns={activityColumns} data={activityAccounts} editable={false} exportFilename="activity_accounts" />
      </div>

      <UserFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        user={editingActivity}
        fixedRole="activity"
        adminsList={adminsList}
      />
    </div>
  );
}


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
