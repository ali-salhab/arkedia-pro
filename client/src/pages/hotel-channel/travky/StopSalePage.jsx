import { useState } from "react";
import {
  Ban,
  Plus,
  Search,
  Trash2,
  Eye,
  X,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { useChannelSection } from "../../../hooks/useChannelSection";
import DeleteConfirmModal from "../../../components/DeleteConfirmModal";

const STOP_SALE_REASONS = [
  "Maintenance",
  "Renovation",
  "Full Booking",
  "Out of Service",
  "Other",
];

const INITIAL_STOP_SALES = [
  {
    id: "1",
    roomName: "DBL Room",
    from: "2026-04-01",
    to: "2026-04-05",
    reason: "Maintenance",
    notes: "",
  },
  {
    id: "2",
    roomName: "SGL Room",
    from: "2026-04-10",
    to: "2026-04-12",
    reason: "Renovation",
    notes: "Annual painting",
  },
];

const EMPTY_FORM = {
  roomName: "",
  from: "",
  to: "",
  reason: "Maintenance",
  notes: "",
};

function validate(form) {
  if (!form.roomName.trim()) return "اسم الغرفة مطلوب";
  if (!form.from) return "تاريخ البداية مطلوب";
  if (!form.to) return "تاريخ النهاية مطلوب";
  if (form.from > form.to) return "تاريخ النهاية يجب أن يكون بعد تاريخ البداية";
  return null;
}

function StatusBadge({ from, to }) {
  const now = new Date().toISOString().slice(0, 10);
  if (from > now)
    return (
      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-yellow-50 text-yellow-700">
        قادم
      </span>
    );
  if (to < now)
    return (
      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
        منتهي
      </span>
    );
  return (
    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-600">
      نشط
    </span>
  );
}

export default function StopSalePage() {
  const [stopSales, setStopSales] = useChannelSection(
    "stopSales",
    INITIAL_STOP_SALES,
  );
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null | "add" | "view"
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState("");

  const filtered = stopSales.filter(
    (s) =>
      s.roomName.toLowerCase().includes(search.toLowerCase()) ||
      s.reason.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setError("");
    setModal("add");
  };

  const openView = (s) => {
    setForm({ ...s });
    setEditId(s.id);
    setModal("view");
  };

  const closeModal = () => {
    setModal(null);
    setError("");
  };

  const handleSave = () => {
    const err = validate(form);
    if (err) return setError(err);
    if (editId) {
      setStopSales((prev) =>
        prev.map((s) => (s.id === editId ? { ...form, id: editId } : s)),
      );
    } else {
      setStopSales((prev) => [...prev, { ...form, id: Date.now().toString() }]);
    }
    closeModal();
  };

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="page-shell" dir="rtl">
      {/* Delete confirm */}
      <DeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          setStopSales((prev) => prev.filter((s) => s.id !== deleteTarget));
          setDeleteTarget(null);
        }}
      />

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="w-full max-w-lg rounded-2xl p-6 shadow-xl"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2
                className="text-lg font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {modal === "view" ? "تفاصيل إيقاف البيع" : "إضافة إيقاف بيع"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Room name */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  اسم الغرفة
                </label>
                {modal === "view" ? (
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {form.roomName}
                  </p>
                ) : (
                  <input
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{
                      backgroundColor: "var(--bg-raised)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="مثال: DBL Room"
                    value={form.roomName}
                    onChange={set("roomName")}
                  />
                )}
              </div>

              {/* Date range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    من
                  </label>
                  {modal === "view" ? (
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {form.from}
                    </p>
                  ) : (
                    <input
                      type="date"
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{
                        backgroundColor: "var(--bg-raised)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                      }}
                      value={form.from}
                      onChange={set("from")}
                    />
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    إلى
                  </label>
                  {modal === "view" ? (
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {form.to}
                    </p>
                  ) : (
                    <input
                      type="date"
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{
                        backgroundColor: "var(--bg-raised)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                      }}
                      value={form.to}
                      onChange={set("to")}
                    />
                  )}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  السبب
                </label>
                {modal === "view" ? (
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {form.reason}
                  </p>
                ) : (
                  <div className="relative">
                    <select
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none appearance-none pr-8"
                      style={{
                        backgroundColor: "var(--bg-raised)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                      }}
                      value={form.reason}
                      onChange={set("reason")}
                    >
                      {STOP_SALE_REASONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: "var(--text-muted)" }}
                    />
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  ملاحظات
                </label>
                {modal === "view" ? (
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {form.notes || "—"}
                  </p>
                ) : (
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                    style={{
                      backgroundColor: "var(--bg-raised)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="ملاحظات..."
                    value={form.notes}
                    onChange={set("notes")}
                  />
                )}
              </div>

              {error && (
                <p className="text-xs text-red-500 font-medium">{error}</p>
              )}
            </div>

            {modal !== "view" && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: "var(--sidebar-active-text)" }}
                >
                  حفظ
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{
                    backgroundColor: "var(--bg-raised)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  إلغاء
                </button>
              </div>
            )}
            {modal === "view" && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setEditId(form.id);
                    setModal("add");
                  }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ backgroundColor: "var(--sidebar-active-text)" }}
                >
                  تعديل
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{
                    backgroundColor: "var(--bg-raised)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  إغلاق
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#ef4444" }}
          >
            <Ban size={20} color="white" />
          </div>
          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              إيقاف البيع
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {stopSales.length} إيقاف مضاف
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              backgroundColor: "var(--bg-raised)",
              border: "1px solid var(--border)",
            }}
          >
            <Search size={15} style={{ color: "var(--text-muted)" }} />
            <input
              className="bg-transparent outline-none text-sm w-44"
              style={{ color: "var(--text-primary)" }}
              placeholder="بحث..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "#ef4444" }}
          >
            <Plus size={16} />
            إضافة إيقاف
          </button>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border)",
          }}
        >
          <Ban
            size={40}
            className="mx-auto mb-3 opacity-30"
            style={{ color: "var(--text-muted)" }}
          />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            لا توجد إيقافات بيع مضافة
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl"
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-red-50">
                  <Calendar size={18} style={{ color: "#ef4444" }} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {s.roomName}
                    </span>
                    <StatusBadge from={s.from} to={s.to} />
                  </div>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {s.from} → {s.to} · {s.reason}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openView(s)}
                  className="p-2 rounded-lg transition-colors hover:bg-blue-50"
                  style={{ color: "#3b82f6" }}
                  title="عرض"
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={() => setDeleteTarget(s.id)}
                  className="p-2 rounded-lg transition-colors hover:bg-red-50"
                  style={{ color: "#ef4444" }}
                  title="حذف"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
