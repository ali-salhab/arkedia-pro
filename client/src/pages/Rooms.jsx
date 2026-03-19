import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import LoadingScreen from "../components/LoadingScreen";
import {
  useGetRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} from "../store/services/api";
import PermissionWrapper from "../components/PermissionWrapper";

const STATUS_STYLE = {
  available: { background: "rgba(22,163,74,0.15)", color: "#16a34a" },
  occupied: { background: "rgba(220,38,38,0.15)", color: "#ef4444" },
  maintenance: { background: "rgba(161,98,7,0.15)", color: "#d97706" },
  reserved: { background: "rgba(29,78,216,0.15)", color: "#3b82f6" },
};

const TYPE_ICON = {
  room: "🛏️",
  suite: "🌟",
  studio: "🏠",
  villa: "🏡",
  table: "🍽️",
  service: "⚙️",
};

export default function RoomsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { data: rooms = [], isLoading } = useGetRoomsQuery();
  const [createRoom] = useCreateRoomMutation();
  const [updateRoom] = useUpdateRoomMutation();
  const [deleteRoom] = useDeleteRoomMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = rooms.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      String(r.number).includes(q) ||
      (r.name || "").toLowerCase().includes(q) ||
      (r.type || "").toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSave = async (data) => {
    if (data._id) {
      await updateRoom({ id: data._id, ...data }).unwrap();
    } else {
      await createRoom(data).unwrap();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    await deleteRoom(confirmDelete._id).unwrap();
    setConfirmDelete(null);
  };

  const openAdd = () => {
    navigate("/rooms/new", { state: { backTo: "/rooms" } });
  };
  const openEdit = (r) => {
    navigate(`/rooms/${r._id}/edit`, { state: { room: r, backTo: "/rooms" } });
  };

  const stats = {
    total: rooms.length,
    available: rooms.filter((r) => r.status === "available").length,
    occupied: rooms.filter((r) => r.status === "occupied").length,
    maintenance: rooms.filter((r) => r.status === "maintenance").length,
  };

  if (isLoading)
    return (
      <LoadingScreen
        label={t("loadingRooms")}
        statCount={4}
        tableRows={4}
        tableCols={4}
      />
    );

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 24,
        }}
      >
        {[
          {
            label: t("roomsPage_totalRooms"),
            value: stats.total,
            color: "#3b82f6",
          },
          {
            label: t("roomsPage_available"),
            value: stats.available,
            color: "#16a34a",
          },
          {
            label: t("roomsPage_occupied"),
            value: stats.occupied,
            color: "#dc2626",
          },
          {
            label: t("roomsPage_maintenance"),
            value: stats.maintenance,
            color: "#a16207",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "var(--bg-surface)",
              borderRadius: 12,
              padding: "16px 20px",
              border: "1px solid var(--border)",
              borderLeft: `4px solid ${s.color}`,
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>
              {s.value}
            </div>
            <div
              style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <input
            style={{
              padding: "9px 14px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              fontSize: 14,
              minWidth: 220,
              outline: "none",
              background: "var(--bg-surface)",
              color: "var(--text-primary)",
            }}
            placeholder={t("roomsPage_searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            style={{
              padding: "9px 14px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              fontSize: 14,
              outline: "none",
              background: "var(--bg-surface)",
              color: "var(--text-primary)",
            }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">{t("roomsPage_allStatuses")}</option>
            <option value="available">✅ {t("rm_statusAvailable")}</option>
            <option value="occupied">🔴 {t("rm_statusOccupied")}</option>
            <option value="maintenance">🛠️ {t("rm_statusMaintenance")}</option>
            <option value="reserved">🔵 {t("rm_statusReserved")}</option>
          </select>
        </div>
        <PermissionWrapper permission="rooms:add">
          <button
            onClick={openAdd}
            style={{
              padding: "10px 22px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {t("roomsPage_addRoom")}
          </button>
        </PermissionWrapper>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            color: "var(--text-muted)",
          }}
        >
          <div style={{ fontSize: 48 }}>🏨</div>
          <div style={{ marginTop: 12, fontSize: 16 }}>
            {t("roomsPage_noRooms")}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {filtered.map((r) => (
            <div
              key={r._id}
              style={{
                background: "var(--bg-surface)",
                borderRadius: 14,
                border: "1px solid var(--border)",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                transition: "box-shadow 0.2s",
              }}
            >
              {/* Card image */}
              {r.thumbnail || (r.images && r.images[0]) ? (
                <img
                  src={r.thumbnail || r.images[0]}
                  alt={`Room ${r.number}`}
                  style={{ width: "100%", height: 160, objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: 160,
                    background: "linear-gradient(135deg, #1e3a8a, #5b21b6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 40,
                  }}
                >
                  {TYPE_ICON[r.type] || "🛏️"}
                </div>
              )}
              <div style={{ padding: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 17,
                        color: "#1e293b",
                      }}
                    >
                      Room #{r.number}
                      {r.name ? ` — ${r.name}` : ""}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--text-muted)",
                        marginTop: 2,
                      }}
                    >
                      {r.category || r.type}{" "}
                      {r.floor ? `· Floor ${r.floor}` : ""}
                    </div>
                  </div>
                  <span
                    style={{
                      ...(STATUS_STYLE[r.status] || STATUS_STYLE.available),
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {(r.status || "available").charAt(0).toUpperCase() +
                      (r.status || "available").slice(1)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    marginBottom: 12,
                  }}
                >
                  {r.capacity && (
                    <span>
                      👥 {r.capacity} {t("roomsPage_guests")}
                    </span>
                  )}
                  {r.sizeM2 && <span>📐 {r.sizeM2} m²</span>}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "var(--brand)",
                    }}
                  >
                    {r.currency || "USD"} {r.pricePerNight || 0}
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        fontWeight: 400,
                      }}
                    >
                      /{t("bk_night")}
                    </span>
                    {r.discount > 0 && (
                      <span
                        style={{
                          marginLeft: 6,
                          fontSize: 11,
                          background: "rgba(161,98,7,0.15)",
                          color: "#d97706",
                          borderRadius: 10,
                          padding: "2px 7px",
                        }}
                      >
                        -{r.discount}%
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <PermissionWrapper permission="rooms:edit">
                      <button
                        onClick={() => openEdit(r)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 7,
                          border: "1px solid var(--border)",
                          background: "var(--bg-raised)",
                          cursor: "pointer",
                          fontSize: 13,
                          color: "var(--brand)",
                          fontWeight: 600,
                        }}
                      >
                        {t("edit")}
                      </button>
                    </PermissionWrapper>
                    <PermissionWrapper permission="rooms:delete">
                      <button
                        onClick={() => setConfirmDelete(r)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 7,
                          border: "none",
                          background: "rgba(220,38,38,0.12)",
                          cursor: "pointer",
                          fontSize: 13,
                          color: "var(--danger)",
                          fontWeight: 600,
                        }}
                      >
                        {t("delete")}
                      </button>
                    </PermissionWrapper>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
          }}
        >
          <div
            style={{
              background: "var(--bg-surface)",
              borderRadius: 14,
              padding: 28,
              maxWidth: 380,
              width: "90%",
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 10,
                color: "var(--text-primary)",
              }}
            >
              {t("roomsPage_deleteRoomTitle")} #{confirmDelete.number}?
            </div>
            <div
              style={{
                fontSize: 14,
                color: "var(--text-muted)",
                marginBottom: 20,
              }}
            >
              {t("roomsPage_deleteCannotUndo")}
            </div>
            <div
              style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
            >
              <button
                onClick={() => setConfirmDelete(null)}
                style={{
                  padding: "9px 18px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--bg-surface)",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleDeleteConfirm}
                style={{
                  padding: "9px 18px",
                  borderRadius: 8,
                  border: "none",
                  background: "#dc2626",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
