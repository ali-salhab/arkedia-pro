import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useGetRoomsQuery } from "../store/services/api";

const EMPTY_FORM = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  nationality: "",
  adultsCount: 1,
  childrenCount: 0,
  bookingType: "hotel",
  checkIn: "",
  checkOut: "",
  roomId: "",
  roomNumber: "",
  pricePerNight: 0,
  discount: 0,
  taxRate: 0,
  currency: "USD",
  paymentMethod: "cash",
  paymentStatus: "unpaid",
  paidAmount: 0,
  status: "pending",
  source: "direct",
  specialRequests: "",
  internalNotes: "",
  customerNotes: "",
};

const inp = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  padding: "9px 12px",
  fontSize: 14,
  color: "#1e293b",
  width: "100%",
  outline: "none",
};
const lbl = {
  display: "block",
  fontWeight: 600,
  fontSize: 12,
  color: "#64748b",
  marginBottom: 4,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};
const sectionTitle = {
  fontSize: 13,
  fontWeight: 700,
  color: "#334155",
  marginBottom: 12,
  paddingBottom: 6,
  borderBottom: "1px solid #f1f5f9",
  marginTop: 4,
};

const STATUS_COLORS = {
  pending: { bg: "#fef9c3", color: "#a16207" },
  confirmed: { bg: "#dcfce7", color: "#16a34a" },
  checked_in: { bg: "#dbeafe", color: "#1d4ed8" },
  checked_out: { bg: "#f3e8ff", color: "#7c3aed" },
  cancelled: { bg: "#fee2e2", color: "#dc2626" },
  no_show: { bg: "#f1f5f9", color: "#64748b" },
};

const PAYMENT_STATUS_COLORS = {
  unpaid: { bg: "#fee2e2", color: "#dc2626" },
  partial: { bg: "#fef9c3", color: "#a16207" },
  paid: { bg: "#dcfce7", color: "#16a34a" },
  refunded: { bg: "#dbeafe", color: "#1d4ed8" },
};

function generateRef() {
  return (
    "BK-" +
    Date.now().toString(36).toUpperCase() +
    "-" +
    Math.random().toString(36).substr(2, 4).toUpperCase()
  );
}

function nightsBetween(ci, co) {
  if (!ci || !co) return 0;
  const diff = new Date(co) - new Date(ci);
  return Math.max(0, Math.round(diff / 86400000));
}

export default function BookingFormModal({
  open,
  onClose,
  onSave,
  booking = null,
  pageMode = false,
}) {
  const { dir, t } = useLanguage();
  const isRtl = dir === "rtl";
  const [form, setForm] = useState(EMPTY_FORM);
  const [tab, setTab] = useState("guest");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { data: rooms = [] } = useGetRoomsQuery();
  const availableRooms = rooms.filter(
    (r) => r.status === "available" || (booking && r._id === booking.roomId),
  );

  useEffect(() => {
    if (booking) {
      setForm({
        ...EMPTY_FORM,
        ...booking,
        checkIn: booking.checkIn ? booking.checkIn.slice(0, 10) : "",
        checkOut: booking.checkOut ? booking.checkOut.slice(0, 10) : "",
      });
    } else {
      setForm({ ...EMPTY_FORM });
    }
    setTab("guest");
    setError("");
  }, [booking, open]);

  if (!open && !pageMode) return null;

  const set = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const nights = nightsBetween(form.checkIn, form.checkOut);
  const baseTotal = Number(form.pricePerNight || 0) * nights;
  const discountAmt = baseTotal * (Number(form.discount || 0) / 100);
  const subtotal = baseTotal - discountAmt;
  const taxAmt = subtotal * (Number(form.taxRate || 0) / 100);
  const grandTotal = subtotal + taxAmt;
  const balance = grandTotal - Number(form.paidAmount || 0);

  const handleRoomSelect = (e) => {
    const rid = e.target.value;
    const rm = rooms.find((r) => r._id === rid);
    setForm((p) => ({
      ...p,
      roomId: rid,
      roomNumber: rm?.number || "",
      pricePerNight: rm?.pricePerNight || 0,
      currency: rm?.currency || p.currency,
    }));
  };

  const handleSubmit = async () => {
    if (!form.customerName.trim()) {
      setError(t("bk_errName"));
      setTab("guest");
      return;
    }
    if (!form.checkIn) {
      setError(t("bk_errCheckIn"));
      setTab("stay");
      return;
    }
    if (!form.checkOut) {
      setError(t("bk_errCheckOut"));
      setTab("stay");
      return;
    }
    if (new Date(form.checkOut) <= new Date(form.checkIn)) {
      setError(t("bk_errDates"));
      setTab("stay");
      return;
    }

    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        reference: booking?.reference || generateRef(),
        bookingDate: booking?.bookingDate || new Date().toISOString(),
        nights,
        total: grandTotal,
        adultsCount: Number(form.adultsCount),
        childrenCount: Number(form.childrenCount),
        pricePerNight: Number(form.pricePerNight),
        discount: Number(form.discount),
        taxRate: Number(form.taxRate),
        paidAmount: Number(form.paidAmount),
      };
      await onSave(payload);
      onClose();
    } catch (e) {
      setError(e?.data?.message || t("bk_errSave"));
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: "guest", label: `👤 ${t("bk_tabGuest")}` },
    { id: "stay", label: `🛏️ ${t("bk_tabStay")}` },
    { id: "payment", label: `💳 ${t("bk_tabPayment")}` },
    { id: "notes", label: `📝 ${t("bk_tabNotes")}` },
  ];

  const tabBtn = (id) => ({
    padding: "8px 16px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    background: tab === id ? "#3b82f6" : "#f1f5f9",
    color: tab === id ? "#fff" : "#64748b",
    transition: "all 0.15s",
  });

  const gridTwo = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 };

  const innerContent = (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        width: "100%",
        maxWidth: 700,
        maxHeight: pageMode ? "none" : "92vh",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
        direction: isRtl ? "rtl" : "ltr",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f766e, #1d4ed8)",
          borderRadius: "16px 16px 0 0",
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>
            {booking ? `✏️ ${t("bk_editTitle")}` : `📅 ${t("bk_addTitle")}`}
          </div>
          {booking?.reference && (
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.7)",
                marginTop: 2,
                fontFamily: "monospace",
              }}
            >
              {booking.reference}
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {form.status && (
            <span
              style={{
                ...STATUS_COLORS[form.status],
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {form.status.replace("_", " ").toUpperCase()}
            </span>
          )}
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              borderRadius: 8,
              width: 36,
              height: 36,
              cursor: "pointer",
              color: "#fff",
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "14px 24px 0",
          background: "#fafafa",
          borderBottom: "1px solid #e2e8f0",
          flexShrink: 0,
          flexWrap: "wrap",
        }}
      >
        {TABS.map((t) => (
          <button key={t.id} style={tabBtn(t.id)} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={{ overflowY: "auto", padding: "20px 24px", flex: 1 }}>
        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 8,
              padding: "10px 14px",
              color: "#dc2626",
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {tab === "guest" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={sectionTitle}>{t("bk_secGuestInfo")}</p>
            <div>
              <label style={lbl}>{t("bk_fieldName")}</label>
              <input
                style={inp}
                value={form.customerName}
                onChange={(e) => set("customerName", e.target.value)}
                placeholder="e.g. John Smith"
              />
            </div>
            <div style={gridTwo}>
              <div>
                <label style={lbl}>{t("bk_fieldEmail")}</label>
                <input
                  style={inp}
                  type="email"
                  value={form.customerEmail}
                  onChange={(e) => set("customerEmail", e.target.value)}
                  placeholder="john@email.com"
                />
              </div>
              <div>
                <label style={lbl}>{t("bk_fieldPhone")}</label>
                <input
                  style={inp}
                  type="tel"
                  value={form.customerPhone}
                  onChange={(e) => set("customerPhone", e.target.value)}
                  placeholder="+1 555 000 0000"
                />
              </div>
            </div>
            <div style={gridTwo}>
              <div>
                <label style={lbl}>{t("bk_fieldNationality")}</label>
                <input
                  style={inp}
                  value={form.nationality}
                  onChange={(e) => set("nationality", e.target.value)}
                />
              </div>
              <div>
                <label style={lbl}>{t("bk_fieldSource")}</label>
                <select
                  style={inp}
                  value={form.source}
                  onChange={(e) => set("source", e.target.value)}
                >
                  <option value="direct">🏨 {t("bk_srcDirect")}</option>
                  <option value="online">🌐 {t("bk_srcOnline")}</option>
                  <option value="phone">📞 {t("bk_srcPhone")}</option>
                  <option value="walk_in">🚶 {t("bk_srcWalkIn")}</option>
                  <option value="agency">🏢 {t("bk_srcAgency")}</option>
                </select>
              </div>
            </div>
            <p style={sectionTitle}>{t("bk_secGuestCount")}</p>
            <div style={gridTwo}>
              <div>
                <label style={lbl}>{t("bk_fieldAdults")}</label>
                <input
                  style={inp}
                  type="number"
                  min="1"
                  max="20"
                  value={form.adultsCount}
                  onChange={(e) => set("adultsCount", e.target.value)}
                />
              </div>
              <div>
                <label style={lbl}>{t("bk_fieldChildren")}</label>
                <input
                  style={inp}
                  type="number"
                  min="0"
                  max="10"
                  value={form.childrenCount}
                  onChange={(e) => set("childrenCount", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── STAY TAB ── */}
        {tab === "stay" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={sectionTitle}>{t("bk_secStay")}</p>
            <div style={gridTwo}>
              <div>
                <label style={lbl}>{t("bk_fieldBookingType")}</label>
                <select
                  style={inp}
                  value={form.bookingType}
                  onChange={(e) => set("bookingType", e.target.value)}
                >
                  <option value="hotel">🏨 {t("bk_typeHotel")}</option>
                  <option value="restaurant">
                    🍽️ {t("bk_typeRestaurant")}
                  </option>
                  <option value="activity">🎯 {t("bk_typeActivity")}</option>
                </select>
              </div>
              <div>
                <label style={lbl}>{t("bk_fieldBookingStatus")}</label>
                <select
                  style={inp}
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                >
                  <option value="pending">🟡 {t("bk_statusPending")}</option>
                  <option value="confirmed">
                    ✅ {t("bk_statusConfirmed")}
                  </option>
                  <option value="checked_in">
                    🔵 {t("bk_statusCheckedIn")}
                  </option>
                  <option value="checked_out">
                    🟣 {t("bk_statusCheckedOut")}
                  </option>
                  <option value="cancelled">
                    🔴 {t("bk_statusCancelled")}
                  </option>
                  <option value="no_show">⚫ {t("bk_statusNoShow")}</option>
                </select>
              </div>
            </div>
            <div style={gridTwo}>
              <div>
                <label style={lbl}>{t("bk_fieldCheckIn")}</label>
                <input
                  style={inp}
                  type="date"
                  value={form.checkIn}
                  onChange={(e) => set("checkIn", e.target.value)}
                />
              </div>
              <div>
                <label style={lbl}>{t("bk_fieldCheckOut")}</label>
                <input
                  style={inp}
                  type="date"
                  value={form.checkOut}
                  min={form.checkIn || undefined}
                  onChange={(e) => set("checkOut", e.target.value)}
                />
              </div>
            </div>

            {nights > 0 && (
              <div
                style={{
                  background: "#eff6ff",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "#1d4ed8",
                  fontWeight: 600,
                }}
              >
                📅 {t("bk_duration")}: {nights}{" "}
                {nights === 1 ? t("bk_night") : t("bk_nights")}
              </div>
            )}

            <p style={sectionTitle}>{t("bk_secRoom")}</p>
            <div>
              <label style={lbl}>{t("bk_fieldSelectRoom")}</label>
              <select
                style={inp}
                value={form.roomId}
                onChange={handleRoomSelect}
              >
                <option value="">-- {t("bk_noRoomAssigned")} --</option>
                {availableRooms.map((r) => (
                  <option key={r._id} value={r._id}>
                    #{r.number} {r.name ? `— ${r.name}` : ""} ({r.type}) —{" "}
                    {r.currency} {r.pricePerNight}/{t("bk_night")}
                  </option>
                ))}
              </select>
            </div>
            {form.roomId && (
              <div>
                <label style={lbl}>{t("bk_fieldPricePerNight")}</label>
                <div style={{ position: "relative" }}>
                  <input
                    style={{ ...inp, paddingLeft: 36 }}
                    type="number"
                    min="0"
                    value={form.pricePerNight}
                    onChange={(e) => set("pricePerNight", e.target.value)}
                  />
                  <span
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                      fontSize: 14,
                    }}
                  >
                    $
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PAYMENT TAB ── */}
        {tab === "payment" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={sectionTitle}>{t("bk_secPayment")}</p>
            <div style={gridTwo}>
              <div>
                <label style={lbl}>{t("bk_fieldPaymentMethod")}</label>
                <select
                  style={inp}
                  value={form.paymentMethod}
                  onChange={(e) => set("paymentMethod", e.target.value)}
                >
                  <option value="cash">💵 {t("bk_pmCash")}</option>
                  <option value="card">💳 {t("bk_pmCard")}</option>
                  <option value="bank_transfer">🏦 {t("bk_pmBank")}</option>
                  <option value="online">🌐 {t("bk_pmOnline")}</option>
                  <option value="other">🔄 {t("bk_pmOther")}</option>
                </select>
              </div>
              <div>
                <label style={lbl}>{t("bk_fieldPaymentStatus")}</label>
                <select
                  style={inp}
                  value={form.paymentStatus}
                  onChange={(e) => set("paymentStatus", e.target.value)}
                >
                  <option value="unpaid">🔴 {t("bk_psUnpaid")}</option>
                  <option value="partial">🟡 {t("bk_psPartial")}</option>
                  <option value="paid">🟢 {t("bk_psPaid")}</option>
                  <option value="refunded">🔵 {t("bk_psRefunded")}</option>
                </select>
              </div>
            </div>
            <div style={gridTwo}>
              <div>
                <label style={lbl}>{t("bk_fieldDiscount")}</label>
                <input
                  style={inp}
                  type="number"
                  min="0"
                  max="100"
                  value={form.discount}
                  onChange={(e) => set("discount", e.target.value)}
                />
              </div>
              <div>
                <label style={lbl}>{t("bk_fieldTaxRate")}</label>
                <input
                  style={inp}
                  type="number"
                  min="0"
                  max="100"
                  value={form.taxRate}
                  onChange={(e) => set("taxRate", e.target.value)}
                />
              </div>
            </div>
            <div style={{ maxWidth: 260 }}>
              <label style={lbl}>
                {t("bk_fieldPaid")} ({form.currency})
              </label>
              <input
                style={inp}
                type="number"
                min="0"
                value={form.paidAmount}
                onChange={(e) => set("paidAmount", e.target.value)}
              />
            </div>

            {/* Invoice summary */}
            <div
              style={{
                background: "linear-gradient(135deg, #f0fdf4, #eff6ff)",
                border: "1px solid #bbf7d0",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#15803d",
                  marginBottom: 12,
                }}
              >
                🧾 {t("bk_summaryTitle")}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 7,
                  fontSize: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#64748b",
                  }}
                >
                  <span>{t("bk_summaryNightsRate")}</span>
                  <span>
                    {nights} × {form.currency}{" "}
                    {Number(form.pricePerNight).toFixed(2)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#64748b",
                  }}
                >
                  <span>{t("bk_summarySubtotal")}</span>
                  <span>
                    {form.currency} {baseTotal.toFixed(2)}
                  </span>
                </div>
                {form.discount > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      color: "#ef4444",
                    }}
                  >
                    <span>
                      {t("bk_summaryDiscount")} ({form.discount}%)
                    </span>
                    <span>
                      - {form.currency} {discountAmt.toFixed(2)}
                    </span>
                  </div>
                )}
                {form.taxRate > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      color: "#64748b",
                    }}
                  >
                    <span>
                      {t("bk_summaryTax")} ({form.taxRate}%)
                    </span>
                    <span>
                      + {form.currency} {taxAmt.toFixed(2)}
                    </span>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: 700,
                    fontSize: 16,
                    color: "#15803d",
                    borderTop: "1px solid #d1fae5",
                    paddingTop: 8,
                  }}
                >
                  <span>{t("bk_summaryTotal")}</span>
                  <span>
                    {form.currency} {grandTotal.toFixed(2)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#64748b",
                  }}
                >
                  <span>{t("bk_summaryPaid")}</span>
                  <span style={{ color: "#16a34a" }}>
                    {form.currency} {Number(form.paidAmount).toFixed(2)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: 700,
                    color: balance > 0 ? "#dc2626" : "#16a34a",
                    borderTop: "1px solid #e2e8f0",
                    paddingTop: 6,
                  }}
                >
                  <span>{t("bk_summaryBalance")}</span>
                  <span>
                    {form.currency} {balance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── NOTES TAB ── */}
        {tab === "notes" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={sectionTitle}>{t("bk_secNotes")}</p>
            <div>
              <label style={lbl}>{t("bk_fieldSpecialReq")}</label>
              <textarea
                style={{ ...inp, height: 90, resize: "vertical" }}
                value={form.specialRequests}
                onChange={(e) => set("specialRequests", e.target.value)}
                placeholder={t("bk_fieldSpecialReqPlaceholder")}
              />
            </div>
            <div>
              <label style={lbl}>{t("bk_fieldGuestNotes")}</label>
              <textarea
                style={{ ...inp, height: 80, resize: "vertical" }}
                value={form.customerNotes}
                onChange={(e) => set("customerNotes", e.target.value)}
                placeholder={t("bk_fieldGuestNotesPlaceholder")}
              />
            </div>
            <div>
              <label style={lbl}>{t("bk_fieldInternalNotes")}</label>
              <textarea
                style={{ ...inp, height: 80, resize: "vertical" }}
                value={form.internalNotes}
                onChange={(e) => set("internalNotes", e.target.value)}
                placeholder={t("bk_fieldInternalNotesPlaceholder")}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "14px 24px",
          background: "#f8fafc",
          borderTop: "1px solid #e2e8f0",
          borderRadius: "0 0 16px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: 12, color: "#94a3b8" }}>
          {nights > 0 && form.pricePerNight > 0 && (
            <span>
              💰 {t("bk_footerTotal")}:{" "}
              <strong style={{ color: "#15803d" }}>
                {form.currency} {grandTotal.toFixed(2)}
              </strong>
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "#fff",
              color: "#64748b",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              padding: "10px 28px",
              borderRadius: 8,
              border: "none",
              background: saving
                ? "#6ee7b7"
                : "linear-gradient(135deg, #0f766e, #1d4ed8)",
              color: "#fff",
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {saving
              ? `⏳ ${t("saving")}`
              : booking
                ? `💾 ${t("bk_updateBtn")}`
                : `✅ ${t("bk_confirmBtn")}`}
          </button>
        </div>
      </div>
    </div>
  );

  if (pageMode) return innerContent;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {innerContent}
    </div>
  );
}
