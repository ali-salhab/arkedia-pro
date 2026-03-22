import { useState, useMemo } from "react";
import { DollarSign, ChevronDown, Filter } from "lucide-react";
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

const INITIAL_ROOM_TYPES = [
  {
    id: "dbl",
    code: "DBL",
    nameEn: "Double Room",
    nameAr: "غرفة مزدوجة",
    isBase: true,
  },
];

const INITIAL_MEAL_PLANS = [
  {
    id: "1",
    name: "Bed & Breakfast",
    code: "BB",
    prices: { 1: 15, 2: 20, 3: 18 },
  },
  { id: "2", name: "Half Board", code: "HB", prices: { 1: 30, 2: 40, 3: 35 } },
  { id: "3", name: "Full Board", code: "FB", prices: { 1: 50, 2: 60, 3: 55 } },
];

const INITIAL_SUPPLEMENTS = [
  { id: "1", name: "Extra Bed", prices: { 1: 250, 2: 25, 3: 20 } },
  { id: "2", name: "Sea View", prices: { 1: 500, 2: 50, 3: 40 } },
];

const INITIAL_REFUND = [
  {
    id: "1",
    name: "Non-Refundable",
    type: "non_refundable",
    feesPercent: 100,
    extraPrices: { 1: 0, 2: 0, 3: 0 },
  },
  {
    id: "2",
    name: "Flexible",
    type: "free_cancellation",
    feesPercent: 0,
    extraPrices: { 1: 50, 2: 5, 3: 4 },
  },
  {
    id: "3",
    name: "Moderate",
    type: "partial",
    feesPercent: 50,
    extraPrices: { 1: 100, 2: 10, 3: 8 },
  },
];

const INITIAL_DBL_PRICES = {
  1: { 1: 800, 2: 80, 3: 70 },
  2: { 1: 1000, 2: 100, 3: 90 },
  3: { 1: 1500, 2: 150, 3: 130 },
  4: { 1: 2000, 2: 200, 3: 180 },
};

export default function RatesPage() {
  const [groups] = useLocalStorage("travky_guest_groups", INITIAL_GROUPS);
  const [periods] = useLocalStorage("travky_periods", INITIAL_PERIODS);
  const [roomTypes] = useLocalStorage("travky_room_types", INITIAL_ROOM_TYPES);
  const [mealPlans] = useLocalStorage("travky_meal_plans", INITIAL_MEAL_PLANS);
  const [supplements] = useLocalStorage(
    "travky_supplements",
    INITIAL_SUPPLEMENTS,
  );
  const [refundPolicies] = useLocalStorage(
    "travky_refund_policies",
    INITIAL_REFUND,
  );
  const [dblPrices, setDblPrices] = useLocalStorage(
    "travky_dbl_prices",
    INITIAL_DBL_PRICES,
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterRoom, setFilterRoom] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [filterGroup, setFilterGroup] = useState("all");

  function setDblPrice(periodId, groupId, val) {
    setDblPrices((prev) => ({
      ...prev,
      [periodId]: { ...(prev[periodId] || {}), [groupId]: Number(val) },
    }));
  }

  // Generate all price combinations
  const generatedRows = useMemo(() => {
    const rows = [];
    roomTypes.forEach((room) => {
      periods.forEach((period) => {
        if (filterPeriod !== "all" && period.id !== filterPeriod) return;
        if (filterRoom !== "all" && room.id !== filterRoom) return;
        groups.forEach((group) => {
          if (filterGroup !== "all" && group.id !== filterGroup) return;
          const basePrice = dblPrices[period.id]?.[group.id] ?? 0;
          mealPlans.forEach((meal) => {
            const mealPrice = meal.prices[group.id] ?? 0;
            refundPolicies.forEach((refund) => {
              const refundExtra = refund.extraPrices[group.id] ?? 0;
              const total = basePrice + mealPrice + refundExtra;
              rows.push({
                room,
                period,
                group,
                basePrice,
                meal,
                mealPrice,
                refund,
                refundExtra,
                total,
              });
            });
          });
        });
      });
    });
    return rows;
  }, [
    roomTypes,
    periods,
    groups,
    dblPrices,
    mealPlans,
    refundPolicies,
    filterRoom,
    filterPeriod,
    filterGroup,
  ]);

  return (
    <div className="page-shell">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl grid place-items-center"
            style={{ backgroundColor: "#fef9c3" }}
          >
            <DollarSign size={22} style={{ color: "#ca8a04" }} />
          </div>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              الأسعار
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              إدارة أسعار الغرف حسب الفترة
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: DBL Base Prices */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-7 h-7 rounded-full grid place-items-center text-sm font-bold text-white"
            style={{ backgroundColor: "var(--sidebar-active-text)" }}
          >
            1
          </div>
          <div>
            <p
              className="font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              أدخل أسعار الغرفة المزدوجة (DBL)
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              أدخل سعر الغرفة المزدوجة لكل فترة ومجموعة ضيوف لإنشاء جدول الأسعار
              تلقائياً
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                <th
                  className="pb-3 text-start font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  الفترة
                </th>
                {groups.map((g) => (
                  <th
                    key={g.id}
                    className="pb-3 text-start font-semibold"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {g.name}
                    <br />
                    <span
                      className="text-xs font-normal"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {g.currency}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr
                  key={period.id}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <td
                    className="py-3 font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {period.name}
                  </td>
                  {groups.map((g) => (
                    <td key={g.id} className="py-3">
                      <input
                        type="number"
                        min="0"
                        value={dblPrices[period.id]?.[g.id] ?? 0}
                        onChange={(e) =>
                          setDblPrice(period.id, g.id, e.target.value)
                        }
                        className="input text-center font-semibold"
                        style={{ width: "7rem", fontSize: "0.9rem" }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Generated Prices */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--bg-raised)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              <ChevronDown
                size={14}
                style={{
                  transform: filterOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                }}
              />
              <Filter size={14} />
              <span>فلتر</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full grid place-items-center text-sm font-bold text-white"
                style={{ backgroundColor: "var(--sidebar-active-text)" }}
              >
                2
              </div>
              <p
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                الأسعار المولدة تلقائياً
              </p>
            </div>
            <span className="chip font-semibold">
              {generatedRows.length} نتيجة
            </span>
          </div>
        </div>

        {filterOpen && (
          <div
            className="mb-4 p-4 rounded-xl grid grid-cols-3 gap-3"
            style={{
              backgroundColor: "var(--bg-raised)",
              border: "1px solid var(--border)",
            }}
          >
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                الغرفة
              </label>
              <select
                value={filterRoom}
                onChange={(e) => setFilterRoom(e.target.value)}
                className="input text-sm"
              >
                <option value="all">الكل</option>
                {roomTypes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nameAr || r.nameEn}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                الفترة
              </label>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="input text-sm"
              >
                <option value="all">الكل</option>
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                مجموعة الضيوف
              </label>
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className="input text-sm"
              >
                <option value="all">الكل</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                <th
                  className="pb-3 text-start font-semibold whitespace-nowrap"
                  style={{ color: "var(--text-secondary)" }}
                >
                  الغرفة
                </th>
                <th
                  className="pb-3 text-start font-semibold whitespace-nowrap"
                  style={{ color: "var(--text-secondary)" }}
                >
                  الفترة
                </th>
                <th
                  className="pb-3 text-start font-semibold whitespace-nowrap"
                  style={{ color: "var(--text-secondary)" }}
                >
                  مجموعات الضيوف
                </th>
                <th
                  className="pb-3 text-start font-semibold whitespace-nowrap"
                  style={{ color: "var(--text-secondary)" }}
                >
                  السعر الأساسي
                </th>
                <th
                  className="pb-3 text-start font-semibold whitespace-nowrap"
                  style={{ color: "var(--text-secondary)" }}
                >
                  خطط الوجبات
                </th>
                <th
                  className="pb-3 text-start font-semibold whitespace-nowrap"
                  style={{ color: "var(--text-secondary)" }}
                >
                  سياسات الاسترداد
                </th>
                <th
                  className="pb-3 text-start font-semibold whitespace-nowrap"
                  style={{ color: "var(--text-secondary)" }}
                >
                  الإجمالي
                </th>
              </tr>
            </thead>
            <tbody>
              {generatedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center"
                    style={{ color: "var(--text-muted)" }}
                  >
                    أدخل أسعار الغرفة المزدوجة أعلاه لعرض الأسعار المولدة
                  </td>
                </tr>
              ) : (
                generatedRows.slice(0, 50).map((row, idx) => (
                  <tr
                    key={idx}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td
                      className="py-3 font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {row.room.nameAr || row.room.nameEn} ({row.room.code})
                    </td>
                    <td
                      className="py-3"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {row.period.name}
                    </td>
                    <td
                      className="py-3"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {row.group.name}
                    </td>
                    <td
                      className="py-3 font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {row.group.currency} {row.basePrice}
                    </td>
                    <td className="py-3">
                      <span className="chip text-xs font-semibold">
                        {row.meal.code}
                        {row.mealPrice > 0 && (
                          <span className="text-green-600 dark:text-green-400">
                            +{row.mealPrice}
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className="text-xs"
                        style={{
                          color:
                            row.refund.type === "non_refundable"
                              ? "var(--danger)"
                              : row.refund.type === "free_cancellation"
                                ? "var(--success)"
                                : "var(--warning)",
                        }}
                      >
                        {row.refund.name}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className="font-bold text-sm"
                        style={{ color: "var(--sidebar-active-text)" }}
                      >
                        {row.group.currency} {row.total}
                      </span>
                    </td>
                  </tr>
                ))
              )}
              {generatedRows.length > 50 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-3 text-center text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    يتم عرض أول 50 نتيجة. استخدم الفلتر لتضييق النتائج.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
