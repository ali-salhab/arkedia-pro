import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import DeleteConfirmModal from "./DeleteConfirmModal";

/**
 * DataTable with inline editing, add row, delete, and CSV export.
 *
 * Props:
 * - columns: [{ key, label }]
 * - data: array of row objects
 * - idKey: key used as unique identifier (default "_id")
 * - editable: boolean to enable CRUD actions
 * - onSave: (row) => Promise - called when saving new or edited row
 * - onDelete: (id) => Promise - called when deleting a row
 * - exportFilename: if provided, shows Export CSV button
 */
export default function DataTable({
  columns = [],
  data = [],
  idKey = "_id",
  editable = false,
  onSave,
  onDelete,
  exportFilename,
}) {
  const { t } = useLanguage();
  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState({});
  const [addingNew, setAddingNew] = useState(false);
  const [newRow, setNewRow] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const startEdit = (row) => {
    setEditingId(row[idKey]);
    setEditRow({ ...row });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditRow({});
  };

  const saveEdit = async () => {
    if (onSave) await onSave(editRow);
    setEditingId(null);
    setEditRow({});
  };

  const handleDelete = (id) => setDeleteTarget(id);
  const confirmDelete = async () => {
    if (deleteTarget && onDelete) await onDelete(deleteTarget);
    setDeleteTarget(null);
  };

  const startAdd = () => {
    setAddingNew(true);
    const empty = {};
    columns.forEach((c) => (empty[c.key] = ""));
    setNewRow(empty);
  };

  const cancelAdd = () => {
    setAddingNew(false);
    setNewRow({});
  };

  const saveNew = async () => {
    if (onSave) await onSave(newRow);
    setAddingNew(false);
    setNewRow({});
  };

  const exportCSV = () => {
    const header = columns.map((c) => c.label).join(",");
    const rows = data.map((row) =>
      columns
        .map((c) => {
          const val = row[c.key] ?? "";
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(","),
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportFilename || "export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <DeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
      {(editable || exportFilename) && (
        <div className="flex flex-wrap justify-end gap-2">
          {editable && !addingNew && (
            <button
              className="btn btn-primary rounded-lg px-3 py-1.5 text-xs"
              onClick={startAdd}
            >
              + {t("add")}
            </button>
          )}
          {exportFilename && (
            <button
              className="rounded-lg border border-slate-300 bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:bg-slate-800 dark:border-slate-600 dark:bg-slate-800"
              onClick={exportCSV}
            >
              {t("exportCsv")}
            </button>
          )}
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white/70 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/60">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="whitespace-nowrap px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
                >
                  {col.label}
                </th>
              ))}
              {editable && (
                <th className="whitespace-nowrap px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                  {t("actions")}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {addingNew && (
              <tr className="border-b border-slate-200 dark:border-slate-700">
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-2 align-middle">
                    <input
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 outline-none focus:border-brand-primary dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                      value={newRow[col.key] || ""}
                      onChange={(e) =>
                        setNewRow({ ...newRow, [col.key]: e.target.value })
                      }
                    />
                  </td>
                ))}
                <td className="px-3 py-2 align-middle">
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                      onClick={saveNew}
                    >
                      {t("save")}
                    </button>
                    <button
                      className="rounded-md bg-slate-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-600"
                      onClick={cancelAdd}
                    >
                      {t("cancel")}
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {data.map((row, index) => {
              const isEditing = editingId === row[idKey];
              return (
                <tr
                  key={row[idKey] || index}
                  className="border-b border-slate-100 bg-white/70 transition hover:bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-800/50"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-3 py-2 text-center text-sm text-slate-700 dark:text-slate-200"
                    >
                      {isEditing ? (
                        <input
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 outline-none focus:border-brand-primary dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                          value={editRow[col.key] ?? ""}
                          onChange={(e) =>
                            setEditRow({
                              ...editRow,
                              [col.key]: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <div className="flex min-h-[24px] items-center justify-center">
                          {col.render
                            ? col.render(row[col.key], row)
                            : (row[col.key] ?? "-")}
                        </div>
                      )}
                    </td>
                  ))}

                  {editable && (
                    <td className="px-3 py-2 text-center">
                      {isEditing ? (
                        <div className="flex flex-wrap justify-center gap-2">
                          <button
                            className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                            onClick={saveEdit}
                          >
                            {t("save")}
                          </button>
                          <button
                            className="rounded-md bg-slate-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-600"
                            onClick={cancelEdit}
                          >
                            {t("cancel")}
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap justify-center gap-2">
                          <button
                            className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                            onClick={() => startEdit(row)}
                          >
                            {t("edit")}
                          </button>
                          <button
                            className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-700"
                            onClick={() => handleDelete(row[idKey])}
                          >
                            {t("delete")}
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}

            {data.length === 0 && !addingNew && (
              <tr>
                <td
                  className="px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-300"
                  colSpan={columns.length + (editable ? 1 : 0)}
                >
                  {t("noData")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
