import { useState } from "react";
import { BedDouble, Plus, Search, Trash2, Pencil, Eye, X, ChevronDown } from "lucide-react";
import { useChannelSection } from "../../../hooks/useChannelSection";
import DeleteConfirmModal from "../../../components/DeleteConfirmModal";

const INITIAL_GROUPS = [
  { id: "1", name: "Egyptian Market", currency: "EGP" },
  { id: "2", name: "Gulf Market", currency: "SAR" },
  { id: "3", name: "European Market", currency: "EUR" },
];

const PRESET_NAMES = ["Sea View", "Pool View", "Garden View", "City View", "Mountain View", "Extra Bed"];

const INITIAL_SUPPLEMENTS = [
  { id: "1", name: "Extra Bed", prices: { "1": 250, "2": 25, "3": 20 } },
  { id: "2", name: "Sea View", prices: { "1": 500, "2": 50, "3": 40 } },
];

function ActionRow({ onDelete, onEdit, onView }) {
  return (
    <div className="flex items-center gap-1 justify-end">
      <button
        onClick={onDelete}
        className="p-1.5 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
        style={{ color: "#ef4444" }}
        title="Delete"
      >
        <Trash2 size={15} />
      </button>
      <button
        onClick={onEdit}
        className="p-1.5 rounded-lg transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/20"
        style={{ color: "#f59e0b" }}
        title="Edit"
      >
        <Pencil size={15} />
      </button>
      <button
        onClick={onView}
        className="p-1.5 rounded-lg transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
        style={{ color: "#3b82f6" }}
        title="View"
      >
        <Eye size={15} />
      </button>
    </div>
  );
}

export default function SupplementsPage() {
  const [groups] = useChannelSection("guestGroups", INITIAL_GROUPS);
  const [enabled] = useChannelSection("guestGroupsEnabled", true);
  const [defaultCurrency] = useChannelSection("defaultCurrency", null);
  const [supplements, setSupplements] = useChannelSection("supplements", INITIAL_SUPPLEMENTS);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ namePreset: "Sea View", customName: "", prices: {}, basePrice: 0 });
  const [errors, setErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = supplements.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  function buildEmptyPrices() {
    const p = {};
    groups.forEach((g) => { p[g.id] = 0; });
    return p;
  }

  function openAdd() {
    setForm({ namePreset: "Sea View", customName: "", prices: buildEmptyPrices(), basePrice: 0 });
    setErrors({});
    setModal("add");
  }

  function openEdit(supplement) {
    const prices = buildEmptyPrices();
    groups.forEach((g) => { prices[g.id] = supplement.prices?.[g.id] ?? 0; });
    const isPreset = PRESET_NAMES.includes(supplement.name);
    setForm({
      namePreset: isPreset ? supplement.name : "Other",
      customName: isPreset ? "" : supplement.name,
      prices,
      basePrice: supplement.basePrice ?? 0,
    });
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
    const finalName = form.namePreset === "Other" ? form.customName.trim() : form.namePreset;
    if (!finalName) errs.name = "Name is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const saveData = { name: finalName, prices: form.prices, basePrice: form.basePrice };
    if (modal === "add") {
      setSupplements((prev) => [...prev, { id: Date.now().toString(), ...saveData }]);
    } else if (modal?.mode === "edit") {
      setSupplements((prev) =>
        prev.map((s) => (s.id === modal.data.id ? { ...s, ...saveData } : s)),
      );
    }
    closeModal();
  }

  function confirmDelete() {
    if (deleteTarget) setSupplements((prev) => prev.filter((s) => s.id !== deleteTarget));
    setDeleteTarget(null);
  }

  const isView = modal?.mode === "view";
  const isEdit = modal?.mode === "edit";

  return (
    <div className="page-shell" dir="ltr">
      <DeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl grid place-items-center" style={{ backgroundColor: "#fdf2f8" }}>
            <BedDouble size={22} style={{ color: "#db2777" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              Room Supplements
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Additional charges added on top of the room price
            </p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--sidebar-active-text)" }}
        >
          <Plus size={15} />
          <span>Add Supplement</span>
        </button>
      </div>

      {/* Table */}
      <div className="card">
        <div className="flex justify-start mb-4">
          <div className="relative">
            <Search
              size={15}
              className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ right: "0.75rem", color: "var(--text-muted)" }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="input"
              style={{ paddingRight: "2.5rem", width: "16rem" }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                <th className="pb-3 text-left font-semibold" style={{ color: "var(--text-secondary)", width: 48 }}>#</th>
                <th className="pb-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Name</th>
                {enabled ? groups.map((g) => (
                  <th key={g.id} className="pb-3 text-right font-semibold" style={{ color: "var(--text-secondary)" }}>
                    {g.name}
                    <span className="ml-1 text-xs font-normal" style={{ color: "var(--text-muted)" }}>
                      ({g.currency})
                    </span>
                  </th>
                )) : (
                  <th className="pb-3 text-right font-semibold" style={{ color: "var(--text-secondary)" }}>
                    Price
                    {defaultCurrency && (
                      <span className="ml-1 text-xs font-normal" style={{ color: "var(--text-muted)" }}>
                        ({defaultCurrency})
                      </span>
                    )}
                  </th>
                )}
                <th className="pb-3 text-right font-semibold" style={{ color: "var(--text-secondary)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={enabled ? 3 + groups.length : 3} className="py-10 text-center" style={{ color: "var(--text-muted)" }}>
                    No supplements yet
                  </td>
                </tr>
              ) : (
                filtered.map((supplement, idx) => (
                  <tr key={supplement.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="py-4 font-medium" style={{ color: "var(--text-secondary)" }}>{idx + 1}</td>
                    <td className="py-4 font-semibold" style={{ color: "var(--text-primary)" }}>{supplement.name}</td>
                    {enabled ? groups.map((g) => (
                      <td key={g.id} className="py-4 text-right" style={{ color: "var(--text-primary)" }}>
                        {supplement.prices?.[g.id] ?? 0}
                      </td>
                    )) : (
                      <td className="py-4 text-right" style={{ color: "var(--text-primary)" }}>
                        {supplement.basePrice ?? 0}
                      </td>
                    )}
                    <td className="py-4">
                      <ActionRow
                        onDelete={() => setDeleteTarget(supplement.id)}
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
            className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl p-6 shadow-xl"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                {isView ? "View Supplement" : isEdit ? "Edit Supplement" : "Add Supplement"}
              </h2>
              <button
                onClick={closeModal}
                className="h-7 w-7 grid place-items-center rounded-lg"
                style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-raised)" }}
              >
                <X size={16} />
              </button>
            </div>

            {isView ? (
              /* ── View mode ── */
              <div className="space-y-4">
                <p className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>
                  {modal.data.name}
                </p>
                {enabled ? (
                  <div className="space-y-2">
                    {groups.map((g) => (
                      <div
                        key={g.id}
                        className="flex items-center justify-between py-2 px-3 rounded-lg"
                        style={{ backgroundColor: "var(--bg-raised)" }}
                      >
                        <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          {modal.data.prices?.[g.id] ?? 0}
                          <span className="ml-1 text-xs font-normal" style={{ color: "var(--sidebar-active-text)" }}>
                            {g.currency}
                          </span>
                        </span>
                        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                          {g.name.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-between py-2 px-3 rounded-lg"
                    style={{ backgroundColor: "var(--bg-raised)" }}
                  >
                    <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      {modal.data.basePrice ?? 0}
                      {defaultCurrency && (
                        <span className="ml-1 text-xs font-normal" style={{ color: "var(--sidebar-active-text)" }}>
                          {defaultCurrency}
                        </span>
                      )}
                    </span>
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Price</span>
                  </div>
                )}
                <button onClick={closeModal} className="btn btn-secondary w-full mt-2">Close</button>
              </div>
            ) : (
              /* ── Add / Edit mode ── */
              <div className="space-y-5">
                {/* Name dropdown */}
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-right" style={{ color: "var(--text-primary)" }}>
                    Name
                  </label>
                  <div className="relative">
                    <select
                      value={form.namePreset}
                      onChange={(e) => setForm((p) => ({ ...p, namePreset: e.target.value, customName: "" }))}
                      className="input w-full appearance-none"
                      style={{ paddingLeft: "2rem" }}
                    >
                      {PRESET_NAMES.map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: "var(--text-muted)" }}
                    />
                  </div>
                </div>

                {/* Custom name field – shown only when "Other" selected */}
                {form.namePreset === "Other" && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-right" style={{ color: "var(--text-primary)" }}>
                      Custom Name
                    </label>
                    <input
                      value={form.customName}
                      onChange={(e) => setForm((p) => ({ ...p, customName: e.target.value }))}
                      className="input w-full"
                      placeholder="e.g. Garden View"
                    />
                    {errors.name && <p className="input-error mt-1">{errors.name}</p>}
                  </div>
                )}

                {/* Prices per guest group / single price */}
                {enabled ? (
                  <div>
                    <p className="text-sm font-semibold mb-3 text-right" style={{ color: "var(--text-primary)" }}>
                      Prices per Guest Group
                    </p>
                    <div className="space-y-2.5">
                      {groups.map((g) => (
                        <div key={g.id} className="flex items-center gap-3">
                          <input
                            type="number"
                            min={0}
                            value={form.prices[g.id] ?? 0}
                            onChange={(e) => setPrice(g.id, e.target.value)}
                            className="input"
                            style={{ width: "6rem", flexShrink: 0 }}
                          />
                          <span style={{ color: "var(--text-secondary)" }}>
                            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                              {g.name.toUpperCase()}
                            </span>
                            <span className="ml-1.5" style={{ color: "var(--sidebar-active-text)" }}>
                              ({g.currency})
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                      Price{defaultCurrency ? ` (${defaultCurrency})` : ""}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.basePrice}
                      onChange={(e) => setForm((p) => ({ ...p, basePrice: Number(e.target.value) }))}
                      className="input w-full"
                    />
                  </div>
                )}

                <div className="flex gap-2.5 pt-2 justify-end">
                  <button onClick={closeModal} className="btn btn-secondary">Cancel</button>
                  <button
                    onClick={handleSave}
                    className="btn text-white"
                    style={{ backgroundColor: "var(--sidebar-active-text)" }}
                  >
                    Save
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
