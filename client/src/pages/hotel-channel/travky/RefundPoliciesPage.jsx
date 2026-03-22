import { useState } from "react";
import { RotateCcw, Plus, Search, Trash2, Pencil, Eye, X } from "lucide-react";
import { useLocalStorage } from "../../../hooks/useLocalStorage";

const INITIAL_GROUPS = [
  { id: "1", name: "Egyptian Market", currency: "EGP" },
  { id: "2", name: "Gulf Market", currency: "SAR" },
  { id: "3", name: "European Market", currency: "EUR" },
];

// type: "non_refundable" | "free_cancellation" | "partial"
const INITIAL_POLICIES = [
  {
    id: "1",
    name: "Non-Refundable",
    type: "non_refundable",
    daysBeforeArrival: null,
    feesPercent: 100,
    extraPrices: { 1: 0, 2: 0, 3: 0 },
  },
  {
    id: "2",
    name: "Flexible",
    type: "free_cancellation",
    daysBeforeArrival: 1,
    feesPercent: 0,
    extraPrices: { 1: 50, 2: 5, 3: 4 },
  },
  {
    id: "3",
    name: "Moderate",
    type: "partial",
    daysBeforeArrival: 3,
    feesPercent: 50,
    extraPrices: { 1: 100, 2: 10, 3: 8 },
  },
];

const POLICY_TYPES = [
  {
    value: "non_refundable",
    label: "غير قابل للاسترداد",
    color: "#ef4444",
    bg: "#fef2f2",
  },
  {
    value: "free_cancellation",
    label: "إلغاء مجاني",
    color: "#16a34a",
    bg: "#f0fdf4",
  },
  { value: "partial", label: "جزئي", color: "#d97706", bg: "#fffbeb" },
];

function getPolicyType(value) {
  return POLICY_TYPES.find((t) => t.value === value);
}

function PolicyBadge({ type }) {
  const t = getPolicyType(type);
  if (!t) return null;
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: t.bg, color: t.color }}
    >
      {t.label}
    </span>
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

const EMPTY_FORM = {
  name: "",
  type: "free_cancellation",
  daysBeforeArrival: 1,
  feesPercent: 0,
  extraPrices: {},
};

export default function RefundPoliciesPage() {
  const [groups] = useLocalStorage("travky_guest_groups", INITIAL_GROUPS);
  const [policies, setPolicies] = useLocalStorage(
    "travky_refund_policies",
    INITIAL_POLICIES,
  );
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const filtered = policies.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  function resetForm() {
    const extraPrices = {};
    groups.forEach((g) => {
      extraPrices[g.id] = 0;
    });
    return { ...EMPTY_FORM, extraPrices };
  }

  function openAdd() {
    setForm(resetForm());
    setErrors({});
    setModal("add");
  }

  function openEdit(policy) {
    const extraPrices = {};
    groups.forEach((g) => {
      extraPrices[g.id] = policy.extraPrices[g.id] ?? 0;
    });
    setForm({
      name: policy.name,
      type: policy.type,
      daysBeforeArrival: policy.daysBeforeArrival ?? 1,
      feesPercent: policy.feesPercent,
      extraPrices,
    });
    setErrors({});
    setModal({ mode: "edit", data: policy });
  }

  function openView(policy) {
    setModal({ mode: "view", data: policy });
  }

  function closeModal() {
    setModal(null);
    setErrors({});
  }

  function setExtraPrice(groupId, val) {
    setForm((p) => ({
      ...p,
      extraPrices: { ...p.extraPrices, [groupId]: Number(val) },
    }));
  }

  function handleSave() {
    const errs = {};
    if (!form.name.trim()) errs.name = "الاسم مطلوب";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const data = {
      id: Date.now().toString(),
      name: form.name,
      type: form.type,
      daysBeforeArrival:
        form.type === "non_refundable" ? null : form.daysBeforeArrival,
      feesPercent: form.type === "non_refundable" ? 100 : form.feesPercent,
      extraPrices: form.extraPrices,
    };

    if (modal === "add") {
      setPolicies((prev) => [...prev, data]);
    } else if (modal?.mode === "edit") {
      setPolicies((prev) =>
        prev.map((p) => (p.id === modal.data.id ? { ...data, id: p.id } : p)),
      );
    }
    closeModal();
  }

  function handleDelete(id) {
    if (window.confirm("هل تريد حذف سياسة الاسترداد؟")) {
      setPolicies((prev) => prev.filter((p) => p.id !== id));
    }
  }

  const isView = modal?.mode === "view";
  const isEdit = modal?.mode === "edit";
  const showDays = form.type !== "non_refundable";
  const showFees = form.type === "partial";

  return (
    <div className="page-shell">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl grid place-items-center"
            style={{ backgroundColor: "#fef3c7" }}
          >
            <RotateCcw size={22} style={{ color: "#d97706" }} />
          </div>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              سياسات الاسترداد
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              تحديد قواعد الإلغاء والاسترداد
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
                <th
                  className="pb-3 text-start font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  نوع السياسة
                </th>
                <th
                  className="pb-3 text-start font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  أيام قبل الوصول
                </th>
                <th
                  className="pb-3 text-start font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  الرسوم
                </th>
                <th
                  className="pb-3 text-start font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  سعر إضافي
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
                    colSpan={7}
                    className="py-10 text-center"
                    style={{ color: "var(--text-muted)" }}
                  >
                    لا توجد سياسات استرداد بعد
                  </td>
                </tr>
              ) : (
                filtered.map((policy, idx) => (
                  <tr
                    key={policy.id}
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
                      {policy.name}
                    </td>
                    <td className="py-4">
                      <PolicyBadge type={policy.type} />
                    </td>
                    <td
                      className="py-4 font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {policy.daysBeforeArrival != null ? (
                        <span className="chip">
                          {policy.daysBeforeArrival} أيام
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td
                      className="py-4 font-semibold"
                      style={{
                        color:
                          policy.feesPercent > 0
                            ? "var(--danger)"
                            : "var(--success)",
                      }}
                    >
                      {policy.feesPercent}%
                    </td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-1">
                        {groups.map((g) => (
                          <span
                            key={g.id}
                            className="chip text-xs font-semibold"
                          >
                            {g.currency} {policy.extraPrices[g.id] ?? 0}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4">
                      <ActionRow
                        onDelete={() => handleDelete(policy.id)}
                        onEdit={() => openEdit(policy)}
                        onView={() => openView(policy)}
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
            className="w-full max-w-md rounded-2xl p-6 shadow-xl overflow-y-auto max-h-[90vh]"
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
                  ? "عرض سياسة الاسترداد"
                  : isEdit
                    ? "تعديل السياسة"
                    : "إضافة سياسة استرداد"}
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
                    نوع السياسة
                  </p>
                  <PolicyBadge type={modal.data.type} />
                </div>
                {modal.data.daysBeforeArrival != null && (
                  <div>
                    <p
                      className="text-xs font-medium mb-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      أيام قبل الوصول
                    </p>
                    <p
                      className="font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {modal.data.daysBeforeArrival}
                    </p>
                  </div>
                )}
                <div>
                  <p
                    className="text-xs font-medium mb-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    الرسوم
                  </p>
                  <p
                    className="font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {modal.data.feesPercent}%
                  </p>
                </div>
                <div>
                  <p
                    className="text-xs font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    سعر إضافي
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
                          {modal.data.extraPrices[g.id] ?? 0}
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
                    placeholder="e.g. Non-Refundable, Flexible"
                  />
                  {errors.name && (
                    <p className="input-error mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    نوع السياسة
                  </label>
                  <div className="flex gap-1.5">
                    {POLICY_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() =>
                          setForm((p) => ({ ...p, type: t.value }))
                        }
                        className="flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all border-2"
                        style={
                          form.type === t.value
                            ? {
                                backgroundColor: t.bg,
                                color: t.color,
                                borderColor: t.color,
                              }
                            : {
                                backgroundColor: "var(--bg-raised)",
                                color: "var(--text-secondary)",
                                borderColor: "var(--border)",
                              }
                        }
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {showDays && (
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      أيام قبل الوصول
                      <span
                        className="ms-2 font-bold"
                        style={{ color: "var(--sidebar-active-text)" }}
                      >
                        {form.daysBeforeArrival} أيام
                      </span>
                    </label>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        30 يوم
                      </span>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        value={form.daysBeforeArrival}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            daysBeforeArrival: Number(e.target.value),
                          }))
                        }
                        className="flex-1"
                        dir="ltr"
                      />
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        1 يوم
                      </span>
                    </div>
                  </div>
                )}

                {showFees && (
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--text-primary)" }}
                    >
                      نسبة الرسوم (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.feesPercent}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          feesPercent: Number(e.target.value),
                        }))
                      }
                      className="input"
                    />
                  </div>
                )}

                <div>
                  <p
                    className="text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    سعر إضافي
                  </p>
                  <p
                    className="text-xs mb-3"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    سعر إضافي يُضاف فوق سعر الغرفة لهذه الخطة
                  </p>
                  <div className="space-y-2">
                    {groups.map((g) => (
                      <div key={g.id} className="flex items-center gap-3">
                        <input
                          type="number"
                          min="0"
                          value={form.extraPrices[g.id] ?? 0}
                          onChange={(e) => setExtraPrice(g.id, e.target.value)}
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

