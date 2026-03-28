import { useState, useMemo } from "react";
import {
  Users, Search, Trash2, Pencil, Eye, X, DollarSign, AlertTriangle,
  ChevronLeft, ChevronRight, BedDouble, Building2, ChevronDown, ChevronUp, ShieldCheck,
} from "lucide-react";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import DeleteConfirmModal from "../../../components/DeleteConfirmModal";
import AddButton from "../../../components/AddButton";

/* ─────────────── Constants ─────────────── */
const CURRENCIES = ["EGP", "SAR", "AED", "USD", "EUR", "GBP", "KWD", "QAR", "JOD", "MAD"];

const COUNTRY_CODES = {
  "Egypt": "EG", "Saudi Arabia": "SA", "UAE": "AE", "Kuwait": "KW",
  "Qatar": "QA", "Jordan": "JO", "Bahrain": "BH", "Oman": "OM",
  "Morocco": "MA", "Tunisia": "TN", "Libya": "LY", "Algeria": "DZ",
  "Iraq": "IQ", "Lebanon": "LB", "Yemen": "YE", "Palestine": "PS",
  "UK": "GB", "France": "FR", "Germany": "DE", "Italy": "IT",
  "Spain": "ES", "Netherlands": "NL", "Russia": "RU", "China": "CN",
  "India": "IN", "Turkey": "TR", "USA": "US", "Belgium": "BE", "Austria": "AT",
};
const NATIONALITIES = Object.keys(COUNTRY_CODES);



const INITIAL_GROUPS = [
  { id: "1", name: "Egyptian Market", currency: "EGP", nationalities: ["Egypt"], prices: {} },
  { id: "2", name: "Gulf Market", currency: "SAR", nationalities: ["Kuwait", "UAE", "Saudi Arabia"], prices: {} },
  { id: "3", name: "European Market", currency: "EUR", nationalities: ["UK", "France", "Germany"], prices: {} },
];

/* ─────────────── Price Helpers ─────────────── */
function buildEmptyPrices(supplements = [], refundPolicies = [], roomTypes = []) {
  const prices = { supplements: {}, refundPolicies: {}, rooms: {} };
  supplements.forEach((s) => { prices.supplements[s.id] = 0; });
  refundPolicies.forEach((p) => { prices.refundPolicies[p.id] = 0; });
  roomTypes.forEach((room) => {
    const sets = room.bedOptionSets || [];
    const caps = room.capacityOptions || [];
    const maxOpts = Math.max(sets.length, caps.length);
    if (maxOpts === 0) return;
    const hasContent =
      sets.some((s) => (s.otherBeds || []).length > 0) ||
      caps.some((c) => (c.childConfigs || []).some((cc) => cc.priceType === "Fixed Amount"));
    if (!hasContent) return;
    const optMap = {};
    for (let k = 0; k < maxOpts; k++) {
      optMap[k] = { children: {}, beds: {} };
      const cap = caps[k];
      if (cap) (cap.childConfigs || []).forEach((cc, ci) => { if (cc.priceType === "Fixed Amount") optMap[k].children[ci] = 0; });
      const set = sets[k];
      if (set) (set.otherBeds || []).forEach((_, bi) => { optMap[k].beds[bi] = 0; });
    }
    prices.rooms[room.id] = optMap;
  });
  return prices;
}

function mergePrices(existing = {}, supplements = [], refundPolicies = [], roomTypes = []) {
  const fresh = buildEmptyPrices(supplements, refundPolicies, roomTypes);
  Object.keys(fresh.supplements).forEach((sid) => { fresh.supplements[sid] = existing.supplements?.[sid] ?? 0; });
  Object.keys(fresh.refundPolicies).forEach((pid) => { fresh.refundPolicies[pid] = existing.refundPolicies?.[pid] ?? 0; });
  Object.keys(fresh.rooms).forEach((rid) => {
    Object.keys(fresh.rooms[rid]).forEach((oi) => {
      Object.keys(fresh.rooms[rid][oi].children || {}).forEach((ci) => {
        fresh.rooms[rid][oi].children[ci] = existing.rooms?.[rid]?.[oi]?.children?.[ci] ?? 0;
      });
      Object.keys(fresh.rooms[rid][oi].beds || {}).forEach((bi) => {
        fresh.rooms[rid][oi].beds[bi] = existing.rooms?.[rid]?.[oi]?.beds?.[bi] ?? 0;
      });
    });
  });
  return fresh;
}

/* ─────────────── Sub-components ─────────────── */
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
      <button onClick={onDelete} className="p-1.5 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/20" style={{ color: "#ef4444" }} title="Delete">
        <Trash2 size={15} />
      </button>
      <button onClick={onEdit} className="p-1.5 rounded-lg transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/20" style={{ color: "#f59e0b" }} title="Edit">
        <Pencil size={15} />
      </button>
      <button onClick={onView} className="p-1.5 rounded-lg transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20" style={{ color: "#3b82f6" }} title="View">
        <Eye size={15} />
      </button>
    </div>
  );
}

/* ─────────────── Main Page ─────────────── */
export default function GuestGroupsPage() {
  const [groups, setGroups] = useLocalStorage("travky_guest_groups", INITIAL_GROUPS);
  const [enabled, setEnabled] = useLocalStorage("travky_guest_groups_enabled", true);
  const [supplements] = useLocalStorage("travky_supplements", []);
  const [refundPolicies] = useLocalStorage("travky_refund_policies", []);
  const [roomTypes] = useLocalStorage("travky_room_types", []);
  const [defaultCurrency, setDefaultCurrency] = useLocalStorage("travky_default_currency", null);

  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", currency: "EGP", nationalities: [], prices: {} });
  const [errors, setErrors] = useState({});
  const [natSearch, setNatSearch] = useState("");
  const [natOpen, setNatOpen] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currencyModal, setCurrencyModal] = useState(false);

  const [natPopup, setNatPopup] = useState(null); // group.id whose nationalities popup is open
  const [sourceGroupModal, setSourceGroupModal] = useState(null); // { currency, groups }

  const filtered = groups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));
  const filteredNats = NATIONALITIES.filter(
    (n) => n.toLowerCase().includes(natSearch.toLowerCase()) || (COUNTRY_CODES[n] || "").toLowerCase().includes(natSearch.toLowerCase()),
  );
  const roomsWithPrices = roomTypes.filter((r) =>
    (r.bedOptionSets || []).some((s) => (s.otherBeds || []).length > 0) ||
    (r.capacityOptions || []).some((c) => (c.childConfigs || []).some((cc) => cc.priceType === "Fixed Amount"))
  );

  const currencyOptions = useMemo(() => {
    const map = {};
    groups.forEach((g) => { map[g.currency] = (map[g.currency] || 0) + 1; });
    return Object.entries(map).map(([currency, count]) => ({ currency, count }));
  }, [groups]);

  function openAdd() {
    setForm({ name: "", currency: "EGP", nationalities: [], prices: buildEmptyPrices(supplements, refundPolicies, roomTypes) });
    setStep(1); setErrors({}); setNatSearch(""); setNatOpen(true);
    setModal("add");
  }

  function openEdit(group) {
    const prices = mergePrices(group.prices, supplements, refundPolicies, roomTypes);
    setForm({ name: group.name, currency: group.currency, nationalities: [...(group.nationalities || [])], prices });
    setStep(1); setErrors({}); setNatSearch(""); setNatOpen(false);
    setModal({ mode: "edit", data: group });
  }

  function openView(group) { setModal({ mode: "view", data: group }); }
  function closeModal() { setModal(null); setErrors({}); setStep(1); setNatSearch(""); }

  function goToStep2() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    const hasData = supplements.length > 0 || refundPolicies.length > 0 || roomsWithPrices.length > 0;
    if (!hasData) { handleSave(); return; }
    setStep(2);
  }

  function toggleNationality(nat) {
    setForm((p) => ({
      ...p,
      nationalities: p.nationalities.includes(nat) ? p.nationalities.filter((n) => n !== nat) : [...p.nationalities, nat],
    }));
  }

  function setPriceField(section, key, val) {
    setForm((p) => ({
      ...p,
      prices: { ...p.prices, [section]: { ...(p.prices?.[section] || {}), [key]: Number(val) } },
    }));
  }

  function setRoomBedPrice(roomId, optIdx, bedIdx, val) {
    setForm((p) => ({
      ...p,
      prices: {
        ...p.prices,
        rooms: {
          ...(p.prices?.rooms || {}),
          [roomId]: {
            ...(p.prices?.rooms?.[roomId] || {}),
            [optIdx]: {
              ...(p.prices?.rooms?.[roomId]?.[optIdx] || {}),
              beds: { ...(p.prices?.rooms?.[roomId]?.[optIdx]?.beds || {}), [bedIdx]: Number(val) },
            },
          },
        },
      },
    }));
  }

  function setRoomChildPrice(roomId, optIdx, childIdx, val) {
    setForm((p) => ({
      ...p,
      prices: {
        ...p.prices,
        rooms: {
          ...(p.prices?.rooms || {}),
          [roomId]: {
            ...(p.prices?.rooms?.[roomId] || {}),
            [optIdx]: {
              ...(p.prices?.rooms?.[roomId]?.[optIdx] || {}),
              children: { ...(p.prices?.rooms?.[roomId]?.[optIdx]?.children || {}), [childIdx]: Number(val) },
            },
          },
        },
      },
    }));
  }

  function handleSave() {
    const saveData = { name: form.name, currency: form.currency, nationalities: form.nationalities, prices: form.prices };
    if (modal === "add") {
      setGroups((prev) => [...prev, { id: Date.now().toString(), ...saveData }]);
    } else if (modal?.mode === "edit") {
      setGroups((prev) => prev.map((g) => (g.id === modal.data.id ? { ...g, ...saveData } : g)));
    }
    closeModal();
  }

  function confirmDelete() {
    if (deleteTarget) setGroups((prev) => prev.filter((g) => g.id !== deleteTarget));
    setDeleteTarget(null);
  }

  function handleToggle() { if (enabled) { setCurrencyModal(true); } else { setEnabled(true); } }

  const isView = modal?.mode === "view";
  const isEdit = modal?.mode === "edit";

  function StepIndicator() {
    return (
      <div className="flex items-center gap-2 text-xs" dir="ltr">
        <span style={{ color: step === 2 ? "var(--text-primary)" : "var(--text-muted)", fontWeight: step === 2 ? 600 : 400 }}>Group Prices</span>
        <span className="w-5 h-5 rounded-full grid place-items-center text-xs font-bold" style={{ backgroundColor: step === 2 ? "var(--sidebar-active-text)" : "var(--bg-raised)", color: step === 2 ? "white" : "var(--text-muted)", border: "1px solid var(--border)" }}>2</span>
        <span style={{ color: "var(--text-muted)" }}>&#8594;</span>
        <span style={{ color: step === 1 ? "var(--text-primary)" : "var(--text-muted)", fontWeight: step === 1 ? 600 : 400 }}>Group Info</span>
        <span className="w-5 h-5 rounded-full grid place-items-center text-xs font-bold" style={{ backgroundColor: step === 1 ? "var(--sidebar-active-text)" : "var(--bg-raised)", color: step === 1 ? "white" : "var(--text-muted)", border: "1px solid var(--border)" }}>1</span>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <DeleteConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} />

      {/* Currency modal */}
      {currencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-xl" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }} dir="rtl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg grid place-items-center" style={{ backgroundColor: "#1e293b" }}><DollarSign size={16} color="white" /></div>
                <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>اختر العملة الافتراضية</h2>
              </div>
              <button onClick={() => setCurrencyModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700" style={{ color: "var(--text-muted)" }}><X size={16} /></button>
            </div>
            <div className="rounded-xl px-4 py-3 text-sm leading-relaxed mb-4" style={{ backgroundColor: "var(--bg-raised)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
              عند إيقاف نظام مجموعات الضيوف، يجب اختيار العملة التي ستُستخدم كعملة افتراضية للفندق.
            </div>
            <div className="space-y-2">
              {currencyOptions.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>لا توجد مجموعات بعملات محددة</p>
              ) : currencyOptions.map(({ currency, count }) => (
                <button key={currency} onClick={() => {
                  if (count > 1) {
                    setSourceGroupModal({ currency, groups: groups.filter((g) => g.currency === currency) });
                    setCurrencyModal(false);
                  } else {
                    setDefaultCurrency(currency);
                    setEnabled(false);
                    setCurrencyModal(false);
                  }
                }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors hover:opacity-90"
                  style={{ backgroundColor: "var(--bg-raised)", border: "1px solid var(--border)" }}>
                  <ChevronLeft size={16} style={{ color: "var(--text-muted)" }} />
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{currency}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{count} مجموعة</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl grid place-items-center" style={{ backgroundColor: "#1e3a5f" }}><DollarSign size={16} color="white" /></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Source group modal */}
      {sourceGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-xl" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }} dir="ltr">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg grid place-items-center" style={{ backgroundColor: "#1e293b" }}>
                  <Users size={16} color="white" />
                </div>
                <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Select Source Group</h2>
              </div>
              <button onClick={() => setSourceGroupModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700" style={{ color: "var(--text-muted)" }}>
                <X size={16} />
              </button>
            </div>
            {/* Warning banner */}
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 mb-3" style={{ backgroundColor: "#fffbeb", border: "1px solid #fcd34d" }}>
              <AlertTriangle size={15} style={{ color: "#d97706", flexShrink: 0 }} />
              <p className="text-sm font-medium" style={{ color: "#92400e" }}>
                Multiple guest groups use &apos;{sourceGroupModal.currency}&apos; currency
              </p>
            </div>
            {/* Description */}
            <div className="rounded-xl px-4 py-3 text-sm leading-relaxed mb-4" style={{ backgroundColor: "var(--bg-raised)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
              Choose the group whose prices will be used as the default. The selected group&apos;s prices will be applied to all data: meal plans, supplements, refund policies, room price calculator, price children &amp; more.
            </div>
            {/* Group options */}
            <div className="space-y-2">
              {sourceGroupModal.groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => { setDefaultCurrency(g.currency); setEnabled(false); setSourceGroupModal(null); }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors hover:opacity-90"
                  style={{ backgroundColor: "var(--bg-raised)", border: "1px solid var(--border)" }}
                >
                  <div className="w-9 h-9 rounded-xl grid place-items-center" style={{ backgroundColor: "#1e3a5f" }}>
                    <Users size={15} color="white" />
                  </div>
                  <div className="text-left flex-1 mx-3">
                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{g.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      nationalities: {g.nationalities?.length ?? 0} &bull; {g.currency} $
                    </p>
                  </div>
                  <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl grid place-items-center" style={{ backgroundColor: "#fce7f3" }}>
            <Users size={22} style={{ color: "#ec4899" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>مجموعات الضيوف</h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>إدارة أنواع مجموعات الضيوف</p>
          </div>
        </div>
        <AddButton onClick={openAdd}>إضافة</AddButton>
      </div>

      {/* Toggle row */}
      <div className="card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>تفعيل مجموعات الضيوف</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>فعّل لإضافة ضيوف مخصصة، أو ألغ لاستخدام عملة الفندق الافتراضية</p>
          </div>
          <Toggle checked={enabled} onChange={handleToggle} />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="flex justify-start mb-4">
          <div className="relative">
            <Search size={15} className="absolute top-1/2 -translate-y-1/2 pointer-events-none" style={{ insetInlineEnd: "0.75rem", color: "var(--text-muted)" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث..." className="input" style={{ paddingInlineEnd: "2.5rem", width: "16rem" }} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                <th className="pb-3 text-start font-semibold" style={{ color: "var(--text-secondary)", width: 48 }}>#</th>
                <th className="pb-3 text-start font-semibold" style={{ color: "var(--text-secondary)" }}>الاسم</th>
                <th className="pb-3 text-start font-semibold" style={{ color: "var(--text-secondary)" }}>العملة</th>
                <th className="pb-3 text-start font-semibold" style={{ color: "var(--text-secondary)" }}>الجنسيات</th>
                <th className="pb-3 text-end font-semibold" style={{ color: "var(--text-secondary)" }}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center" style={{ color: "var(--text-muted)" }}>لا توجد مجموعات ضيوف بعد</td></tr>
              ) : filtered.map((group, idx) => (
                <tr key={group.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="py-4 font-medium" style={{ color: "var(--text-secondary)" }}>{idx + 1}</td>
                  <td className="py-4 font-semibold uppercase" style={{ color: "var(--text-primary)" }}>{group.name}</td>
                  <td className="py-4">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: "var(--bg-raised)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                    >
                      <span style={{ color: "var(--sidebar-active-text)" }}>$</span>{group.currency}
                    </span>
                  </td>
                  <td className="py-4">
                    <button
                      onClick={() => setNatPopup(natPopup === group.id ? null : group.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors hover:opacity-80"
                      style={{ backgroundColor: "var(--bg-raised)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                    >
                      <Eye size={13} style={{ color: "var(--sidebar-active-text)" }} />
                      {(group.nationalities || []).length} Nationalities
                    </button>
                    {natPopup === group.id && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.35)" }} onClick={() => setNatPopup(null)}>
                        <div
                          className="w-full max-w-sm rounded-2xl shadow-xl p-5"
                          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-bold uppercase" style={{ color: "var(--text-primary)" }}>{group.name.toUpperCase()} — Nationalities</p>
                            <button onClick={() => setNatPopup(null)} className="h-7 w-7 grid place-items-center rounded-lg" style={{ backgroundColor: "var(--bg-raised)", color: "var(--text-muted)" }}><X size={14} /></button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(group.nationalities || []).length === 0 ? (
                              <p className="text-xs" style={{ color: "var(--text-muted)" }}>None</p>
                            ) : (group.nationalities || []).map((nat) => (
                              <span
                                key={nat}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                                style={{ backgroundColor: "var(--bg-raised)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                              >
                                {nat}
                                {COUNTRY_CODES[nat] && (
                                  <span className="font-bold text-xs" style={{ color: "var(--sidebar-active-text)" }}>{COUNTRY_CODES[nat]}</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-4">
                    <ActionRow onDelete={() => setDeleteTarget(group.id)} onEdit={() => openEdit(group)} onView={() => openView(group)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl shadow-xl" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}>

            {/* Modal header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4" style={{ backgroundColor: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>
              {isView ? (
                <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>عرض المجموعة</h2>
              ) : (
                <StepIndicator />
              )}
              <button onClick={closeModal} className="h-7 w-7 grid place-items-center rounded-lg ml-3" style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-raised)" }}>
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-5">
              {/* VIEW MODE */}
              {isView ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>الاسم</p>
                    <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{modal.data.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>العملة</p>
                    <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{modal.data.currency}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>الجنسيات</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(modal.data.nationalities || []).map((n) => (
                        <span key={n} className="chip">{COUNTRY_CODES[n] ? `${COUNTRY_CODES[n]} ` : ""}{n}</span>
                      ))}
                    </div>
                  </div>
                  <button onClick={closeModal} className="btn btn-secondary w-full mt-2">إغلاق</button>
                </div>
              ) : step === 1 ? (
                /* STEP 1: Group Info */
                <div className="space-y-4" dir="ltr">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-right" style={{ color: "var(--text-primary)" }}>Name</label>
                    <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="input w-full" placeholder="e.g. Egyptian Market" />
                    {errors.name && <p className="input-error mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-right" style={{ color: "var(--text-primary)" }}>Currency</label>
                    <div className="relative">
                      <select value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))} className="input w-full appearance-none" style={{ paddingLeft: "2rem" }}>
                        {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-right" style={{ color: "var(--text-primary)" }}>Nationalities</label>
                    {form.nationalities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {form.nationalities.map((nat) => (
                          <span key={nat} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: "var(--sidebar-active-text)" }}>
                            <span className="font-bold">{COUNTRY_CODES[nat] || "??"}</span>
                            <span>{nat}</span>
                            <button onClick={() => toggleNationality(nat)} className="ml-0.5 opacity-80 hover:opacity-100"><X size={10} /></button>
                          </span>
                        ))}
                      </div>
                    )}
                    <button onClick={() => setNatOpen((o) => !o)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm" style={{ backgroundColor: "var(--bg-raised)", border: "1px solid var(--border)" }}>
                      <span style={{ color: "var(--text-muted)" }}>{form.nationalities.length > 0 ? `${form.nationalities.length} selected` : "Select nationalities..."}</span>
                      {natOpen ? <ChevronUp size={15} style={{ color: "var(--text-muted)" }} /> : <ChevronDown size={15} style={{ color: "var(--text-muted)" }} />}
                    </button>
                    {natOpen && (
                      <div className="rounded-xl overflow-hidden mt-1" style={{ border: "1px solid var(--border)" }}>
                        <div className="px-3 py-2" style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--bg-raised)" }}>
                          <input value={natSearch} onChange={(e) => setNatSearch(e.target.value)} className="w-full bg-transparent outline-none text-sm" placeholder="Search..." style={{ color: "var(--text-primary)" }} />
                        </div>
                        <div className="max-h-52 overflow-y-auto" style={{ backgroundColor: "var(--bg-surface)" }}>
                          {filteredNats.length === 0 ? (
                            <p className="py-4 text-center text-xs" style={{ color: "var(--text-muted)" }}>No results</p>
                          ) : filteredNats.map((nat) => {
                            const selected = form.nationalities.includes(nat);
                            return (
                              <button key={nat} onClick={() => toggleNationality(nat)} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors hover:opacity-80" style={{ borderBottom: "1px solid var(--border)" }}>
                                <div className="w-4 h-4 rounded-full border-2 shrink-0 transition-colors" style={{ borderColor: selected ? "var(--sidebar-active-text)" : "var(--border)", backgroundColor: selected ? "var(--sidebar-active-text)" : "transparent" }} />
                                <span className="text-xs font-bold w-6" style={{ color: "var(--text-muted)" }}>{COUNTRY_CODES[nat] || "??"}</span>
                                <span style={{ color: "var(--text-primary)" }}>{nat}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2.5 pt-2 justify-end">
                    <button onClick={closeModal} className="btn btn-secondary">Cancel</button>
                    <button onClick={goToStep2} className="btn text-white" style={{ backgroundColor: "var(--sidebar-active-text)" }}>Next &#8594;</button>
                  </div>
                </div>
              ) : (
                /* STEP 2: Group Prices */
                <div className="space-y-5" dir="ltr">
                  <div className="rounded-xl px-4 py-3.5" style={{ backgroundColor: "#1e3a5f" }}>
                    <div className="flex items-start gap-2.5">
                      <DollarSign size={18} color="white" className="mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-white">Set prices for &quot;{form.name}&quot; ({form.currency})</p>
                        <p className="text-xs mt-0.5" style={{ color: "#93c5fd" }}>Enter prices for all existing channel manager data</p>
                      </div>
                    </div>
                  </div>

                  {supplements.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <BedDouble size={16} style={{ color: "var(--sidebar-active-text)" }} />
                        <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Supplements</p>
                        <span className="w-5 h-5 rounded-full grid place-items-center font-bold text-white" style={{ backgroundColor: "var(--sidebar-active-text)", fontSize: 10 }}>{supplements.length}</span>
                      </div>
                      {supplements.map((s) => (
                        <div key={s.id} className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{s.name}</span>
                          <div className="flex items-center gap-2">
                            <input type="number" min={0} value={form.prices?.supplements?.[s.id] ?? 0} onChange={(e) => setPriceField("supplements", s.id, e.target.value)} className="input text-right" style={{ width: "5rem" }} />
                            <span className="text-sm w-10" style={{ color: "var(--text-secondary)" }}>{form.currency}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {refundPolicies.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck size={16} style={{ color: "#10b981" }} />
                        <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Refund Policies</p>
                        <span className="w-5 h-5 rounded-full grid place-items-center font-bold text-white" style={{ backgroundColor: "#10b981", fontSize: 10 }}>{refundPolicies.length}</span>
                      </div>
                      {refundPolicies.map((pol) => (
                        <div key={pol.id} className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                          <div>
                            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{pol.name.toUpperCase()}</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{(pol.type || "").replace(/_/g, "-")}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="number" min={0} value={form.prices?.refundPolicies?.[pol.id] ?? 0} onChange={(e) => setPriceField("refundPolicies", pol.id, e.target.value)} className="input text-right" style={{ width: "5rem" }} />
                            <span className="text-sm w-10" style={{ color: "var(--text-secondary)" }}>{form.currency}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {roomsWithPrices.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 size={16} style={{ color: "var(--sidebar-active-text)" }} />
                        <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Room Prices (Paid Children &amp; Beds)</p>
                      </div>
                      {roomsWithPrices.map((room) => {
                        const sets = room.bedOptionSets || [];
                        const caps = room.capacityOptions || [];
                        const maxOpts = Math.max(sets.length, caps.length, 1);
                        return (
                          <div key={room.id} className="mb-4">
                            <div className="flex items-center gap-2 mb-2 py-1.5" style={{ borderBottom: "1px solid var(--border)" }}>
                              <Building2 size={13} style={{ color: "var(--text-secondary)" }} />
                              <p className="text-xs font-bold uppercase" style={{ color: "var(--text-primary)" }}>{room.nameEn}</p>
                              <span className="chip text-xs">{room.roomType}</span>
                            </div>
                            {Array.from({ length: maxOpts }, (_, k) => {
                              const cap = caps[k];
                              const set = sets[k];
                              const hasPaidChildren = cap && (cap.childConfigs || []).some((cc) => cc.priceType === "Fixed Amount");
                              const otherBeds = set ? (set.otherBeds || []) : [];
                              if (!hasPaidChildren && otherBeds.length === 0) return null;
                              return (
                                <div key={k} className="ml-3 mb-3">
                                  <span className="chip text-xs mb-2 inline-block">Option {k + 1}</span>
                                  <div className="ml-2 space-y-2">
                                    {hasPaidChildren && (
                                      <div>
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                          <Users size={12} style={{ color: "#ec4899" }} />
                                          <p className="text-xs font-semibold" style={{ color: "#ec4899" }}>Paid Children</p>
                                        </div>
                                        {(cap.childConfigs || []).map((cc, ci) => {
                                          if (cc.priceType !== "Fixed Amount") return null;
                                          return (
                                            <div key={ci} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                                              <span className="text-xs font-bold uppercase" style={{ color: "var(--text-primary)" }}>{cc.type}</span>
                                              <div className="flex items-center gap-2">
                                                <input type="number" min={0} value={form.prices?.rooms?.[room.id]?.[k]?.children?.[ci] ?? 0} onChange={(e) => setRoomChildPrice(room.id, k, ci, e.target.value)} className="input text-right" style={{ width: "5rem" }} />
                                                <span className="text-sm w-10" style={{ color: "var(--text-secondary)" }}>{form.currency}</span>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                    {otherBeds.length > 0 && (
                                      <div>
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                          <BedDouble size={12} style={{ color: "var(--sidebar-active-text)" }} />
                                          <p className="text-xs font-semibold" style={{ color: "var(--sidebar-active-text)" }}>Paid Beds</p>
                                        </div>
                                        {otherBeds.map((bed, bi) => (
                                          <div key={bi} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                                            <span className="text-xs font-bold uppercase" style={{ color: "var(--text-primary)" }}>{bed.name}</span>
                                            <div className="flex items-center gap-2">
                                              <input type="number" min={0} value={form.prices?.rooms?.[room.id]?.[k]?.beds?.[bi] ?? 0} onChange={(e) => setRoomBedPrice(room.id, k, bi, e.target.value)} className="input text-right" style={{ width: "5rem" }} />
                                              <span className="text-sm w-10" style={{ color: "var(--text-secondary)" }}>{form.currency}</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2.5 pt-2">
                    <button onClick={() => setStep(1)} className="btn btn-secondary">&#8592; Back</button>
                    <button onClick={handleSave} className="btn text-white" style={{ backgroundColor: "var(--sidebar-active-text)" }}>&#10003; Save</button>
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