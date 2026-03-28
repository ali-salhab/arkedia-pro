import { useState } from "react";
import {
  DollarSign,
  ChevronDown,
  DoorOpen,
  Users,
  Eye,
  Layers,
  BedDouble,
  Smile,
  Settings2,
  AirVent,
  Wine,
  Lock,
  Sun,
  Tv2,
  Wind,
  Shirt,
  Coffee,
  Waves,
  ShowerHead,
  Wifi,
  Utensils,
  ChefHat,
} from "lucide-react";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { useLanguage } from "../../../context/LanguageContext";

// ── Amenity icon map (mirrors RoomTypesPage) ─────────────
const AMENITIES_LIST = [
  { label: "تكييف هواء", Icon: AirVent },
  { label: "مني بار", Icon: Wine },
  { label: "خزنة", Icon: Lock },
  { label: "شرفة", Icon: Sun },
  { label: "تلفاز", Icon: Tv2 },
  { label: "مجفف شعر", Icon: Wind },
  { label: "مكواة", Icon: Shirt },
  { label: "ماكينة قهوة", Icon: Coffee },
  { label: "حوض استحمام", Icon: Waves },
  { label: "دش", Icon: ShowerHead },
  { label: "إنترنت واي فاي", Icon: Wifi },
  { label: "إفطار مجاني", Icon: Utensils },
  { label: "مطبخ صغير", Icon: ChefHat },
];
const AMENITY_ICON_MAP = Object.fromEntries(AMENITIES_LIST.map(({ label, Icon }) => [label, Icon]));

// ── Fallback initial data ─────────────────────────────────
const INIT_GROUPS = [
  { id: "1", name: "Egyptian Market", currency: "EGP" },
  { id: "2", name: "Euro Market", currency: "EUR" },
  { id: "3", name: "Syrian", currency: "EGP" },
];
const INIT_PERIODS = [
  { id: "1", name: "Summer", from: "2024-04-14", to: "2024-04-17" },
  { id: "2", name: "Winter", from: "2024-03-28", to: "2024-03-31" },
];
const INIT_ROOMS = [
  {
    id: "dbl", code: "DBL", nameEn: "DBL Room", nameAr: "غرفة مزدوجة",
    roomType: "DBL Room", isBase: true,
    capacityOptions: [{ adults: 2, children: 1, childConfigs: [] }],
    bedOptionSets: [{ otherBeds: [{ name: "extra", priceType: "Paid" }] }],
    amenities: [], mainImage: null,
    priceFormula: "add", priceMethod: "percentage", pricePercent: 0, priceDiffs: {},
  },
];
const INIT_MEALS = [
  { id: "1", name: "Bed & Breakfast", code: "BB", prices: {} },
  { id: "2", name: "All Inclusive",   code: "AI", prices: {} },
];
const INIT_REFUNDS = [
  { id: "1", name: "Non-Refundable",    type: "non_refundable",    extraPrices: {} },
  { id: "2", name: "Free Cancellation", type: "free_cancellation", extraPrices: {} },
];
const INIT_SUPPLEMENTS = [
  { id: "1", name: "Sea View",  prices: {} },
  { id: "2", name: "Pool View", prices: {} },
];

const INIT_PLATFORM_FEES = { b2c: { platformFee: "3", minCommission: "4" }, b2b: { platformFee: "2.5", minCommission: "10" } };
const INIT_HOTEL_COMM   = { b2c: { minCommission: "0" }, b2b: { minCommission: "0" } };

const POLICY_COLORS = {
  non_refundable:    "#ef4444",
  free_cancellation: "#16a34a",
  partial:           "#d97706",
};

// ── Date helpers ──────────────────────────────────────────
const SHORT_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fmtDate(str) {
  if (!str) return "";
  const [, mm, dd] = str.split("-");
  return `${parseInt(dd, 10)} ${SHORT_MONTHS[parseInt(mm, 10) - 1]}`;
}
function toNum(v) { const n = parseFloat(v); return isNaN(n) ? 0 : n; }

// ─────────────────────────────────────────────────────────
export default function RatesPage() {
  const { lang } = useLanguage();
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [groups]         = useLocalStorage("travky_guest_groups",    INIT_GROUPS);
  const [periods]        = useLocalStorage("travky_periods",          INIT_PERIODS);
  const [roomTypes]      = useLocalStorage("travky_room_types",       INIT_ROOMS);
  const [mealPlans]      = useLocalStorage("travky_meal_plans",       INIT_MEALS);
  const [supplements]    = useLocalStorage("travky_supplements",     INIT_SUPPLEMENTS);
  const [refundPolicies] = useLocalStorage("travky_refund_policies",  INIT_REFUNDS);
  const [dblPrices, setDblPrices] = useLocalStorage("travky_dbl_prices", {});
  const [platformFees]   = useLocalStorage("platform_fees",           INIT_PLATFORM_FEES);
  const [hotelComm]      = useLocalStorage("travky_hotel_commission", INIT_HOTEL_COMM);

  // UI state
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [expandedRooms,   setExpandedRooms]   = useState({});
  const [activePeriod,    setActivePeriod]    = useState({});  // rowKey → periodId

  // Build rows: base room + one per supplement
  const rows = roomTypes.flatMap((room) => [
    { room, supplement: null },
    ...supplements.map((supp) => ({ room, supplement: supp })),
  ]);

  const combosPerRow = periods.length * mealPlans.length * refundPolicies.length;
  const displayGroupId = selectedGroupId ?? groups[0]?.id ?? null;
  const displayGroup   = groups.find((g) => g.id === displayGroupId) ?? groups[0];

  function setDblPrice(periodId, groupId, val) {
    setDblPrices((prev) => ({
      ...prev,
      [periodId]: { ...(prev[periodId] || {}), [groupId]: Number(val) || 0 },
    }));
  }

  function toggleRoom(rowKey) {
    setExpandedRooms((p) => ({ ...p, [rowKey]: !p[rowKey] }));
    if (!activePeriod[rowKey]) {
      setActivePeriod((p) => ({ ...p, [rowKey]: periods[0]?.id }));
    }
  }

  function calcNetRate(room, supplement, mealPlan, refundPolicy, periodId, groupId) {
    const base = toNum(dblPrices[periodId]?.[groupId]);
    let roomAdj = 0;
    if (!room.isBase) {
      const formula = room.priceFormula ?? "add";
      const method  = room.priceMethod  ?? "percentage";
      if (formula === "add") {
        roomAdj = method === "fixed"
          ? toNum(room.priceDiffs?.[periodId]?.[groupId])
          : base * toNum(room.pricePercent) / 100;
      } else {
        roomAdj = method === "fixed"
          ? -toNum(room.priceDiffs?.[periodId]?.[groupId])
          : -(base * toNum(room.pricePercent) / 100);
      }
    }
    const suppPrice = toNum(supplement?.prices?.[groupId]);
    const mealAdj   = toNum(mealPlan?.prices?.[groupId]);
    const refundAdj = toNum(refundPolicy?.extraPrices?.[groupId]);
    return Math.round(base + roomAdj + suppPrice + mealAdj + refundAdj);
  }

  function withCommission(net, tier) {
    const pf = toNum(platformFees?.[tier]?.platformFee);
    const hc = toNum(hotelComm?.[tier]?.minCommission);
    return Math.round(net * (1 + (pf + hc) / 100));
  }

  const combosPerRoom = mealPlans.length * refundPolicies.length * periods.length;

  return (
    <div className="page-shell" dir={dir}>

      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        {/* Adjust rates button (LTR end / RTL start-end = left) */}
        <button
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{
            backgroundColor: "var(--bg-raised)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          <Settings2 size={14} />
          تعديل الأسعار
        </button>

        {/* Title + icon (right) */}
        <div className="flex items-center gap-3">
          <div className="text-end">
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              الأسعار
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
              إدارة أسعار الغرف حسب الفترة
            </p>
          </div>
          <div
            className="w-11 h-11 rounded-xl grid place-items-center shrink-0"
            style={{ backgroundColor: "#fef9c3" }}
          >
            <DollarSign size={22} style={{ color: "#ca8a04" }} />
          </div>
        </div>
      </div>

      {/* ── Section 1: DBL prices ─────────────────────────── */}
      <div
        className="rounded-2xl p-5 mb-5"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        {/* Section header */}
        <div className="flex items-center gap-3 mb-5 justify-end">
          <div className="text-end">
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
              أدخل أسعار الغرفة المزدوجة (DBL)
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              أدخل سعر الغرفة المزدوجة لكل فترة ومجموعة ضيوف لإنشاء جدول الأسعار تلقائياً
            </p>
          </div>
          <div
            className="w-7 h-7 rounded-full grid place-items-center text-sm font-bold text-white shrink-0"
            style={{ backgroundColor: "var(--sidebar-active-text)" }}
          >
            1
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th
                  className="pb-3 text-end pr-2 font-normal text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  الفترة
                </th>
                {groups.map((g) => (
                  <th
                    key={g.id}
                    className="pb-3 text-center font-normal"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span className="block text-xs font-medium">{g.name.toLowerCase()}</span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{g.currency}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr key={period.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="py-3 text-end pr-2">
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {period.name}
                    </p>
                    {(period.from || period.to) && (
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {fmtDate(period.from)} → {fmtDate(period.to)}
                      </p>
                    )}
                  </td>
                  {groups.map((g) => (
                    <td key={g.id} className="py-3 text-center">
                      <input
                        type="number"
                        min="0"
                        value={dblPrices[period.id]?.[g.id] ?? ""}
                        placeholder="0"
                        onChange={(e) => setDblPrice(period.id, g.id, e.target.value)}
                        className="text-center rounded-xl text-sm font-semibold"
                        style={{
                          width: "7rem",
                          padding: "0.5rem 0.75rem",
                          backgroundColor: "var(--bg-surface)",
                          border: "1.5px solid var(--border)",
                          color: "var(--text-primary)",
                          outline: "none",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--sidebar-active-text)")}
                        onBlur={(e)  => (e.target.style.borderColor = "var(--border)")}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 2: Generated rates ────────────────────── */}
      <div
        className="rounded-2xl p-5"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        {/* Section header */}
        <div className="flex items-center gap-3 mb-5 justify-end">
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
            الأسعار المولّدة تلقائياً
          </p>
          <div
            className="w-7 h-7 rounded-full grid place-items-center text-sm font-bold text-white shrink-0"
            style={{ backgroundColor: "var(--sidebar-active-text)" }}
          >
            2
          </div>
        </div>

        {/* Group filter chips */}
        <div className="flex flex-wrap gap-2 mb-5">
          {groups.map((g) => {
            const isActive = displayGroupId === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGroupId(g.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
                style={{
                  backgroundColor: "var(--bg-raised)",
                  border: isActive
                    ? "1.5px solid var(--sidebar-active-text)"
                    : "1.5px solid var(--border)",
                }}
              >
                <Users size={14} style={{ color: "var(--text-muted)" }} />
                <div className="text-start">
                  <p className="text-xs font-semibold leading-none" style={{ color: "var(--text-primary)" }}>
                    {g.name.toLowerCase()}
                  </p>
                  <p className="text-xs leading-none mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {g.currency}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Room accordion rows */}
        <div className="space-y-3">
          {rows.map(({ room, supplement }) => {
            const rowKey       = `${room.id}-${supplement?.id ?? "base"}`;
            const isOpen       = !!expandedRooms[rowKey];
            const actPeriodId  = activePeriod[rowKey] ?? periods[0]?.id;
            const bedSets      = room.bedOptionSets || [];
            const firstOtherBed = (bedSets[0]?.otherBeds || [])[0];
            const capOpts      = room.capacityOptions || [];
            const firstCap     = capOpts[0] || {};
            const amenities    = room.amenities || [];
            const MAX_AM       = 6;
            const shownAmens   = amenities.slice(0, MAX_AM);
            const overflowAm   = amenities.length - MAX_AM;
            const baseName     = lang === "ar" ? (room.nameAr || room.nameEn) : room.nameEn;
            const rowName      = supplement ? `${room.code} - ${supplement.name}` : baseName;

            return (
              <div
                key={rowKey}
                className="rounded-2xl overflow-hidden"
                style={{ border: "1px solid var(--border)" }}
              >
                {/* ── Collapsed header ──────────────────── */}
                <button
                  type="button"
                  onClick={() => toggleRoom(rowKey)}
                  className="w-full flex items-center justify-between px-4 py-3 gap-3"
                  style={{ backgroundColor: "var(--bg-surface)" }}
                >
                  {/* Left: count + chevron */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="text-sm font-bold w-8 h-8 rounded-full grid place-items-center"
                      style={{
                        backgroundColor: "var(--bg-raised)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {combosPerRow}
                    </span>
                    <ChevronDown
                      size={16}
                      style={{
                        color: "var(--text-muted)",
                        transform: isOpen ? "rotate(180deg)" : "none",
                        transition: "transform 0.2s",
                      }}
                    />
                  </div>

                  {/* Right: thumbnail + name + chips */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="min-w-0 text-end">
                      <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                          {rowName}
                        </p>
                        <div className="flex items-center gap-1.5 justify-end mt-0.5 flex-wrap">
                          {room.roomType && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-md"
                              style={{
                                backgroundColor: "var(--bg-raised)",
                                border: "1px solid var(--border)",
                                color: "var(--text-secondary)",
                              }}
                            >
                              {room.roomType}
                            </span>
                          )}
                          {supplement && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-md font-medium"
                              style={{
                                backgroundColor: "#eff6ff",
                                border: "1px solid #bfdbfe",
                                color: "#1d4ed8",
                              }}
                            >
                              {supplement.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className="w-10 h-10 rounded-xl overflow-hidden shrink-0"
                      style={{ backgroundColor: "var(--bg-raised)" }}
                    >
                      {room.mainImage ? (
                        <img src={room.mainImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <DoorOpen size={16} style={{ color: "var(--border)" }} />
                        </div>
                      )}
                    </div>
                  </div>
                </button>

                {/* ── Expanded body ─────────────────────── */}
                {isOpen && (
                  <div style={{ borderTop: "1px solid var(--border)" }}>
                    {/* Room image banner */}
                    <div className="relative" style={{ height: 200, backgroundColor: "var(--bg-raised)" }}>
                      {room.mainImage ? (
                        <img src={room.mainImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <DoorOpen size={44} style={{ color: "var(--border)", opacity: 0.35 }} />
                        </div>
                      )}
                      {/* Overlay badges bottom-left */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                        <span
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-white"
                          style={{ backgroundColor: room.isBase ? "var(--sidebar-active-text)" : "#334155" }}
                        >
                          {room.code}
                        </span>
                        <span
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {room.roomType}
                        </span>
                      </div>
                    </div>

                    <div
                      className="p-4 space-y-3"
                      style={{ backgroundColor: "var(--bg-surface)" }}
                    >
                      {/* Info pills */}
                      <div className="flex items-center gap-2" dir="rtl">
                        {/* Capacity pill */}
                        <div
                          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: "var(--bg-raised)",
                            border: "1px solid var(--border)",
                            color: "var(--text-secondary)",
                          }}
                        >
                          <Users size={12} />
                          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                            {firstCap.adults ?? 0}
                          </span>
                          <span>+</span>
                          <Smile size={12} />
                          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                            {firstCap.children ?? 0}
                          </span>
                          <Layers size={11} />
                          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                            {capOpts.length}
                          </span>
                        </div>

                        {/* Bed pill */}
                        <div
                          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: "var(--bg-raised)",
                            border: "1px solid var(--border)",
                            color: "var(--text-secondary)",
                          }}
                        >
                          <BedDouble size={13} />
                          {firstOtherBed && (
                            <span className="truncate" style={{ maxWidth: "4rem" }}>
                              {firstOtherBed.name}
                            </span>
                          )}
                          <Layers size={11} />
                          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                            {bedSets.length}
                          </span>
                        </div>
                      </div>

                      {/* Amenities strip */}
                      {amenities.length > 0 && (
                        <div
                          className="flex items-center gap-1.5 overflow-x-auto pb-1"
                          dir="rtl"
                          style={{ scrollbarWidth: "none" }}
                        >
                          {shownAmens.map((a) => {
                            const AmenityIcon = AMENITY_ICON_MAP[a];
                            return (
                              <span
                                key={a}
                                className="shrink-0 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                                style={{
                                  backgroundColor: "var(--bg-raised)",
                                  border: "1px solid var(--border)",
                                  color: "var(--text-secondary)",
                                }}
                              >
                                {AmenityIcon && <AmenityIcon size={11} />}
                                <span>{a}</span>
                              </span>
                            );
                          })}
                          {overflowAm > 0 && (
                            <span
                              className="shrink-0 text-xs font-semibold px-2 py-1 rounded-full"
                              style={{
                                backgroundColor: "var(--bg-raised)",
                                border: "1px solid var(--border)",
                                color: "var(--text-muted)",
                              }}
                            >
                              +{overflowAm}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Period tabs */}
                      <div className="flex gap-2 flex-wrap" dir="rtl">
                        {periods.map((p) => {
                          const isAct = actPeriodId === p.id;
                          return (
                            <button
                              key={p.id}
                              onClick={() =>
                                setActivePeriod((prev) => ({ ...prev, [rowKey]: p.id }))
                              }
                              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all text-end"
                              style={{
                                backgroundColor: isAct ? "var(--sidebar-active-text)" : "transparent",
                                color: isAct ? "white" : "var(--text-secondary)",
                                border: isAct ? "none" : "1px solid var(--border)",
                              }}
                            >
                              <span className="block font-bold">{p.name}</span>
                              {(p.from || p.to) && (
                                <span
                                  className="block text-xs font-normal"
                                  style={{ opacity: 0.75 }}
                                >
                                  {fmtDate(p.from)} → {fmtDate(p.to)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Supplement cards: mealPlan × refundPolicy */}
                      <div
                        className="flex gap-3 overflow-x-auto pb-1"
                        style={{ scrollbarWidth: "none" }}
                      >
                        {mealPlans.flatMap((mp) =>
                          refundPolicies.map((rp) => {
                            const netRate = calcNetRate(room, supplement, mp, rp, actPeriodId, displayGroupId);
                            const b2b     = withCommission(netRate, "b2b");
                            const b2c     = withCommission(netRate, "b2c");
                            const rpColor = POLICY_COLORS[rp.type] ?? "var(--text-secondary)";
                            const currency = displayGroup?.currency ?? "";
                            const cardTitle = supplement
                              ? `${room.code} — ${supplement.name} & ${mp.name} & ${rp.name}`
                              : `${room.code} — ${mp.name} & ${rp.name}`;

                            return (
                              <div
                                key={`${mp.id}-${rp.id}`}
                                className="shrink-0 rounded-2xl p-4"
                                style={{
                                  width: 230,
                                  backgroundColor: "var(--bg-raised)",
                                  border: "1px solid var(--border)",
                                }}
                              >
                                {/* Title */}
                                <p
                                  className="text-sm font-bold mb-2 leading-tight text-end"
                                  style={{ color: "var(--text-primary)" }}
                                >
                                  {cardTitle}
                                </p>

                                {/* Bullets */}
                                <div className="space-y-1 mb-3">
                                  <p className="text-xs text-end" style={{ color: "var(--text-secondary)" }}>
                                    · {mp.name} ({mp.code})
                                  </p>
                                  <p
                                    className="text-xs text-end font-semibold"
                                    style={{ color: rpColor }}
                                  >
                                    ✓ {rp.name}
                                  </p>
                                </div>

                                {/* Rates */}
                                <div
                                  className="space-y-1.5 pt-3"
                                  style={{ borderTop: "1px solid var(--border)" }}
                                >
                                  {[
                                    { label: "Net Rate", val: netRate,  color: "var(--text-primary)" },
                                    { label: "B2B",      val: b2b,      color: "#3b82f6" },
                                    { label: "B2C",      val: b2c,      color: "#16a34a" },
                                  ].map(({ label, val, color }) => (
                                    <div key={label} className="flex items-center justify-between">
                                      {/* label on right (RTL first child) */}
                                      <span
                                        className="text-xs"
                                        style={{ color: "var(--text-secondary)" }}
                                      >
                                        {label}
                                      </span>
                                      {/* value + eye on left */}
                                      <div className="flex items-center gap-1" dir="ltr">
                                        <span
                                          className="text-xs font-bold"
                                          style={{ color }}
                                        >
                                          {val.toLocaleString()} {currency}
                                        </span>
                                        <button
                                          className="p-0.5 rounded"
                                          style={{ color: "var(--text-muted)" }}
                                        >
                                          <Eye size={11} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
