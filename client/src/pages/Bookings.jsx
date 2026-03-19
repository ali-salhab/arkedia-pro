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
  pending: { background: "#fef9c3", color: "#a16207" },
  confirmed: { background: "#dcfce7", color: "#16a34a" },
  checked_in: { background: "#dbeafe", color: "#1d4ed8" },
  checked_out: { background: "#f3e8ff", color: "#7c3aed" },
  cancelled: { background: "#fee2e2", color: "#dc2626" },
  no_show: { background: "#f1f5f9", color: "#64748b" },
};

const PAYMENT_STYLE = {
  unpaid: { background: "#fee2e2", color: "#dc2626" },
  partial: { background: "#fef9c3", color: "#a16207" },
  paid: { background: "#dcfce7", color: "#16a34a" },
  refunded: { background: "#dbeafe", color: "#1d4ed8" },
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
            bg: "#eff6ff",
          },
          {
            label: t("bkPage_confirmed"),
            value: stats.confirmed,
            color: "#16a34a",
            bg: "#f0fdf4",
          },
          {
            label: t("bkPage_checkedIn"),
            value: stats.checkedIn,
            color: "#1d4ed8",
            bg: "#dbeafe",
          },
          {
            label: t("bkPage_pendingPayment"),
            value: stats.unpaid,
            color: "#dc2626",
            bg: "#fef2f2",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: s.bg,
              borderRadius: 12,
              padding: "16px 20px",
              borderLeft: `4px solid ${s.color}`,
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>
              {s.value}
            </div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
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
              border: "1px solid #e2e8f0",
              fontSize: 14,
              minWidth: 220,
              outline: "none",
            }}
            placeholder={t("bkPage_searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            style={{
              padding: "9px 14px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              fontSize: 14,
              outline: "none",
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
              border: "1px solid #e2e8f0",
              fontSize: 14,
              outline: "none",
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
            background: "#fff",
            borderRadius: 14,
            border: "1px solid #e2e8f0",
            overflow: "hidden",
          }}
        >
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
          >
            <thead>
              <tr
                style={{
                  background: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
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
                      textAlign: "left",
                      fontWeight: 700,
                      fontSize: 12,
                      color: "#64748b",
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
                    borderBottom: "1px solid #f1f5f9",
                    background: i % 2 === 0 ? "#fff" : "#fafafa",
                  }}
                >
                  <td
                    style={{
                      padding: "12px 14px",
                      fontFamily: "monospace",
                      fontSize: 13,
                      color: "#475569",
                    }}
                  >
                    {b.reference || "—"}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontWeight: 600, color: "#1e293b" }}>
                      {b.customerName}
                    </div>
                    {b.customerEmail && (
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>
                        {b.customerEmail}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "12px 14px", color: "#64748b" }}>
                    {b.roomNumber ? `#${b.roomNumber}` : "—"}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      color: "#64748b",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {fmt(b.checkIn)}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      color: "#64748b",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {fmt(b.checkOut)}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontWeight: 700,
                      color: "#1e293b",
                    }}
                  >
                    {b.currency || "USD"} {(b.total || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
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
                  <td style={{ padding: "12px 14px" }}>
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
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <PermissionWrapper permission="bookings:edit">
                        <button
                          onClick={() => openEdit(b)}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 6,
                            border: "1px solid #e2e8f0",
                            background: "#f8fafc",
                            cursor: "pointer",
                            fontSize: 12,
                            color: "#1d4ed8",
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
                            background: "#fef2f2",
                            cursor: "pointer",
                            fontSize: 12,
                            color: "#dc2626",
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
              background: "#fff",
              borderRadius: 14,
              padding: 28,
              maxWidth: 380,
              width: "90%",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>
              {t("bkPage_deleteBookingTitle")}
            </div>
            <div style={{ fontSize: 14, color: "#64748b", marginBottom: 6 }}>
              {confirmDelete.customerName}
            </div>
            {confirmDelete.reference && (
              <div
                style={{
                  fontSize: 12,
                  fontFamily: "monospace",
                  color: "#94a3b8",
                  marginBottom: 18,
                }}
              >
                {confirmDelete.reference}
              </div>
            )}
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
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
                  border: "1px solid #e2e8f0",
                  background: "#fff",
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
