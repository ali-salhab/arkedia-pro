import { useState, useMemo } from "react";
import {
  DollarSign,
  ChevronDown,
  Filter,
  DoorOpen,
  Users,
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
  { id: "1", name: "Extra Bed", prices: {} },
  { id: "2", name: "Sea View", prices: {} },
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
  const [expandedRows, setExpandedRows] = useState({});

  function toggleRow(key) {
    setExpandedRows((p) => ({ ...p, [key]: !p[key] }));
  }

  function setDblPrice(periodId, groupId, val) {
    setDblPrices((prev) => ({
      ...prev,
      [periodId]: { ...(prev[periodId] || {}), [groupId]: Number(val) },
    }));
  }

  /**
   * Generated rate rows — one per (room × supplement).
   * Prices per group are computed: basePrice (from dblPrices) + room priceDiff + supplement roomPrice per group.
   */
  const rateRows = useMemo(() => {
    const rows = [];
    roomTypes.forEach((room) => {
      if (filterRoom !== "all" && room.id !== filterRoom) return;

      // Always add the base room row (no supplement)
      rows.push({ room, supplement: null });

      // Then one row per supplement
      supplements.forEach((supp) => {
        rows.push({ room, supplement: supp });
      });
    });
    return rows;
  }, [roomTypes, supplements, filterRoom]);

  /** Compute per-group total for a (room, supplement, period, group) */
  function calcPrice(room, supplement, periodId, groupId) {
    const base = dblPrices[periodId]?.[groupId] ?? 0;
    const roomDiff = room.priceDiffs?.[periodId]?.[groupId] ?? 0;
    const suppPrice = supplement?.prices?.[groupId] ?? 0;
    return base + roomDiff + suppPrice;
  }

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

      {/* Section 2: Auto-Generated Rates */}
      <div className="card">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          {/* Filter button */}
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
            <span>Filter</span>
          </button>

          {/* Title + count */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full grid place-items-center text-sm font-bold text-white"
                style={{ backgroundColor: "var(--sidebar-active-text)" }}
              >
                2
              </div>
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                Auto-Generated Rates
              </p>
            </div>
            <span className="chip font-semibold">{rateRows.length}</span>
          </div>
        </div>

        {/* Filter panel */}
        {filterOpen && (
          <div
            className="mb-4 p-4 rounded-xl grid grid-cols-2 gap-3"
            style={{
              backgroundColor: "var(--bg-raised)",
              border: "1px solid var(--border)",
            }}
          >
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Room
              </label>
              <select
                value={filterRoom}
                onChange={(e) => setFilterRoom(e.target.value)}
                className="input text-sm w-full"
              >
                <option value="all">All</option>
                {roomTypes.map((r) => (
                  <option key={r.id} value={r.id}>{r.nameEn}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Period
              </label>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="input text-sm w-full"
              >
                <option value="all">All</option>
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Group header pills */}
        <div className="flex flex-wrap gap-2 mb-5">
          {groups.map((g) => (
            <div
              key={g.id}
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                backgroundColor: "var(--bg-raised)",
                border: "1px solid var(--border)",
              }}
            >
              <Users size={14} style={{ color: "var(--text-muted)" }} />
              <div>
                <p className="text-xs font-bold leading-none" style={{ color: "var(--text-primary)" }}>
                  {g.name.toUpperCase()}
                </p>
                <p className="text-xs leading-none mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {g.currency}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Accordion rows */}
        {rateRows.length === 0 ? (
          <p className="py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            No rooms configured yet.
          </p>
        ) : (
          <div className="space-y-2">
            {rateRows.map((row, idx) => {
              const key = `${row.room.id}-${row.supplement?.id ?? "base"}`;
              const isOpen = !!expandedRows[key];
              const title = row.supplement
                ? `${row.room.nameEn} - ${row.supplement.name}`
                : row.room.nameEn;

              // Total count across all periods & groups
              const totalCount = periods.length * groups.length;

              return (
                <div
                  key={key}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {/* Row header */}
                  <button
                    type="button"
                    onClick={() => toggleRow(key)}
                    className="w-full flex items-center justify-between px-4 py-3 gap-3"
                  >
                    {/* Left: door icon + info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "var(--bg-raised)" }}
                      >
                        {row.room.mainImage ? (
                          <img
                            src={row.room.mainImage}
                            alt=""
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <DoorOpen size={18} style={{ color: "var(--border)", opacity: 0.6 }} />
                        )}
                      </div>
                      <div className="min-w-0 text-left">
                        <p
                          className="text-sm font-bold truncate"
                          style={{ color: "var(--text-primary)", textTransform: "uppercase" }}
                        >
                          {title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span
                            className="text-xs px-2 py-0.5 rounded-md font-medium"
                            style={{
                              backgroundColor: "var(--bg-raised)",
                              border: "1px solid var(--border)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {row.room.roomType}
                          </span>
                          {row.supplement && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-md font-medium"
                              style={{
                                backgroundColor: "var(--bg-raised)",
                                border: "1px solid var(--border)",
                                color: "var(--sidebar-active-text)",
                              }}
                            >
                              {row.supplement.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: count badge + chevron */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className="w-8 h-8 rounded-full grid place-items-center text-sm font-bold"
                        style={{
                          backgroundColor: "var(--bg-raised)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {totalCount}
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
                  </button>

                  {/* Expanded content — periods × groups grid */}
                  {isOpen && (
                    <div
                      className="px-4 pb-4 pt-1"
                      style={{ borderTop: "1px solid var(--border)" }}
                    >
                      {periods
                        .filter((p) => filterPeriod === "all" || p.id === filterPeriod)
                        .map((period) => (
                          <div key={period.id} className="mb-4">
                            <p
                              className="text-xs font-semibold mb-2 uppercase tracking-wide"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {period.name}
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {groups.map((g) => {
                                const price = calcPrice(row.room, row.supplement, period.id, g.id);
                                return (
                                  <div
                                    key={g.id}
                                    className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                                    style={{
                                      backgroundColor: "var(--bg-raised)",
                                      border: "1px solid var(--border)",
                                    }}
                                  >
                                    <span
                                      className="text-sm font-bold"
                                      style={{ color: "var(--sidebar-active-text)" }}
                                    >
                                      {price.toLocaleString()}
                                    </span>
                                    <div className="text-right">
                                      <p
                                        className="text-xs font-semibold leading-none"
                                        style={{ color: "var(--text-primary)" }}
                                      >
                                        {g.name.split(" ")[0].toUpperCase()}
                                      </p>
                                      <p
                                        className="text-xs leading-none mt-0.5"
                                        style={{ color: "var(--text-muted)" }}
                                      >
                                        {g.currency}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

