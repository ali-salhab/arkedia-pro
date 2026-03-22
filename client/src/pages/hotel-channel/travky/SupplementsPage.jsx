import { useState } from "react";
import { BedDouble, Plus, Search, Trash2, Pencil, Eye, X } from "lucide-react";
import { useLocalStorage } from "../../../hooks/useLocalStorage";

const INITIAL_GROUPS = [
  {
    id: "1",
    name: "Egyptian Market",
    currency: "EGP",
    nationalities: ["Egyptian"],
  },
  {
    id: "2",
    name: "Gulf Market",
    currency: "SAR",
    nationalities: ["Kuwaiti", "Emirati", "Saudi"],
  },
  {
    id: "3",
    name: "European Market",
    currency: "EUR",
    nationalities: ["British", "French", "German"],
  },
];

const INITIAL_SUPPLEMENTS = [
  { id: "1", name: "Extra Bed", prices: { 1: 250, 2: 25, 3: 20 } },
  { id: "2", name: "Sea View", prices: { 1: 500, 2: 50, 3: 40 } },
];

function ActionRow({ onDelete, onEdit, onView }) {
  return (
    <div className="flex items-center gap-1 justify-end">
      <button
        onClick={onDelete}
        className="p-1.5 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
        style={{ color: "#ef4444" }}
        title="حذف"
      >
        <Trash2 size={15} />
      </button>
      <button
        onClick={onEdit}
        className="p-1.5 rounded-lg transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/20"
        style={{ color: "#f59e0b" }}
        title="تعديل"
      >
        <Pencil size={15} />
      </button>
      <button
        onClick={onView}
        className="p-1.5 rounded-lg transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
        style={{ color: "#3b82f6" }}
        title="عرض"
      >
        <Eye size={15} />
      </button>
    </div>
  );
}

export default function SupplementsPage() {
  const [groups] = useLocalStorage("travky_guest_groups", INITIAL_GROUPS);
  const [supplements, setSupplements] = useLocalStorage(
    "travky_supplements",
    INITIAL_SUPPLEMENTS,
  );
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", prices: {} });
  const [errors, setErrors] = useState({});

  const filtered = supplements.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  function openAdd() {
    const prices = {};
    groups.forEach((g) => {
      prices[g.id] = 0;
    });
    setForm({ name: "", prices });
    setErrors({});
    setModal("add");
  }

  function openEdit(supplement) {
    const prices = {};
    groups.forEach((g) => {
      prices[g.id] = supplement.prices[g.id] ?? 0;
    });
    setForm({ name: supplement.name, prices });
    setErrors({});
    setModal({ mode: "edit", data: supplement });
  }

  function openView(supplement) {
    setModal({ mode: "view", data: supplement });
  }

  function closeModal() {
    setModal(null);
    setErrors({});
  }

  function setPrice(groupId, val) {
    setForm((p) => ({ ...p, prices: { ...p.prices, [groupId]: Number(val) } }));
  }

  function handleSave() {
    const errs = {};
    if (!form.name.trim()) errs.name = "الاسم مطلوب";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    if (modal === "add") {
      setSupplements((prev) => [
        ...prev,
        { id: Date.now().toString(), ...form },
      ]);
    } else if (modal?.mode === "edit") {
      setSupplements((prev) =>
        prev.map((s) => (s.id === modal.data.id ? { ...s, ...form } : s)),
      );
    }
    closeModal();
  }

  function handleDelete(id) {
    if (window.confirm("هل تريد حذف هذه الإضافة؟")) {
      setSupplements((prev) => prev.filter((s) => s.id !== id));
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
            style={{ backgroundColor: "#fdf2f8" }}
          >
            <BedDouble size={22} style={{ color: "#db2777" }} />
          </div>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              إضافات الغرفة
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              إضافات إضافية على سعر الغرفة ككل
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
                  الاسم
                </th>
                {groups.map((g) => (
                  <th
                    key={g.id}
                    className="pb-3 text-start font-semibold"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span>{g.name}</span>
                    <br />
                    <span
                      className="text-xs font-normal"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {g.currency}
                    </span>
                  </th>
                ))}
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
                    colSpan={3 + groups.length}
                    className="py-10 text-center"
                    style={{ color: "var(--text-muted)" }}
                  >
                    لا توجد إضافات بعد
                  </td>
                </tr>
              ) : (
                filtered.map((supplement, idx) => (
                  <tr
                    key={supplement.id}
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
                      {supplement.name}
                    </td>
                    {groups.map((g) => (
                      <td
                        key={g.id}
                        className="py-4 font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {supplement.prices[g.id] ?? 0}
                      </td>
                    ))}
                    <td className="py-4">
                      <ActionRow
                        onDelete={() => handleDelete(supplement.id)}
                        onEdit={() => openEdit(supplement)}
                        onView={() => openView(supplement)}
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
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-xl"
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
                  ? "عرض الإضافة"
                  : isEdit
                    ? "تعديل الإضافة"
                    : "إضافة إضافة"}
              </h2>
            </div>

            {isView ? (
              <div className="space-y-4">
                <div>
                  <p
                    className="text-xs font-medium mb-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    الاسم
                  </p>
                  <p
                    className="font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {modal.data.name}
                  </p>
                </div>
                <div>
                  <p
                    className="text-xs font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    الأسعار لكل مجموعة ضيوف
                  </p>
                  <div className="space-y-2">
                    {groups.map((g) => (
                      <div
                        key={g.id}
                        className="flex items-center justify-between py-1.5 px-3 rounded-lg"
                        style={{ backgroundColor: "var(--bg-raised)" }}
                      >
                        <span
                          className="font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {modal.data.prices[g.id] ?? 0}
                        </span>
                        <span
                          className="text-sm"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {g.name} ({g.currency})
                        </span>
                      </div>
                    ))}
                  </div>
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
                    الاسم
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    className="input"
                    placeholder="e.g. Extra Bed, Sea View"
                  />
                  {errors.name && (
                    <p className="input-error mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <p
                    className="text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    الأسعار لكل مجموعة ضيوف
                  </p>
                  <div className="space-y-2">
                    {groups.map((g) => (
                      <div key={g.id} className="flex items-center gap-3">
                        <input
                          type="number"
                          min="0"
                          value={form.prices[g.id] ?? 0}
                          onChange={(e) => setPrice(g.id, e.target.value)}
                          className="input"
                          style={{ width: "6rem" }}
                        />
                        <span
                          className="text-sm"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {g.name} ({g.currency})
                        </span>
                      </div>
                    ))}
                  </div>
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

