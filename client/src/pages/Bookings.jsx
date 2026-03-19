import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import LoadingScreen from "../components/LoadingScreen";
import {
  useGetBookingsQuery,
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
} from "../store/services/api";
import PermissionWrapper from "../components/PermissionWrapper";

const STATUS_STYLE = {
  pending: { background: "rgba(161,98,7,0.15)", color: "#d97706" },
  confirmed: { background: "rgba(22,163,74,0.15)", color: "#16a34a" },
  checked_in: { background: "rgba(29,78,216,0.15)", color: "#3b82f6" },
  checked_out: { background: "rgba(124,58,237,0.15)", color: "#8b5cf6" },
  cancelled: { background: "rgba(220,38,38,0.15)", color: "#ef4444" },
  no_show: { background: "rgba(100,116,139,0.15)", color: "#94a3b8" },
};

const PAYMENT_STYLE = {
  unpaid: { background: "rgba(220,38,38,0.15)", color: "#ef4444" },
  partial: { background: "rgba(161,98,7,0.15)", color: "#d97706" },
  paid: { background: "rgba(22,163,74,0.15)", color: "#16a34a" },
  refunded: { background: "rgba(29,78,216,0.15)", color: "#3b82f6" },
};

function fmt(d) {
  return d
    ? new Date(d).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
}

export default function BookingsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { data: bookings = [], isLoading } = useGetBookingsQuery();
  const [createBooking] = useCreateBookingMutation();
  const [updateBooking] = useUpdateBookingMutation();
  const [deleteBooking] = useDeleteBookingMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editBooking, setEditBooking] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (b.customerName || "").toLowerCase().includes(q) ||
      (b.customerEmail || "").toLowerCase().includes(q) ||
      (b.reference || "").toLowerCase().includes(q) ||
      (b.roomNumber || "").toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    const matchPayment =
      filterPayment === "all" || b.paymentStatus === filterPayment;
    return matchSearch && matchStatus && matchPayment;
  });

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    checkedIn: bookings.filter((b) => b.status === "checked_in").length,
    unpaid: bookings.filter(
      (b) => b.paymentStatus === "unpaid" || b.paymentStatus === "partial",
    ).length,
  };

  const handleSave = async (data) => {
    if (data._id) {
      await updateBooking({ id: data._id, ...data }).unwrap();
    } else {
      await createBooking(data).unwrap();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    await deleteBooking(confirmDelete._id).unwrap();
    setConfirmDelete(null);
  };

  const openAdd = () => {
    navigate("/bookings/new", { state: { backTo: "/bookings" } });
  };
  const openEdit = (b) => {
    navigate(`/bookings/${b._id}/edit`, {
      state: { booking: b, backTo: "/bookings" },
    });
  };

  if (isLoading)
    return (
      <LoadingScreen
        label={t("loadingBookings")}
        statCount={4}
        tableRows={6}
        tableCols={8}
      />
    );

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      {/* Stats */}
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
            label: t("bkPage_totalBookings"),
            value: stats.total,
            color: "#3b82f6",
          },
          {
            label: t("bkPage_confirmed"),
            value: stats.confirmed,
            color: "#16a34a",
          },
          {
            label: t("bkPage_checkedIn"),
            value: stats.checkedIn,
            color: "#1d4ed8",
          },
          {
            label: t("bkPage_pendingPayment"),
            value: stats.unpaid,
            color: "#dc2626",
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
            placeholder={t("bkPage_searchPlaceholder")}
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
            <option value="all">{t("bkPage_allStatuses")}</option>
            <option value="pending">🟡 {t("bk_statusPending")}</option>
            <option value="confirmed">✅ {t("bk_statusConfirmed")}</option>
            <option value="checked_in">🔵 {t("bk_statusCheckedIn")}</option>
            <option value="checked_out">🟣 {t("bk_statusCheckedOut")}</option>
            <option value="cancelled">🔴 {t("bk_statusCancelled")}</option>
            <option value="no_show">⚫ {t("bk_statusNoShow")}</option>
          </select>
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
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
          >
            <option value="all">{t("bkPage_allPayments")}</option>
            <option value="unpaid">🔴 {t("bk_psUnpaid")}</option>
            <option value="partial">🟡 {t("bk_psPartial")}</option>
            <option value="paid">🟢 {t("bk_psPaid")}</option>
            <option value="refunded">🔵 {t("bk_psRefunded")}</option>
          </select>
        </div>
        <PermissionWrapper permission="bookings:add">
          <button
            onClick={openAdd}
            style={{
              padding: "10px 22px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #0f766e, #1d4ed8)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {t("bkPage_newBooking")}
          </button>
        </PermissionWrapper>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
          <div style={{ fontSize: 48 }}>📋</div>
          <div style={{ marginTop: 12, fontSize: 16 }}>
            {t("bkPage_noBookings")}
          </div>
        </div>
      ) : (
        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: 14,
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
          >
            <thead>
              <tr
                style={{
                  background: "var(--bg-raised)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {[
                  t("bkPage_colRef"),
                  t("bkPage_colGuest"),
                  t("bkPage_colRoom"),
                  t("bkPage_colCheckIn"),
                  t("bkPage_colCheckOut"),
                  t("bkPage_colTotal"),
                  t("bkPage_colStatus"),
                  t("bkPage_colPayment"),
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 14px",
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: 12,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr
                  key={b._id}
                  style={{
                    borderBottom: "1px solid var(--border-soft)",
                    background:
                      i % 2 === 0 ? "var(--bg-surface)" : "var(--bg-raised)",
                  }}
                >
                  <td
                    style={{
                      padding: "12px 14px",
                      fontFamily: "monospace",
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      textAlign: "center",
                    }}
                  >
                    {b.reference || "—"}
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    <div
                      style={{ fontWeight: 600, color: "var(--text-primary)" }}
                    >
                      {b.customerName}
                    </div>
                    {b.customerEmail && (
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {b.customerEmail}
                      </div>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      color: "var(--text-secondary)",
                      textAlign: "center",
                    }}
                  >
                    {b.roomNumber ? `#${b.roomNumber}` : "—"}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      color: "var(--text-secondary)",
                      whiteSpace: "nowrap",
                      textAlign: "center",
                    }}
                  >
                    {fmt(b.checkIn)}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      color: "var(--text-secondary)",
                      whiteSpace: "nowrap",
                      textAlign: "center",
                    }}
                  >
                    {fmt(b.checkOut)}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      textAlign: "center",
                    }}
                  >
                    {b.currency || "USD"} {(b.total || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    <span
                      style={{
                        ...(STATUS_STYLE[b.status] || STATUS_STYLE.pending),
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {(b.status || "pending").replace("_", " ").toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    <span
                      style={{
                        ...(PAYMENT_STYLE[b.paymentStatus] ||
                          PAYMENT_STYLE.unpaid),
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {(b.paymentStatus || "unpaid").toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <PermissionWrapper permission="bookings:edit">
                        <button
                          onClick={() => openEdit(b)}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 6,
                            border: "1px solid var(--border)",
                            background: "var(--bg-raised)",
                            cursor: "pointer",
                            fontSize: 12,
                            color: "var(--brand)",
                            fontWeight: 600,
                          }}
                        >
                          {t("edit")}
                        </button>
                      </PermissionWrapper>
                      <PermissionWrapper permission="bookings:delete">
                        <button
                          onClick={() => setConfirmDelete(b)}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 6,
                            border: "none",
                            background: "rgba(220, 38, 38, 0.12)",
                            cursor: "pointer",
                            fontSize: 12,
                            color: "var(--danger)",
                            fontWeight: 600,
                          }}
                        >
                          {t("delete")}
                        </button>
                      </PermissionWrapper>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              border: "1px solid var(--border)",
              maxWidth: 380,
              width: "90%",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>
              {t("bkPage_deleteBookingTitle")}
            </div>
            <div
              style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                marginBottom: 6,
              }}
            >
              {confirmDelete.customerName}
            </div>
            {confirmDelete.reference && (
              <div
                style={{
                  fontSize: 12,
                  fontFamily: "monospace",
                  color: "var(--text-muted)",
                  marginBottom: 18,
                }}
              >
                {confirmDelete.reference}
              </div>
            )}
            <div
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
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
                  background: "var(--bg-raised)",
                  color: "var(--text-primary)",
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
