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

const INITIAL_ROOM_TYPES = [
  { id: "dbl", code: "DBL", nameEn: "Double Room", nameAr: "غرفة مزدوجة" },
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
  { id: "1", roomId: "dbl", date: "2024-03-15", available: 15, status: "open" },
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

export default function AvailabilityPage() {
  const [roomTypes] = useLocalStorage("travky_room_types", INITIAL_ROOM_TYPES);
  const [availability, setAvailability] = useLocalStorage(
    "travky_availability",
    SAMPLE_AVAILABILITY,
  );
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    roomId: "",
    date: "",
    available: "",
    status: "open",
  });
  const [errors, setErrors] = useState({});

  const filtered = availability.filter((a) => {
    const room = roomTypes.find((r) => r.id === a.roomId);
    const roomName = room ? room.nameAr || room.nameEn : "";
    return (
      roomName.toLowerCase().includes(search.toLowerCase()) ||
      a.date.includes(search)
    );
  });

  function getRoomName(roomId) {
    const r = roomTypes.find((x) => x.id === roomId);
    return r ? r.nameAr || r.nameEn : roomId;
  }

  function openAdd() {
    setForm({
      roomId: roomTypes[0]?.id || "",
      date: "",
      available: "",
      status: "open",
    });
    setErrors({});
    setModal("add");
  }

  function openEdit(item) {
    setForm({
      roomId: item.roomId,
      date: item.date,
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
    if (!form.roomId) errs.roomId = "اختر الغرفة";
    if (!form.date) errs.date = "التاريخ مطلوب";
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
    if (window.confirm("هل تريد حذف هذا التوافر؟")) {
      setAvailability((prev) => prev.filter((a) => a.id !== id));
    }
  }

  const isView = modal?.mode === "view";
  const isEdit = modal?.mode === "edit";

  return (
    <div className="page-shell">
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
                  التاريخ
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
                      {item.date}
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
                    التاريخ
                  </p>
                  <p
                    className="font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {modal.data.date}
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
                    {roomTypes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nameAr || r.nameEn}
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
                    التاريخ
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, date: e.target.value }))
                    }
                    className="input"
                  />
                  {errors.date && (
                    <p className="input-error mt-1">{errors.date}</p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    الكمية
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

