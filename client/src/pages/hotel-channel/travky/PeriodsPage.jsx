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
import { useLanguage } from "../../../context/LanguageContext";

const INITIAL_PERIODS = [
  { id: "1", name: "Low Season", from: "2024-01-01", to: "2024-03-31" },
  { id: "2", name: "Mid Season", from: "2024-04-01", to: "2024-06-30" },
  { id: "3", name: "High Season", from: "2024-07-01", to: "2024-09-30" },
  { id: "4", name: "Peak Season", from: "2024-12-15", to: "2024-12-31" },
];

function ActionRow({ onDelete, onEdit, onView, t }) {
  return (
    <div className="flex items-center gap-1 justify-end">
      <button
        onClick={onDelete}
        className="p-1.5 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
        style={{ color: "#ef4444" }}
        title={t("delete")}
      >
        <Trash2 size={15} />
      </button>
      <button
        onClick={onEdit}
        className="p-1.5 rounded-lg transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/20"
        style={{ color: "#f59e0b" }}
        title={t("edit")}
      >
        <Pencil size={15} />
      </button>
      <button
        onClick={onView}
        className="p-1.5 rounded-lg transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
        style={{ color: "#3b82f6" }}
        title={t("view")}
      >
        <Eye size={15} />
      </button>
    </div>
  );
}

export default function PeriodsPage() {
  const { t } = useLanguage();
  const [periods, setPeriods] = useLocalStorage(
    "travky_periods",
    INITIAL_PERIODS,
  );
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", from: "", to: "" });
  const [errors, setErrors] = useState({});

  const filtered = periods.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  function openAdd() {
    setForm({ name: "", from: "", to: "" });
    setErrors({});
    setModal("add");
  }

  function openEdit(period) {
    setForm({ name: period.name, from: period.from, to: period.to });
    setErrors({});
    setModal({ mode: "edit", data: period });
  }

  function openView(period) {
    setModal({ mode: "view", data: period });
  }

  function closeModal() {
    setModal(null);
    setErrors({});
  }

  function handleSave() {
    const errs = {};
    if (!form.name.trim()) errs.name = t("per_nameRequired");
    if (!form.from) errs.from = t("per_fromRequired");
    if (!form.to) errs.to = t("per_toRequired");
    if (form.from && form.to && form.from >= form.to)
      errs.to = t("per_toAfterFrom");
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    if (modal === "add") {
      setPeriods((prev) => [...prev, { id: Date.now().toString(), ...form }]);
    } else if (modal?.mode === "edit") {
      setPeriods((prev) =>
        prev.map((p) => (p.id === modal.data.id ? { ...p, ...form } : p)),
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
      setPeriods((prev) => prev.filter((p) => p.id !== deleteTarget));
    setDeleteTarget(null);
  }

  const isView = modal?.mode === "view";
  const isEdit = modal?.mode === "edit";

  function DateBadge({ date }) {
    return (
      <span
        className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium"
        style={{
          backgroundColor: "var(--bg-raised)",
          color: "var(--text-secondary)",
          border: "1px solid var(--border)",
        }}
      >
        {date}
      </span>
    );
  }

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
            style={{ backgroundColor: "#ede9fe" }}
          >
            <CalendarDays size={22} style={{ color: "#7c3aed" }} />
          </div>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {t("per_title")}
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {t("per_subtitle")}
            </p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--sidebar-active-text)" }}
        >
          <Plus size={15} />
          <span>{t("add")}</span>
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
              placeholder={t("search") + "..."}
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
                  {t("per_fieldName")}
                </th>
                <th
                  className="pb-3 text-start font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {t("per_fieldFrom")}
                </th>
                <th
                  className="pb-3 text-start font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {t("per_fieldTo")}
                </th>
                <th
                  className="pb-3 text-end font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {t("actions")}
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
                    {t("per_noData")}
                  </td>
                </tr>
              ) : (
                filtered.map((period, idx) => (
                  <tr
                    key={period.id}
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
                      {period.name}
                    </td>
                    <td className="py-4">
                      <DateBadge date={period.from} />
                    </td>
                    <td className="py-4">
                      <DateBadge date={period.to} />
                    </td>
                    <td className="py-4">
                      <ActionRow
                        onDelete={() => handleDelete(period.id)}
                        onEdit={() => openEdit(period)}
                        onView={() => openView(period)}
                        t={t}
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
                {isView ? t("per_viewTitle") : isEdit ? t("per_editTitle") : t("per_addTitle")}
              </h2>
            </div>

            {isView ? (
              <div className="space-y-4">
                <div>
                  <p
                    className="text-xs font-medium mb-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {t("per_fieldName")}
                  </p>
                  <p
                    className="font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {modal.data.name}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p
                      className="text-xs font-medium mb-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {t("per_fieldFrom")}
                    </p>
                    <DateBadge date={modal.data.from} />
                  </div>
                  <div>
                    <p
                      className="text-xs font-medium mb-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {t("per_fieldTo")}
                    </p>
                    <DateBadge date={modal.data.to} />
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="btn btn-secondary w-full mt-2"
                >
                  {t("close")}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {t("per_fieldName")}
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    className="input"
                    placeholder="e.g. High Season"
                  />
                  {errors.name && (
                    <p className="input-error mt-1">{errors.name}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {t("per_fieldFrom")}
                    </label>
                    <input
                      type="date"
                      value={form.from}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, from: e.target.value }))
                      }
                      className="input"
                    />
                    {errors.from && (
                      <p className="input-error mt-1">{errors.from}</p>
                    )}
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {t("per_fieldTo")}
                    </label>
                    <input
                      type="date"
                      value={form.to}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, to: e.target.value }))
                      }
                      className="input"
                    />
                    {errors.to && (
                      <p className="input-error mt-1">{errors.to}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2.5 pt-2 justify-end">
                  <button onClick={closeModal} className="btn btn-secondary">
                    {t("cancel")}
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn text-white"
                    style={{ backgroundColor: "var(--sidebar-active-text)" }}
                  >
                    {t("save")}
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
