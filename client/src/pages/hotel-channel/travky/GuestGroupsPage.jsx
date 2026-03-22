import { useState } from "react";
import { Users, Plus, Search, Trash2, Pencil, Eye, X } from "lucide-react";
import { useLocalStorage } from "../../../hooks/useLocalStorage";

const CURRENCIES = [
  "EGP",
  "SAR",
  "AED",
  "USD",
  "EUR",
  "GBP",
  "KWD",
  "QAR",
  "JOD",
];
const NATIONALITIES = [
  "Egyptian",
  "Saudi",
  "Emirati",
  "Kuwaiti",
  "Qatari",
  "Jordanian",
  "Bahraini",
  "British",
  "French",
  "German",
  "American",
  "Italian",
  "Spanish",
  "Dutch",
  "Russian",
  "Chinese",
  "Indian",
  "Turkish",
  "Belgian",
  "Austrian",
];

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

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      dir="ltr"
      className="relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200"
      style={{
        backgroundColor: checked
          ? "var(--sidebar-active-text)"
          : "var(--border)",
      }}
    >
      <span
        className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out"
        style={{
          transform: checked ? "translateX(1.375rem)" : "translateX(0)",
        }}
      />
    </button>
  );
}

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

export default function GuestGroupsPage() {
  const [groups, setGroups] = useLocalStorage(
    "travky_guest_groups",
    INITIAL_GROUPS,
  );
  const [enabled, setEnabled] = useLocalStorage(
    "travky_guest_groups_enabled",
    true,
  );
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    name: "",
    currency: "EGP",
    nationalities: [],
  });
  const [errors, setErrors] = useState({});

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()),
  );

  function openAdd() {
    setForm({ name: "", currency: "EGP", nationalities: [] });
    setErrors({});
    setModal("add");
  }

  function openEdit(group) {
    setForm({
      name: group.name,
      currency: group.currency,
      nationalities: [...group.nationalities],
    });
    setErrors({});
    setModal({ mode: "edit", data: group });
  }

  function openView(group) {
    setModal({ mode: "view", data: group });
  }

  function closeModal() {
    setModal(null);
    setErrors({});
  }

  function toggleNationality(nat) {
    setForm((prev) => ({
      ...prev,
      nationalities: prev.nationalities.includes(nat)
        ? prev.nationalities.filter((n) => n !== nat)
        : [...prev.nationalities, nat],
    }));
  }

  function handleSave() {
    const errs = {};
    if (!form.name.trim()) errs.name = "الاسم مطلوب";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    if (modal === "add") {
      setGroups((prev) => [...prev, { id: Date.now().toString(), ...form }]);
    } else if (modal?.mode === "edit") {
      setGroups((prev) =>
        prev.map((g) => (g.id === modal.data.id ? { ...g, ...form } : g)),
      );
    }
    closeModal();
  }

  function handleDelete(id) {
    if (window.confirm("هل تريد حذف هذه المجموعة؟")) {
      setGroups((prev) => prev.filter((g) => g.id !== id));
    }
  }

  const isView = modal?.mode === "view";
  const isEdit = modal?.mode === "edit";
  const showForm = modal === "add" || isEdit;

  return (
    <div className="page-shell">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl grid place-items-center"
            style={{ backgroundColor: "#fce7f3" }}
          >
            <Users size={22} style={{ color: "#ec4899" }} />
          </div>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              مجموعات الضيوف
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              إدارة أنواع مجموعات الضيوف
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

      {/* Toggle row */}
      <div className="card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              تفعيل مجموعات الضيوف
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-secondary)" }}
            >
              فقل لإضافة ضيوف مخصصة، أو ألغ لاستخدام عملة الفندق الافتراضية
            </p>
          </div>
          <Toggle checked={enabled} onChange={() => setEnabled((v) => !v)} />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="flex justify-start mb-4">
          <div className="relative">
            <Search
              size={15}
              className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                insetInlineStart: "unset",
                insetInlineEnd: "0.75rem",
                color: "var(--text-muted)",
              }}
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
                <th
                  className="pb-3 text-start font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  العملة
                </th>
                <th
                  className="pb-3 text-start font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  الجنسيات
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
                    colSpan={5}
                    className="py-10 text-center"
                    style={{ color: "var(--text-muted)" }}
                  >
                    لا توجد مجموعات ضيوف بعد
                  </td>
                </tr>
              ) : (
                filtered.map((group, idx) => (
                  <tr
                    key={group.id}
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
                      {group.name}
                    </td>
                    <td
                      className="py-4"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {group.currency} $
                    </td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-1">
                        {group.nationalities.map((nat) => (
                          <span key={nat} className="chip text-xs">
                            {nat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4">
                      <ActionRow
                        onDelete={() => handleDelete(group.id)}
                        onEdit={() => openEdit(group)}
                        onView={() => openView(group)}
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
            className="w-full max-w-md rounded-2xl p-6 shadow-xl"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={closeModal}
                className="h-7 w-7 grid place-items-center rounded-lg transition-colors"
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
                  ? "عرض المجموعة"
                  : isEdit
                    ? "تعديل المجموعة"
                    : "إضافة مجموعة ضيوف"}
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
                    className="text-xs font-medium mb-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    العملة
                  </p>
                  <p
                    className="font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {modal.data.currency}
                  </p>
                </div>
                <div>
                  <p
                    className="text-xs font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    الجنسيات
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {modal.data.nationalities.map((n) => (
                      <span key={n} className="chip">
                        {n}
                      </span>
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
                    placeholder="e.g. Egyptian Market"
                  />
                  {errors.name && (
                    <p className="input-error mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    العملة
                  </label>
                  <select
                    value={form.currency}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, currency: e.target.value }))
                    }
                    className="input"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    الجنسيات
                  </label>
                  <div
                    className="flex flex-wrap gap-1.5 p-3 rounded-xl max-h-36 overflow-y-auto"
                    style={{
                      backgroundColor: "var(--bg-raised)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {NATIONALITIES.map((nat) => (
                      <button
                        key={nat}
                        type="button"
                        onClick={() => toggleNationality(nat)}
                        className="chip cursor-pointer transition-all"
                        style={
                          form.nationalities.includes(nat)
                            ? {
                                backgroundColor: "rgba(29,78,216,0.1)",
                                borderColor: "var(--sidebar-active-text)",
                                color: "var(--sidebar-active-text)",
                              }
                            : {}
                        }
                      >
                        {nat}
                      </button>
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
