import { useState } from "react";
import {
  Percent,
  Plus,
  Search,
  Trash2,
  Pencil,
  X,
  Check,
  ChevronDown,
} from "lucide-react";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import DeleteConfirmModal from "../../../components/DeleteConfirmModal";
import { useLanguage } from "../../../context/LanguageContext";

const COMMISSION_TYPES = ["Percentage", "Fixed Amount"];
const APPLIES_TO = ["All Rooms", "Selected Rooms", "Selected Periods"];

const INITIAL_COMMISSIONS = [
  {
    id: "1",
    name: "Standard Commission",
    type: "Percentage",
    value: 10,
    appliesTo: "All Rooms",
    notes: "",
    active: true,
  },
  {
    id: "2",
    name: "Agency Commission",
    type: "Percentage",
    value: 15,
    appliesTo: "Selected Rooms",
    notes: "Travel agencies only",
    active: true,
  },
];

const EMPTY_FORM = {
  name: "",
  type: "Percentage",
  value: "",
  appliesTo: "All Rooms",
  notes: "",
  active: true,
};

function validate(form, t) {
  if (!form.name.trim()) return t("comm_nameRequired");
  if (!form.value || isNaN(Number(form.value)) || Number(form.value) <= 0)
    return t("comm_valueRequired");
  return null;
}

export default function CommissionPage() {
  const { t, dir } = useLanguage();
  const [commissions, setCommissions] = useLocalStorage(
    "travky_commissions",
    INITIAL_COMMISSIONS,
  );
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null | "add" | "edit" | "view"
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState("");

  const filtered = commissions.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setError("");
    setModal("add");
  };

  const openEdit = (c) => {
    setForm({ ...c });
    setEditId(c.id);
    setError("");
    setModal("edit");
  };

  const openView = (c) => {
    setForm({ ...c });
    setEditId(c.id);
    setModal("view");
  };

  const closeModal = () => {
    setModal(null);
    setError("");
  };

  const handleSave = () => {
    const err = validate(form, t);
    if (err) return setError(err);
    if (modal === "add") {
      setCommissions((prev) => [
        ...prev,
        { ...form, id: Date.now().toString(), value: Number(form.value) },
      ]);
    } else {
      setCommissions((prev) =>
        prev.map((c) =>
          c.id === editId
            ? { ...form, id: editId, value: Number(form.value) }
            : c,
        ),
      );
    }
    closeModal();
  };

  const toggleActive = (id) => {
    setCommissions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)),
    );
  };

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="page-shell" dir={dir}>
      {/* Delete confirm */}
      <DeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          setCommissions((prev) => prev.filter((c) => c.id !== deleteTarget));
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
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2
                className="text-lg font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {modal === "view"
                  ? t("comm_viewTitle")
                  : modal === "edit"
                    ? t("comm_editTitle")
                    : t("comm_addTitle")}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {t("comm_fieldName")}
                </label>
                {modal === "view" ? (
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {form.name}
                  </p>
                ) : (
                  <input
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{
                      backgroundColor: "var(--bg-raised)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                    placeholder={t("comm_namePlaceholder")}
                    value={form.name}
                    onChange={set("name")}
                  />
                )}
              </div>

              {/* Type + Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {t("comm_fieldType")}
                  </label>
                  {modal === "view" ? (
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {form.type}
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
                        value={form.type}
                        onChange={set("type")}
                      >
                        {COMMISSION_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
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
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {form.type === "Percentage" ? t("comm_fieldValuePercent") : t("comm_fieldValueFixed")}
                  </label>
                  {modal === "view" ? (
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {form.value}
                      {form.type === "Percentage" ? "%" : ""}
                    </p>
                  ) : (
                    <input
                      type="number"
                      min="0"
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{
                        backgroundColor: "var(--bg-raised)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                      }}
                      placeholder="0"
                      value={form.value}
                      onChange={set("value")}
                    />
                  )}
                </div>
              </div>

              {/* Applies To */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {t("comm_fieldAppliesTo")}
                </label>
                {modal === "view" ? (
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {form.appliesTo}
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
                      value={form.appliesTo}
                      onChange={set("appliesTo")}
                    >
                      {APPLIES_TO.map((a) => (
                        <option key={a} value={a}>
                          {a}
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
                  {t("comm_fieldNotes")}
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
                    placeholder={t("comm_notesPlaceholder")}
                    value={form.notes}
                    onChange={set("notes")}
                  />
                )}
              </div>

              {error && (
                <p className="text-xs text-red-500 font-medium">{error}</p>
              )}
            </div>

            {/* Footer */}
            {modal !== "view" && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors"
                  style={{ backgroundColor: "var(--sidebar-active-text)" }}
                >
                  {modal === "edit" ? t("comm_saveChanges") : t("add")}
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  style={{
                    backgroundColor: "var(--bg-raised)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {t("cancel")}
                </button>
              </div>
            )}
            {modal === "view" && (
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => openEdit(form)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
                  style={{ backgroundColor: "var(--sidebar-active-text)" }}
                >
                  {t("edit")}
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
            style={{
              backgroundColor: "var(--sidebar-active-text)",
              opacity: 0.9,
            }}
          >
            <Percent size={20} color="white" />
          </div>
          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {t("commission")}
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {t("comm_subtitle", { count: commissions.length })}
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
              placeholder={t("search") + "..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--sidebar-active-text)" }}
          >
            <Plus size={16} />
            {t("comm_addBtn")}
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
          <Percent
            size={40}
            className="mx-auto mb-3 opacity-30"
            style={{ color: "var(--text-muted)" }}
          />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {t("comm_noData")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl"
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border)",
              }}
            >
              {/* Left: icon + info */}
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: c.active ? "#dcfce7" : "#f1f5f9" }}
                >
                  <Percent
                    size={18}
                    style={{ color: c.active ? "#16a34a" : "#94a3b8" }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {c.name}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                      style={{
                        backgroundColor: c.active ? "#dcfce7" : "#f1f5f9",
                        color: c.active ? "#16a34a" : "#94a3b8",
                      }}
                    >
                      {c.active ? t("comm_active") : t("comm_inactive")}
                    </span>
                  </div>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {c.value}
                    {c.type === "Percentage" ? "%" : ` (${t("comm_fixed")})`} · {c.appliesTo}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleActive(c.id)}
                  className="p-2 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: c.active ? "#fef9c3" : "#f1f5f9",
                    color: c.active ? "#a16207" : "#94a3b8",
                  }}
                  title={c.active ? t("comm_deactivate") : t("comm_activate")}
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => openView(c)}
                  className="p-2 rounded-lg transition-colors hover:bg-blue-50"
                  style={{ color: "#3b82f6" }}
                  title="عرض"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setDeleteTarget(c.id)}
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
