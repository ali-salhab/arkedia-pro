import { useState } from "react";
import {
  CalendarDays,
  Plus,
  Search,
  Trash2,
  Pencil,
  Eye,
  X,
} from "lucide-react";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import DeleteConfirmModal from "../../../components/DeleteConfirmModal";

const INITIAL_ROOM_TYPES = [
  { id: "dbl", code: "DBL", nameEn: "Double Room", nameAr: "غرفة مزدوجة", roomType: "DBL Room" },
];

const INITIAL_SUPPLEMENTS = [
  { id: "1", name: "Sea View",  prices: {} },
  { id: "2", name: "Pool View", prices: {} },
];

const INITIAL_PERIODS = [
  { id: "1", name: "Low Season", from: "", to: "" },
  { id: "2", name: "High Season", from: "", to: "" },
];

const STATUS_OPTIONS = [
  { value: "open", label: "Open", color: "#16a34a", bg: "#f0fdf4" },
  { value: "limited", label: "Limited", color: "#d97706", bg: "#fffbeb" },
  { value: "closed", label: "Closed", color: "#dc2626", bg: "#fef2f2" },
];

function getStatus(val) {
  return STATUS_OPTIONS.find((s) => s.value === val) || STATUS_OPTIONS[0];
}

function StatusBadge({ status }) {
  const s = getStatus(status);
  return (
    <span className="text-sm font-medium" style={{ color: s.color }}>
      {s.label}
    </span>
  );
}

const SAMPLE_AVAILABILITY = [
  { id: "1", roomId: "dbl", periodId: "1", available: 15, status: "open" },
];

function ActionRow({ onDelete, onEdit, onView }) {
  return (
    <div className="flex items-center gap-1 justify-end">
      <button
        onClick={onDelete}
        className="p-1.5 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
        style={{ color: "#ef4444" }}
      >
        <Trash2 size={15} />
      </button>
      <button
        onClick={onEdit}
        className="p-1.5 rounded-lg transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/20"
        style={{ color: "#f59e0b" }}
      >
        <Pencil size={15} />
      </button>
      <button
        onClick={onView}
        className="p-1.5 rounded-lg transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
        style={{ color: "#3b82f6" }}
      >
        <Eye size={15} />
      </button>
    </div>
  );
}

// roomKey format: "<roomId>" for base, "<roomId>::<supplementId>" for supplement combos
function makeRoomKey(roomId, supplementId) {
  return supplementId ? `${roomId}::${supplementId}` : roomId;
}
function parseRoomKey(key) {
  const [roomId, supplementId] = (key || "").split("::");
  return { roomId: roomId || "", supplementId: supplementId || null };
}
function buildRoomLabel(room, supplement) {
  const base = `${room.code} (${room.roomType || room.nameEn})`;
  if (!supplement) return base;
  return `${room.code} - ${supplement.name} (${room.roomType || room.nameEn})`;
}

export default function AvailabilityPage() {
  const [roomTypes]    = useLocalStorage("travky_room_types",   INITIAL_ROOM_TYPES);
  const [supplements]  = useLocalStorage("travky_supplements",  INITIAL_SUPPLEMENTS);
  const [periods]      = useLocalStorage("travky_periods",       INITIAL_PERIODS);
  const [availability, setAvailability] = useLocalStorage(
    "travky_availability",
    SAMPLE_AVAILABILITY,
  );
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    roomId: "",
    periodId: "",
    available: "",
    status: "open",
  });
  const [errors, setErrors] = useState({});

  // Flat list of all room options (base + supplement combos per room)
  const roomOptions = roomTypes.flatMap((r) => [
    { key: makeRoomKey(r.id, null), label: buildRoomLabel(r, null) },
    ...supplements.map((s) => ({
      key: makeRoomKey(r.id, s.id),
      label: buildRoomLabel(r, s),
    })),
  ]);

  function getRoomName(roomKey) {
    const opt = roomOptions.find((o) => o.key === roomKey);
    if (opt) return opt.label;
    // fallback: parse and build
    const { roomId, supplementId } = parseRoomKey(roomKey);
    const r = roomTypes.find((x) => x.id === roomId);
    const s = supplements.find((x) => x.id === supplementId);
    return r ? buildRoomLabel(r, s || null) : roomKey;
  }
  const filtered = availability.filter((a) => {
    const label = getRoomName(a.roomId);
    const period = periods.find((p) => p.id === a.periodId);
    const periodLabel = period ? period.name : "";
    return (
      label.toLowerCase().includes(search.toLowerCase()) ||
      periodLabel.toLowerCase().includes(search.toLowerCase())
    );
  });

  function getPeriodName(periodId) {
    const p = periods.find((x) => x.id === periodId);
    if (!p) return periodId;
    if (p.from && p.to) return `${p.name} (${p.from} — ${p.to})`;
    return p.name;
  }

  function openAdd() {
    setForm({
      roomId: "",
      periodId: periods[0]?.id || "",
      available: "",
      status: "open",
    });
    setErrors({});
    setModal("add");
  }

  function openEdit(item) {
    setForm({
      roomId: item.roomId,
      periodId: item.periodId,
      available: item.available,
      status: item.status,
    });
    setErrors({});
    setModal({ mode: "edit", data: item });
  }

  function openView(item) {
    setModal({ mode: "view", data: item });
  }

  function closeModal() {
    setModal(null);
    setErrors({});
  }

  function handleSave() {
    const errs = {};
    if (!form.roomId)   errs.roomId   = "اختر الغرفة";
    if (!form.periodId) errs.periodId = "اختر الفترة";
    if (form.available === "" || form.available < 0)
      errs.available = "الكمية مطلوبة";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const data = { ...form, available: Number(form.available) };
    if (modal === "add") {
      setAvailability((prev) => [
        ...prev,
        { id: Date.now().toString(), ...data },
      ]);
    } else if (modal?.mode === "edit") {
      setAvailability((prev) =>
        prev.map((a) => (a.id === modal.data.id ? { ...a, ...data } : a)),
      );
    }
    closeModal();
  }

  function handleDelete(id) {
    setDeleteTarget(id);
  }
  const [deleteTarget, setDeleteTarget] = useState(null);
  function confirmDelete() {
    if (deleteTarget)
      setAvailability((prev) => prev.filter((a) => a.id !== deleteTarget));
    setDeleteTarget(null);
  }

  const isView = modal?.mode === "view";
  const isEdit = modal?.mode === "edit";

  return (
    <div className="page-shell">
      <DeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl grid place-items-center"
            style={{ backgroundColor: "#ecfdf5" }}
          >
            <CalendarDays size={22} style={{ color: "#059669" }} />
          </div>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              التوافر
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              إدارة توافر الغرف
            </p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--sidebar-active-text)" }}
        >
          <Plus size={15} />
          <span>إضافة</span>
        </button>
      </div>

      {/* Table */}
      <div className="card">
        <div className="flex justify-start mb-4">
          <div className="relative">
            <Search
              size={15}
              className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ insetInlineEnd: "0.75rem", color: "var(--text-muted)" }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث..."
              className="input"
              style={{ paddingInlineEnd: "2.5rem", width: "16rem" }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                <th
                  className="pb-3 text-start font-semibold"
                  style={{ color: "var(--text-secondary)", width: 48 }}
                >
                  #
                </th>
                <th
                  className="pb-3 text-start font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  الغرفة
                </th>
                <th
                  className="pb-3 text-start font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  الفترة
                </th>
                <th
                  className="pb-3 text-start font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  المتاح
                </th>
                <th
                  className="pb-3 text-start font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  الحالة
                </th>
                <th
                  className="pb-3 text-end font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center"
                    style={{ color: "var(--text-muted)" }}
                  >
                    لا توجد بيانات توافر بعد
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr
                    key={item.id}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td
                      className="py-4 font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {idx + 1}
                    </td>
                    <td
                      className="py-4 font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {getRoomName(item.roomId)}
                    </td>
                    <td
                      className="py-4"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {getPeriodName(item.periodId)}
                    </td>
                    <td
                      className="py-4 font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {item.available}
                    </td>
                    <td className="py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-4">
                      <ActionRow
                        onDelete={() => handleDelete(item.id)}
                        onEdit={() => openEdit(item)}
                        onView={() => openView(item)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-xl"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={closeModal}
                className="h-7 w-7 grid place-items-center rounded-lg"
                style={{
                  color: "var(--text-muted)",
                  backgroundColor: "var(--bg-raised)",
                }}
              >
                <X size={16} />
              </button>
              <h2
                className="text-lg font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {isView
                  ? "عرض التوافر"
                  : isEdit
                    ? "تعديل التوافر"
                    : "إضافة توافر"}
              </h2>
            </div>

            {isView ? (
              <div className="space-y-4">
                <div>
                  <p
                    className="text-xs font-medium mb-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    الغرفة
                  </p>
                  <p
                    className="font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {getRoomName(modal.data.roomId)}
                  </p>
                </div>
                <div>
                  <p
                    className="text-xs font-medium mb-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    الفترة
                  </p>
                  <p
                    className="font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {getPeriodName(modal.data.periodId)}
                  </p>
                </div>
                <div>
                  <p
                    className="text-xs font-medium mb-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    الكمية المتاحة
                  </p>
                  <p
                    className="font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {modal.data.available}
                  </p>
                </div>
                <div>
                  <p
                    className="text-xs font-medium mb-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    الحالة
                  </p>
                  <StatusBadge status={modal.data.status} />
                </div>
                <button
                  onClick={closeModal}
                  className="btn btn-secondary w-full mt-2"
                >
                  إغلاق
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    الغرفة
                  </label>
                  <select
                    value={form.roomId}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, roomId: e.target.value }))
                    }
                    className="input"
                  >
                    <option value="">...Select room</option>
                    {roomOptions.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.roomId && (
                    <p className="input-error mt-1">{errors.roomId}</p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    الفترة
                  </label>
                  <select
                    value={form.periodId}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, periodId: e.target.value }))
                    }
                    className="input"
                  >
                    <option value="">...Select period</option>
                    {periods.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.from && p.to
                          ? `${p.name} (${p.from} — ${p.to})`
                          : p.name}
                      </option>
                    ))}
                  </select>
                  {errors.periodId && (
                    <p className="input-error mt-1">{errors.periodId}</p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    المتاح
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.available}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, available: e.target.value }))
                    }
                    className="input"
                  />
                  {errors.available && (
                    <p className="input-error mt-1">{errors.available}</p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    الحالة
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, status: e.target.value }))
                    }
                    className="input"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2.5 pt-2 justify-end">
                  <button onClick={closeModal} className="btn btn-secondary">
                    إلغاء
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn text-white"
                    style={{ backgroundColor: "var(--sidebar-active-text)" }}
                  >
                    حفظ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
