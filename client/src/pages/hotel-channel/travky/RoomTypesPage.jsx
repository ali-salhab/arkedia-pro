import { useState } from "react";
import {
  DoorOpen,
  Plus,
  Search,
  Pencil,
  Eye,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Users,
  Baby,
  Image as ImageIcon,
} from "lucide-react";
import { useLocalStorage } from "../../../hooks/useLocalStorage";

const INITIAL_GROUPS = [
  { id: "1", name: "Egyptian Market", currency: "EGP" },
  { id: "2", name: "Gulf Market", currency: "SAR" },
  { id: "3", name: "European Market", currency: "EUR" },
];

const INITIAL_PERIODS = [
  { id: "1", name: "Low Season" },
  { id: "2", name: "Mid Season" },
  { id: "3", name: "High Season" },
  { id: "4", name: "Peak Season" },
];

const ROOM_TYPES_OPTIONS = [
  "DBL Room",
  "SGL Room",
  "TPL Room",
  "Suite Room",
  "Family Room",
  "Studio",
];

const AMENITIES = [
  "تكييف هواء",
  "مني بار",
  "خزنة",
  "شرفة",
  "تلفاز",
  "مجفف شعر",
  "مكواة",
  "ماكينة قهوة",
  "حوض استحمام",
  "دش",
  "إنترنت واي فاي",
  "إفطار مجاني",
  "مطبخ صغير",
];

const INITIAL_ROOM_TYPES = [
  {
    id: "dbl",
    code: "DBL",
    nameEn: "Double Room",
    nameAr: "غرفة مزدوجة",
    descEn: "Standard double room with garden view",
    descAr: "غرفة مزدوجة قياسية مع إطلالة على الحديقة",
    roomType: "DBL Room",
    amenities: ["تكييف هواء", "مني بار", "خزنة", "شرفة", "تلفاز"],
    capacityOptions: [{ adults: 2, children: 1 }],
    priceDiffs: {},
    isBase: true,
  },
];

function StepIndicator({ step, total }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => {
        const s = i + 1;
        const done = s < step;
        const active = s === step;
        return (
          <div key={s} className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
              style={
                active
                  ? {
                      backgroundColor: "var(--sidebar-active-text)",
                      color: "#fff",
                    }
                  : done
                    ? {
                        backgroundColor: "var(--bg-raised)",
                        color: "var(--sidebar-active-text)",
                        border: "2px solid var(--sidebar-active-text)",
                      }
                    : {
                        backgroundColor: "var(--bg-raised)",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border)",
                      }
              }
            >
              {done ? <Check size={14} /> : s}
            </div>
            {s < total && (
              <div
                className="w-8 h-0.5"
                style={{
                  backgroundColor: done
                    ? "var(--sidebar-active-text)"
                    : "var(--border)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

const STEP_TITLES = ["التفاصيل", "الصور", "السعة", "الأسرة والأسعار"];

const EMPTY_FORM = {
  code: "",
  nameEn: "",
  nameAr: "",
  descEn: "",
  descAr: "",
  roomType: "DBL Room",
  amenities: [],
  capacityOptions: [{ adults: 2, children: 0 }],
  priceDiffs: {},
};

export default function RoomTypesPage() {
  const [groups] = useLocalStorage("travky_guest_groups", INITIAL_GROUPS);
  const [periods] = useLocalStorage("travky_periods", INITIAL_PERIODS);
  const [roomTypes, setRoomTypes] = useLocalStorage(
    "travky_room_types",
    INITIAL_ROOM_TYPES,
  );
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [step, setStep] = useState(1);
  const [langTab, setLangTab] = useState("en");
  const [errors, setErrors] = useState({});

  const filtered = roomTypes.filter(
    (r) =>
      r.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      r.nameAr.includes(search) ||
      r.code.toLowerCase().includes(search.toLowerCase()),
  );

  function openAdd() {
    const priceDiffs = {};
    periods.forEach((p) => {
      priceDiffs[p.id] = {};
      groups.forEach((g) => {
        priceDiffs[p.id][g.id] = 0;
      });
    });
    setForm({ ...EMPTY_FORM, priceDiffs });
    setStep(1);
    setErrors({});
    setModal("add");
  }

  function openEdit(room) {
    const priceDiffs = {};
    periods.forEach((p) => {
      priceDiffs[p.id] = {};
      groups.forEach((g) => {
        priceDiffs[p.id][g.id] = room.priceDiffs?.[p.id]?.[g.id] ?? 0;
      });
    });
    setForm({
      code: room.code,
      nameEn: room.nameEn,
      nameAr: room.nameAr,
      descEn: room.descEn,
      descAr: room.descAr,
      roomType: room.roomType,
      amenities: [...room.amenities],
      capacityOptions: room.capacityOptions.map((c) => ({ ...c })),
      priceDiffs,
    });
    setStep(1);
    setErrors({});
    setModal({ mode: "edit", data: room });
  }

  function closeModal() {
    setModal(null);
    setErrors({});
  }

  function toggleAmenity(a) {
    setForm((p) => ({
      ...p,
      amenities: p.amenities.includes(a)
        ? p.amenities.filter((x) => x !== a)
        : [...p.amenities, a],
    }));
  }

  function updateCapacity(idx, field, delta) {
    setForm((p) => {
      const opts = p.capacityOptions.map((c, i) =>
        i === idx ? { ...c, [field]: Math.max(0, c[field] + delta) } : c,
      );
      return { ...p, capacityOptions: opts };
    });
  }

  function addCapacityOption() {
    setForm((p) => ({
      ...p,
      capacityOptions: [...p.capacityOptions, { adults: 1, children: 0 }],
    }));
  }

  function removeCapacityOption(idx) {
    setForm((p) => ({
      ...p,
      capacityOptions: p.capacityOptions.filter((_, i) => i !== idx),
    }));
  }

  function setPriceDiff(periodId, groupId, val) {
    setForm((p) => ({
      ...p,
      priceDiffs: {
        ...p.priceDiffs,
        [periodId]: { ...p.priceDiffs[periodId], [groupId]: Number(val) },
      },
    }));
  }

  function validateStep() {
    const errs = {};
    if (step === 1) {
      if (!form.nameEn.trim()) errs.nameEn = "Room name (EN) is required";
      if (!form.code.trim()) errs.code = "Room code is required";
    }
    return errs;
  }

  function handleNext() {
    const errs = validateStep();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, 4));
  }

  function handleBack() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  }

  function handleSave() {
    const data = { ...form, id: Date.now().toString() };
    if (modal === "add") {
      setRoomTypes((prev) => [...prev, data]);
    } else if (modal?.mode === "edit") {
      setRoomTypes((prev) =>
        prev.map((r) =>
          r.id === modal.data.id ? { ...data, id: r.id, isBase: r.isBase } : r,
        ),
      );
    }
    closeModal();
  }

  function formatCapacity(opts) {
    return opts.map((o) => `${o.adults}A + ${o.children}C`).join(", ");
  }

  return (
    <div className="page-shell">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl grid place-items-center"
            style={{ backgroundColor: "#ecfdf5" }}
          >
            <DoorOpen size={22} style={{ color: "#059669" }} />
          </div>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              أنواع الغرف
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              إدارة أنواع الغرف والسعة
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

      {/* Info banner */}
      <div
        className="rounded-xl px-4 py-3 text-sm font-medium"
        style={{
          backgroundColor: "var(--bg-raised)",
          border: "1px solid var(--border)",
          color: "var(--sidebar-active-text)",
        }}
      >
        الغرفة المزدوجة (DBL) هي الغرفة الإجبارية الأولى وتُستخدم كأساس لحساب
        أسعار باقي الغرف
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
                  نوع الغرفة
                </th>
                <th
                  className="pb-3 text-start font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  السعة
                </th>
                {groups.map((g) => (
                  <th
                    key={g.id}
                    className="pb-3 text-start font-semibold"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    فرق السعر
                    <br />
                    <span
                      className="text-xs font-normal"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {g.name}
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
                    colSpan={5 + groups.length}
                    className="py-10 text-center"
                    style={{ color: "var(--text-muted)" }}
                  >
                    لا توجد غرف بعد
                  </td>
                </tr>
              ) : (
                filtered.map((room, idx) => (
                  <tr
                    key={room.id}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td
                      className="py-4 font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {idx + 1}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        {room.isBase && (
                          <span
                            className="inline-flex items-center justify-center w-9 h-6 rounded-lg text-xs font-bold text-white"
                            style={{
                              backgroundColor: "var(--sidebar-active-text)",
                            }}
                          >
                            {room.code}
                          </span>
                        )}
                        {!room.isBase && (
                          <span className="chip text-xs font-bold">
                            {room.code}
                          </span>
                        )}
                        <span
                          className="font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {room.nameAr || room.nameEn}
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="chip text-xs">{room.roomType}</span>
                    </td>
                    <td
                      className="py-4"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {formatCapacity(room.capacityOptions)}
                    </td>
                    {groups.map((g) => (
                      <td
                        key={g.id}
                        className="py-4 font-medium"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {room.isBase ? "—" : "varies"}
                      </td>
                    ))}
                    <td className="py-4">
                      <div className="flex items-center gap-1 justify-end">
                        {!room.isBase && (
                          <button
                            onClick={() => {
                              if (window.confirm("حذف هذا النوع من الغرف؟"))
                                setRoomTypes((prev) =>
                                  prev.filter((r) => r.id !== room.id),
                                );
                            }}
                            className="p-1.5 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                            style={{ color: "#ef4444" }}
                          >
                            <Plus
                              size={15}
                              style={{ transform: "rotate(45deg)" }}
                            />
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(room)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/20"
                          style={{ color: "#f59e0b" }}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setViewItem(room)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          style={{ color: "#3b82f6" }}
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewItem && (
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
                onClick={() => setViewItem(null)}
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
                تفاصيل الغرفة
              </h2>
            </div>
            <div className="space-y-3">
              <div>
                <p
                  className="text-xs mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  الاسم (عربي)
                </p>
                <p
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {viewItem.nameAr}
                </p>
              </div>
              <div>
                <p
                  className="text-xs mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  الاسم (إنجليزي)
                </p>
                <p
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {viewItem.nameEn}
                </p>
              </div>
              <div>
                <p
                  className="text-xs mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  الرمز
                </p>
                <span className="chip">{viewItem.code}</span>
              </div>
              <div>
                <p
                  className="text-xs mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  نوع الغرفة
                </p>
                <span className="chip">{viewItem.roomType}</span>
              </div>
              <div>
                <p
                  className="text-xs mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  المرافق
                </p>
                <div className="flex flex-wrap gap-1">
                  {viewItem.amenities.map((a) => (
                    <span key={a} className="chip text-xs">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p
                  className="text-xs mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  السعة
                </p>
                {viewItem.capacityOptions.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-1.5 px-3 rounded-lg mb-1.5"
                    style={{ backgroundColor: "var(--bg-raised)" }}
                  >
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      خيار {i + 1}
                    </span>
                    <span className="text-sm font-medium">{c.adults} بالغ</span>
                    <span className="text-sm font-medium">
                      {c.children} طفل
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => setViewItem(null)}
              className="btn btn-secondary w-full mt-4"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-xl"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border)",
              maxHeight: "92vh",
            }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between mb-1">
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
                إضافة نوع غرفة — {STEP_TITLES[step - 1]}
              </h2>
            </div>

            <StepIndicator step={step} total={4} />

            {/* Step 1: Details */}
            {step === 1 && (
              <div className="space-y-4">
                {/* Language toggle */}
                <div className="flex items-center gap-2 justify-end">
                  {[
                    { v: "en", flag: "us", label: "EN" },
                    { v: "ar", flag: "eg", label: "AR" },
                  ].map((l) => (
                    <button
                      key={l.v}
                      type="button"
                      onClick={() => setLangTab(l.v)}
                      className="flex items-center gap-1 h-7 px-2 rounded-lg text-xs font-semibold transition-all"
                      style={
                        langTab === l.v
                          ? {
                              backgroundColor: "var(--sidebar-active-text)",
                              color: "#fff",
                              border: "1px solid var(--sidebar-active-text)",
                            }
                          : {
                              backgroundColor: "var(--bg-raised)",
                              color: "var(--text-secondary)",
                              border: "1px solid var(--border)",
                            }
                      }
                    >
                      <img
                        src={`https://flagcdn.com/w20/${l.flag}.png`}
                        alt={l.label}
                        className="h-4 w-5 rounded object-cover"
                      />
                      {l.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    الاسم
                  </label>
                  {langTab === "en" ? (
                    <input
                      value={form.nameEn}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, nameEn: e.target.value }))
                      }
                      className="input"
                      placeholder="Room name in English"
                    />
                  ) : (
                    <input
                      value={form.nameAr}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, nameAr: e.target.value }))
                      }
                      className="input"
                      placeholder="اسم الغرفة بالعربية"
                    />
                  )}
                  {errors.nameEn && (
                    <p className="input-error mt-1">{errors.nameEn}</p>
                  )}
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    الوصف
                  </label>
                  {langTab === "en" ? (
                    <textarea
                      value={form.descEn}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, descEn: e.target.value }))
                      }
                      className="input h-20 resize-none"
                      placeholder="Description in English"
                    />
                  ) : (
                    <textarea
                      value={form.descAr}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, descAr: e.target.value }))
                      }
                      className="input h-20 resize-none"
                      placeholder="الوصف بالعربية"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--text-primary)" }}
                    >
                      الرمز
                    </label>
                    <input
                      value={form.code}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          code: e.target.value.toUpperCase(),
                        }))
                      }
                      className="input font-mono"
                      placeholder="DBL, SGL..."
                      maxLength={4}
                    />
                    {errors.code && (
                      <p className="input-error mt-1">{errors.code}</p>
                    )}
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--text-primary)" }}
                    >
                      نوع الغرفة
                    </label>
                    <select
                      value={form.roomType}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, roomType: e.target.value }))
                      }
                      className="input"
                    >
                      {ROOM_TYPES_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    مرافق الغرفة
                  </label>
                  <div
                    className="flex flex-wrap gap-1.5 p-3 rounded-xl"
                    style={{
                      backgroundColor: "var(--bg-raised)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {AMENITIES.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => toggleAmenity(a)}
                        className="chip cursor-pointer transition-all text-xs"
                        style={
                          form.amenities.includes(a)
                            ? {
                                backgroundColor: "rgba(29,78,216,0.1)",
                                borderColor: "var(--sidebar-active-text)",
                                color: "var(--sidebar-active-text)",
                              }
                            : {}
                        }
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Images */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    الصورة الرئيسية
                  </label>
                  <div
                    className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center h-36 cursor-pointer transition-colors"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--bg-raised)",
                    }}
                  >
                    <ImageIcon
                      size={24}
                      style={{ color: "var(--text-muted)" }}
                    />
                    <button
                      type="button"
                      className="mt-2 text-sm font-medium"
                      style={{ color: "var(--sidebar-active-text)" }}
                    >
                      رفع صور
                    </button>
                  </div>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    معرض الصور
                  </label>
                  <div
                    className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center h-32 cursor-pointer"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--bg-raised)",
                    }}
                  >
                    <ImageIcon
                      size={22}
                      style={{ color: "var(--text-muted)" }}
                    />
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      اسحب الصور هنا أو انقر للرفع
                    </p>
                    <button
                      type="button"
                      className="mt-1.5 text-sm font-medium"
                      style={{ color: "var(--sidebar-active-text)" }}
                    >
                      رفع صور
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Capacity */}
            {step === 3 && (
              <div className="space-y-3">
                {form.capacityOptions.map((opt, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl p-4"
                    style={{
                      backgroundColor: "var(--bg-raised)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        خيار السعة {idx + 1}
                      </p>
                      <div
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <span>Adult {opt.adults}</span>
                        <span className="mx-2">·</span>
                        <span>Children {opt.children}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        {
                          label: "Adult",
                          icon: <Users size={18} />,
                          field: "adults",
                        },
                        {
                          label: "Children",
                          icon: <Baby size={18} />,
                          field: "children",
                        },
                      ].map(({ label, icon, field }) => (
                        <div
                          key={field}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div
                            className="flex items-center gap-2"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {icon}
                            <span className="text-sm">{label}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => updateCapacity(idx, field, -1)}
                              className="w-8 h-8 rounded-full grid place-items-center font-bold transition-colors text-white"
                              style={{
                                backgroundColor: "var(--sidebar-active-text)",
                              }}
                            >
                              —
                            </button>
                            <span
                              className="w-6 text-center font-semibold"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {opt[field]}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCapacity(idx, field, 1)}
                              className="w-8 h-8 rounded-full grid place-items-center font-bold transition-colors text-white text-xl"
                              style={{
                                backgroundColor: "var(--sidebar-active-text)",
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => removeCapacityOption(idx)}
                        className="mt-3 text-xs"
                        style={{ color: "var(--danger)" }}
                      >
                        حذف هذا الخيار
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCapacityOption}
                  className="w-full py-2.5 rounded-xl text-sm font-medium border-2 border-dashed transition-colors"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  + إضافة خيار سعة
                </button>
              </div>
            )}

            {/* Step 4: Price Diffs */}
            {step === 4 && (
              <div className="space-y-4">
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  فرق السعر بين هذه الغرفة والغرفة المزدوجة (DBL) لكل فترة
                  ومجموعة ضيوف
                </p>
                {periods.map((period) => (
                  <div key={period.id}>
                    <p
                      className="text-sm font-semibold mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {period.name}
                    </p>
                    <div className="space-y-2">
                      {groups.map((g) => (
                        <div key={g.id} className="flex items-center gap-3">
                          <input
                            type="number"
                            value={form.priceDiffs[period.id]?.[g.id] ?? 0}
                            onChange={(e) =>
                              setPriceDiff(period.id, g.id, e.target.value)
                            }
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
                ))}
              </div>
            )}

            {/* Navigation */}
            <div
              className="flex items-center justify-between mt-6 pt-4"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  className="btn btn-secondary flex items-center gap-1.5"
                >
                  <ChevronRight size={16} />
                  <span>رجوع</span>
                </button>
              ) : (
                <button onClick={closeModal} className="btn btn-secondary">
                  إلغاء
                </button>
              )}

              {step < 4 ? (
                <button
                  onClick={handleNext}
                  className="btn text-white flex items-center gap-1.5"
                  style={{ backgroundColor: "var(--sidebar-active-text)" }}
                >
                  <span>{STEP_TITLES[step]}</span>
                  <ChevronLeft size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="btn text-white"
                  style={{ backgroundColor: "var(--sidebar-active-text)" }}
                >
                  حفظ
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

