import { useState } from "react";
import DeleteConfirmModal from "../../../components/DeleteConfirmModal";
import AddButton from "../../../components/AddButton";
import {
  UtensilsCrossed,
  Search,
  Trash2,
  Pencil,
  Eye,
  X,
  ChevronDown,
  Lock,
  Unlock,
} from "lucide-react";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { useLanguage } from "../../../context/LanguageContext";

/* ── Translations ───────────────────────────────────────── */
const TXT = {
  en: {
    pageTitle: "Meal Plans",
    pageSubtitle: "Manage available meal plans",
    add: "+ Add",
    toggleLabel: "Meal plan included in net rate",
    toggleSub: "ON = price included in room rate (zero for all groups) · OFF = separate price per group",
    toggleOnBadge: "INCLUDED",
    toggleOffBadge: "SEPARATE",
    includedNote: "Meal plan price is included in the net rate — prices are zero for all groups.",
    search: "Search...",
    colName: "Name",
    colCode: "Code",
    colActions: "Actions",
    empty: "No meal plans yet",
    addTitle: "Add Meal Plan",
    editTitle: "Edit Meal Plan",
    viewTitle: "View Meal Plan",
    nameLabel: "Name",
    namePlaceholder: "Select a meal plan",
    customNamePlaceholder: "Enter custom name",
    codeLabel: "Code",
    codePlaceholder: "BB, HB, FB…",
    pricesLabel: "Prices per guest group",
    cancel: "Cancel",
    save: "Save",
    close: "Close",
    nameRequired: "Name is required",
    codeRequired: "Code is required",
    deleteTitle: "Delete",
    deleteConfirm: "Confirm",
  },
  ar: {
    pageTitle: "خطط الوجبات",
    pageSubtitle: "إدارة خطط الوجبات المتاحة",
    add: "+ إضافة",
    toggleLabel: "خطة الوجبات مضمنة في صافي السعر",
    toggleSub: "مفتوحه = السعر مضمن في سعر الغرفة (صفر لكل المجموعات) · مغلقة = سعر منفصل لكل مجموعة",
    toggleOnBadge: "مضمنة",
    toggleOffBadge: "منفصلة",
    includedNote: "سعر خطة الوجبات مضمن في صافي السعر — الأسعار صفر لجميع المجموعات.",
    search: "بحث...",
    colName: "الاسم",
    colCode: "الرمز",
    colActions: "إجراءات",
    empty: "لا توجد خطط وجبات بعد",
    addTitle: "إضافة خطة وجبات",
    editTitle: "تعديل خطة الوجبات",
    viewTitle: "عرض خطة الوجبات",
    nameLabel: "الاسم",
    namePlaceholder: "اختر خطة وجبات",
    customNamePlaceholder: "أدخل اسمًا مخصصًا",
    codeLabel: "الرمز",
    codePlaceholder: "BB, HB, FB…",
    pricesLabel: "الأسعار لكل مجموعة ضيوف",
    cancel: "إلغاء",
    save: "حفظ",
    close: "إغلاق",
    nameRequired: "الاسم مطلوب",
    codeRequired: "الرمز مطلوب",
  },
};

/* ── Presets ────────────────────────────────────────────── */
const PRESETS = [
  { label: "Bed Only",       code: "RO" },
  { label: "Bed & Breakfast", code: "BB" },
  { label: "Half Board",     code: "HB" },
  { label: "Full Board",     code: "FB" },
  { label: "All Inclusive",  code: "AI" },
  { label: "Other",          code: "" },
];

const INITIAL_GROUPS = [
  { id: "1", name: "Egyptian Market",  currency: "EGP", nationalities: ["Egyptian"] },
  { id: "2", name: "Gulf Market",      currency: "SAR", nationalities: ["Kuwaiti","Emirati","Saudi"] },
  { id: "3", name: "European Market",  currency: "EUR", nationalities: ["British","French","German"] },
];

const INITIAL_PLANS = [
  { id: "1", name: "Bed & Breakfast", code: "BB", prices: { 1: 15, 2: 20, 3: 18 } },
  { id: "2", name: "Half Board",      code: "HB", prices: { 1: 30, 2: 40, 3: 35 } },
  { id: "3", name: "Full Board",      code: "FB", prices: { 1: 50, 2: 60, 3: 55 } },
];

/* ── Helpers ────────────────────────────────────────────── */
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      dir="ltr"
      className="relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200"
      style={{ backgroundColor: checked ? "var(--sidebar-active-text)" : "var(--border)" }}
    >
      <span
        className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out"
        style={{ transform: checked ? "translateX(1.375rem)" : "translateX(0)" }}
      />
    </button>
  );
}

function ActionRow({ onDelete, onEdit, onView }) {
  return (
    <div className="flex items-center gap-1 justify-end">
      <button onClick={onDelete} className="p-1.5 rounded-lg transition-colors hover:bg-red-50" style={{ color: "#ef4444" }}><Trash2 size={15} /></button>
      <button onClick={onEdit}   className="p-1.5 rounded-lg transition-colors hover:bg-amber-50" style={{ color: "#f59e0b" }}><Pencil size={15} /></button>
      <button onClick={onView}   className="p-1.5 rounded-lg transition-colors hover:bg-blue-50"  style={{ color: "#3b82f6" }}><Eye size={15} /></button>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-xl" style={{ backgroundColor: "var(--bg-raised)" }}>
      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{value}</span>
      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{label}</span>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────── */
export default function MealPlansPage() {
  const { lang } = useLanguage();
  const t = TXT[lang] || TXT.en;
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [groups] = useLocalStorage("travky_guest_groups", INITIAL_GROUPS);
  const [plans, setPlans] = useLocalStorage("travky_meal_plans", INITIAL_PLANS);
  const [included, setIncluded] = useLocalStorage("travky_meal_plans_included", false);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  // form: { namePreset, customName, code, prices }
  const [form, setForm] = useState({ namePreset: "Bed & Breakfast", customName: "", code: "BB", prices: {} });
  const [errors, setErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [setPricesModal, setSetPricesModal] = useState(false);
  const [setPricesDraft, setSetPricesDraft] = useState({});

  function openSetPricesModal() {
    // Build draft: for every plan, for every group, use existing price or 0
    const draft = {};
    plans.forEach((plan) => {
      draft[plan.id] = {};
      groups.forEach((g) => { draft[plan.id][g.id] = plan.prices?.[g.id] ?? 0; });
    });
    setSetPricesDraft(draft);
    setSetPricesModal(true);
  }

  function savePricesAndDisable() {
    setPlans((prev) => prev.map((plan) => ({
      ...plan,
      prices: { ...(plan.prices || {}), ...(setPricesDraft[plan.id] || {}) },
    })));
    setIncluded(false);
    setSetPricesModal(false);
  }

  const filtered = plans.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()),
  );

  function buildEmptyPrices() {
    const prices = {};
    groups.forEach((g) => { prices[g.id] = 0; });
    return prices;
  }

  function openAdd() {
    setForm({ namePreset: "Bed & Breakfast", customName: "", code: "BB", prices: buildEmptyPrices() });
    setErrors({});
    setModal("add");
  }

  function openEdit(plan) {
    const prices = buildEmptyPrices();
    groups.forEach((g) => { prices[g.id] = plan.prices[g.id] ?? 0; });
    const preset = PRESETS.find((p) => p.label === plan.name);
    setForm({
      namePreset: preset ? plan.name : "Other",
      customName: preset ? "" : plan.name,
      code: plan.code,
      prices,
    });
    setErrors({});
    setModal({ mode: "edit", data: plan });
  }

  function openView(plan) { setModal({ mode: "view", data: plan }); }
  function closeModal() { setModal(null); setErrors({}); }

  function setPrice(groupId, val) {
    setForm((p) => ({ ...p, prices: { ...p.prices, [groupId]: Number(val) } }));
  }

  function handlePresetChange(label) {
    const preset = PRESETS.find((p) => p.label === label);
    setForm((p) => ({ ...p, namePreset: label, customName: "", code: preset?.code || "" }));
  }

  function handleSave() {
    const errs = {};
    const finalName = form.namePreset === "Other" ? form.customName.trim() : form.namePreset;
    if (!finalName) errs.name = t.nameRequired;
    if (!form.code.trim()) errs.code = t.codeRequired;
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const data = { name: finalName, code: form.code.trim(), prices: form.prices };
    if (modal === "add") {
      setPlans((prev) => [...prev, { id: Date.now().toString(), ...data }]);
    } else if (modal?.mode === "edit") {
      setPlans((prev) => prev.map((p) => p.id === modal.data.id ? { ...p, ...data } : p));
    }
    closeModal();
  }

  const isView = modal?.mode === "view";
  const isEdit = modal?.mode === "edit";

  return (
    <div className="page-shell" dir={dir}>
      <DeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) setPlans((prev) => prev.filter((p) => p.id !== deleteTarget)); setDeleteTarget(null); }}
      />

      {/* Set Meal Plan Prices confirmation modal */}
      {setPricesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-md rounded-2xl shadow-xl flex flex-col" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)", maxHeight: "90vh" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Set Meal Plan Prices</h2>
                <UtensilsCrossed size={18} style={{ color: "#f97316" }} />
              </div>
              <button onClick={() => setSetPricesModal(false)} className="h-7 w-7 grid place-items-center rounded-lg" style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-raised)" }}>
                <X size={15} />
              </button>
            </div>
            {/* Subtitle */}
            <p className="text-sm px-5 py-3 shrink-0" style={{ color: "var(--text-secondary)", borderBottom: "1px solid var(--border)" }}>
              When disabling &quot;Included in Net Rate&quot;, you need to set prices for each meal plan per guest group
            </p>
            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5" dir="ltr">
              {plans.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>No meal plans yet</p>
              ) : plans.map((plan) => (
                <div key={plan.id}>
                  {/* Plan header */}
                  <div className="flex items-center justify-end gap-2 mb-3">
                    <span className="chip text-xs font-bold">{plan.code}</span>
                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{plan.name}</p>
                  </div>
                  {/* Group rows */}
                  {groups.length === 0 ? (
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>No groups</p>
                  ) : groups.map((g) => (
                    <div key={g.id} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                      <div className="text-right">
                        <span className="text-sm font-semibold uppercase" style={{ color: "var(--text-primary)" }}>{g.name}</span>
                        <span className="text-xs ml-1.5" style={{ color: "var(--text-muted)" }}>({g.currency})</span>
                      </div>
                      <input
                        type="number"
                        min={0}
                        value={setPricesDraft[plan.id]?.[g.id] ?? 0}
                        onChange={(e) => setSetPricesDraft((prev) => ({
                          ...prev,
                          [plan.id]: { ...(prev[plan.id] || {}), [g.id]: Number(e.target.value) },
                        }))}
                        className="input text-right"
                        style={{ width: "6rem" }}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {/* Footer */}
            <div className="flex items-center gap-3 px-5 py-4 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
              <button
                onClick={savePricesAndDisable}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: "var(--sidebar-active-text)" }}
              >
                Save
              </button>
              <button
                onClick={() => setSetPricesModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: "var(--bg-raised)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl grid place-items-center" style={{ backgroundColor: "#fff7ed" }}>
            <UtensilsCrossed size={22} style={{ color: "#f97316" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{t.pageTitle}</h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t.pageSubtitle}</p>
          </div>
        </div>
        <AddButton onClick={openAdd}>{t.add}</AddButton>
      </div>

      {/* Toggle */}
      <div className="card">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl grid place-items-center shrink-0"
              style={{ backgroundColor: included ? "#dcfce7" : "#fef9c3" }}
            >
              {included ? <Unlock size={17} style={{ color: "#16a34a" }} /> : <Lock size={17} style={{ color: "#ca8a04" }} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.toggleLabel}</p>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={included
                    ? { backgroundColor: "#dcfce7", color: "#16a34a" }
                    : { backgroundColor: "#fef9c3", color: "#ca8a04" }
                  }
                >
                  {included ? t.toggleOnBadge : t.toggleOffBadge}
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{t.toggleSub}</p>
            </div>
          </div>
          <Toggle checked={included} onChange={() => { if (included) { openSetPricesModal(); } else { setIncluded(true); } }} />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="flex justify-start mb-4">
          <div className="relative">
            <Search size={15} className="absolute top-1/2 -translate-y-1/2 pointer-events-none" style={{ insetInlineEnd: "0.75rem", color: "var(--text-muted)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.search}
              className="input"
              style={{ paddingInlineEnd: "2.5rem", width: "16rem" }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                <th className="pb-3 text-start font-semibold" style={{ color: "var(--text-secondary)", width: 48 }}>#</th>
                <th className="pb-3 text-start font-semibold" style={{ color: "var(--text-secondary)" }}>{t.colName}</th>
                <th className="pb-3 text-start font-semibold" style={{ color: "var(--text-secondary)" }}>{t.colCode}</th>
                {groups.map((g) => (
                  <th key={g.id} className="pb-3 text-start font-semibold" style={{ color: "var(--text-secondary)" }}>
                    <span>{g.name}</span><br />
                    <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>{g.currency}</span>
                  </th>
                ))}
                <th className="pb-3 text-end font-semibold" style={{ color: "var(--text-secondary)" }}>{t.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4 + groups.length} className="py-10 text-center" style={{ color: "var(--text-muted)" }}>{t.empty}</td>
                </tr>
              ) : (
                filtered.map((plan, idx) => (
                  <tr key={plan.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="py-4 font-medium" style={{ color: "var(--text-secondary)" }}>{idx + 1}</td>
                    <td className="py-4 font-semibold" style={{ color: "var(--text-primary)" }}>{plan.name}</td>
                    <td className="py-4"><span className="chip font-mono text-xs">{plan.code}</span></td>
                    {groups.map((g) => (
                      <td key={g.id} className="py-4 font-semibold" style={{ color: "var(--text-primary)" }}>{plan.prices[g.id] ?? 0}</td>
                    ))}
                    <td className="py-4">
                      <ActionRow onDelete={() => setDeleteTarget(plan.id)} onEdit={() => openEdit(plan)} onView={() => openView(plan)} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div
            className="w-full max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <button
                onClick={closeModal}
                className="h-7 w-7 grid place-items-center rounded-lg"
                style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-raised)" }}
              >
                <X size={16} />
              </button>
              <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                {isView ? t.viewTitle : isEdit ? t.editTitle : t.addTitle}
              </h2>
            </div>

            {/* Modal body */}
            <div className="p-6">
              {isView ? (
                <div className="space-y-3">
                  <InfoRow label={t.nameLabel} value={modal.data.name} />
                  <InfoRow label={t.codeLabel} value={modal.data.code} />
                  <div>
                    <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>{t.pricesLabel}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {groups.map((g) => (
                        <div key={g.id} className="flex items-center justify-between py-2 px-3 rounded-xl" style={{ backgroundColor: "var(--bg-raised)" }}>
                          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{modal.data.prices[g.id] ?? 0}</span>
                          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{g.name} ({g.currency})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={closeModal} className="btn btn-secondary w-full mt-2">{t.close}</button>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Name dropdown */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-right" style={{ color: "var(--text-primary)" }}>{t.nameLabel}</label>
                    <div
                      className="relative flex items-center rounded-xl overflow-hidden"
                      style={{ border: "1.5px solid var(--sidebar-active-text)", backgroundColor: "var(--bg-surface)" }}
                    >
                      <ChevronDown size={16} className="absolute pointer-events-none" style={{ insetInlineStart: "0.85rem", color: "var(--text-muted)" }} />
                      <select
                        value={form.namePreset}
                        onChange={(e) => handlePresetChange(e.target.value)}
                        className="w-full bg-transparent outline-none py-3 text-sm font-semibold"
                        style={{
                          paddingInlineStart: "2.25rem",
                          paddingInlineEnd: "1rem",
                          color: "var(--text-primary)",
                          direction: "ltr",
                          textAlign: dir === "rtl" ? "right" : "left",
                        }}
                      >
                        {PRESETS.map((p) => (
                          <option key={p.label} value={p.label}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                    {errors.name && <p className="input-error mt-1">{errors.name}</p>}
                  </div>

                  {/* When Other: Code + Custom Name side by side */}
                  {form.namePreset === "Other" ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1.5 text-right" style={{ color: "var(--text-secondary)" }}>{t.codeLabel}</label>
                        <input
                          value={form.code}
                          onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                          className="input w-full font-mono"
                          placeholder={t.codePlaceholder}
                          style={{ textAlign: "center" }}
                        />
                        {errors.code && <p className="input-error mt-1">{errors.code}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5 text-right" style={{ color: "var(--text-secondary)" }}>{t.nameLabel}</label>
                        <input
                          value={form.customName}
                          onChange={(e) => setForm((p) => ({ ...p, customName: e.target.value }))}
                          className="input w-full"
                          placeholder={t.customNamePlaceholder}
                          style={{ textAlign: dir === "rtl" ? "right" : "left" }}
                        />
                      </div>
                    </div>
                  ) : (
                    /* Standard preset: just the Code field */
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-right" style={{ color: "var(--text-primary)" }}>{t.codeLabel}</label>
                      <input
                        value={form.code}
                        onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                        className="input w-full font-mono"
                        placeholder={t.codePlaceholder}
                        style={{ textAlign: dir === "rtl" ? "right" : "left" }}
                      />
                      {errors.code && <p className="input-error mt-1">{errors.code}</p>}
                    </div>
                  )}

                  {/* Prices — hidden when meal plan is included in rate */}
                  {included ? (
                    <div
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
                      style={{ backgroundColor: "#dcfce7", border: "1px solid #86efac" }}
                    >
                      <Unlock size={17} style={{ color: "#16a34a", flexShrink: 0 }} />
                      <p className="text-sm font-medium" style={{ color: "#15803d" }}>{t.includedNote}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold mb-3 text-right" style={{ color: "var(--text-primary)" }}>{t.pricesLabel}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {groups.map((g) => (
                          <div
                            key={g.id}
                            className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl"
                            style={{ backgroundColor: "var(--bg-raised)", border: "1px solid var(--border)" }}
                          >
                            <input
                              type="number"
                              min="0"
                              value={form.prices[g.id] ?? 0}
                              onChange={(e) => setPrice(g.id, e.target.value)}
                              className="bg-transparent outline-none font-semibold text-sm w-20 shrink-0"
                              style={{ color: "var(--text-primary)" }}
                            />
                            <span className="text-sm text-right" style={{ color: "var(--text-secondary)" }}>
                              {g.name}{" "}
                              <span style={{ color: "var(--sidebar-active-text)" }}>({g.currency})</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2.5 pt-2 justify-end">
                    <button onClick={closeModal} className="btn btn-secondary">{t.cancel}</button>
                    <button onClick={handleSave} className="btn text-white" style={{ backgroundColor: "var(--sidebar-active-text)" }}>{t.save}</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
