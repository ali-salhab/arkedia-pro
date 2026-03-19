import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const TABS = [
  { key: "revenue", label: "Revenue", color: "#f97316" },
  { key: "orders", label: "Orders", color: "#3b82f6" },
  { key: "profit", label: "Profit", color: "#10b981" },
];

function CustomTooltip({ active, payload, label, isMoney }) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  const display = isMoney
    ? v >= 1000000
      ? `$${(v / 1000000).toFixed(1)}M`
      : v >= 1000
        ? `$${(v / 1000).toFixed(1)}k`
        : `$${v}`
    : v;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-lg text-sm">
      <div className="text-slate-500 mb-1">{label}</div>
      <div className="font-semibold text-slate-800">{display}</div>
    </div>
  );
}

export default function OverviewChart({
  revenueData = [],
  ordersData = [],
  profitData = [],
  labels = {},
}) {
  const [tab, setTab] = useState("revenue");

  const datasets = {
    revenue: { data: revenueData, color: "#f97316" },
    orders: { data: ordersData, color: "#3b82f6" },
    profit: { data: profitData, color: "#10b981" },
  };

  const tabLabels = {
    revenue: labels.revenue || "Revenue",
    orders: labels.orders || "Orders",
    profit: labels.profit || "Profit",
  };

  const { data, color } = datasets[tab];
  const isMoneyTab = tab === "revenue" || tab === "profit";

  const formatY = (v) => {
    if (isMoneyTab) {
      if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
      if (v >= 1000) return `$${(v / 1000).toFixed(0)}k`;
      return `$${v}`;
    }
    return v;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-full">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-800">Overview</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Monthly performance for the current year
          </p>
        </div>
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3.5 py-1.5 text-xs font-semibold transition ${
                tab === t.key
                  ? "bg-white text-slate-800"
                  : "bg-slate-50 text-slate-500 hover:text-slate-700"
              }`}
            >
              {tabLabels[t.key]}
            </button>
          ))}
        </div>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id={`oc-${tab}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatY}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip content={<CustomTooltip isMoney={isMoneyTab} />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2.5}
              fill={`url(#oc-${tab})`}
              dot={false}
              activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
