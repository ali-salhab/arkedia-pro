import { useState } from "react";

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
  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState({});
  const [addingNew, setAddingNew] = useState(false);
  const [newRow, setNewRow] = useState({});

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

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    if (onDelete) await onDelete(id);
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

  const thStyle = {
    textAlign: "left",
    padding: 8,
    borderBottom: "1px solid #e2e8f0",
    color: "#475569",
    fontSize: 13,
    fontWeight: 600,
  };
  const tdStyle = { padding: 8, color: "#334155" };
  const inputStyle = {
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: 6,
    padding: "4px 8px",
    color: "#1e293b",
    width: "100%",
  };
  const btnSmall = {
    padding: "4px 10px",
    fontSize: 12,
    borderRadius: 6,
    cursor: "pointer",
    border: "none",
  };

  return (
    <div>
      {(editable || exportFilename) && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginBottom: 8,
          }}
        >
          {editable && !addingNew && (
            <button
              style={{ ...btnSmall, background: "#2563eb", color: "#ffffff" }}
              onClick={startAdd}
            >
              + Add
            </button>
          )}
          {exportFilename && (
            <button
              style={{ ...btnSmall, background: "#334155", color: "#e5e7eb" }}
              onClick={exportCSV}
            >
              Export CSV
            </button>
          )}
        </div>
      )}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={thStyle}>
                {col.label}
              </th>
            ))}
            {editable && <th style={thStyle}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {addingNew && (
            <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
              {columns.map((col) => (
                <td key={col.key} style={tdStyle}>
                  <input
                    style={inputStyle}
                    value={newRow[col.key] || ""}
                    onChange={(e) =>
                      setNewRow({ ...newRow, [col.key]: e.target.value })
                    }
                  />
                </td>
              ))}
              <td style={tdStyle}>
                <button
                  style={{ ...btnSmall, background: "#22c55e", color: "#fff" }}
                  onClick={saveNew}
                >
                  Save
                </button>{" "}
                <button
                  style={{ ...btnSmall, background: "#64748b", color: "#fff" }}
                  onClick={cancelAdd}
                >
                  Cancel
                </button>
              </td>
            </tr>
          )}
          {data.map((row) => {
            const isEditing = editingId === row[idKey];
            return (
              <tr
                key={row[idKey]}
                style={{ borderBottom: "1px solid #e2e8f0" }}
              >
                {columns.map((col) => (
                  <td key={col.key} style={tdStyle}>
                    {isEditing ? (
                      <input
                        style={inputStyle}
                        value={editRow[col.key] ?? ""}
                        onChange={(e) =>
                          setEditRow({ ...editRow, [col.key]: e.target.value })
                        }
                      />
                    ) : col.render ? (
                      col.render(row[col.key], row)
                    ) : (
                      row[col.key]
                    )}
                  </td>
                ))}
                {editable && (
                  <td style={tdStyle}>
                    {isEditing ? (
                      <>
                        <button
                          style={{
                            ...btnSmall,
                            background: "#22c55e",
                            color: "#fff",
                          }}
                          onClick={saveEdit}
                        >
                          Save
                        </button>{" "}
                        <button
                          style={{
                            ...btnSmall,
                            background: "#64748b",
                            color: "#fff",
                          }}
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          style={{
                            ...btnSmall,
                            background: "#3b82f6",
                            color: "#fff",
                          }}
                          onClick={() => startEdit(row)}
                        >
                          Edit
                        </button>{" "}
                        <button
                          style={{
                            ...btnSmall,
                            background: "#ef4444",
                            color: "#fff",
                          }}
                          onClick={() => handleDelete(row[idKey])}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
          {data.length === 0 && !addingNew && (
            <tr>
              <td
                style={{ padding: 8 }}
                colSpan={columns.length + (editable ? 1 : 0)}
              >
                No data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
