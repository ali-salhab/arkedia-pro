import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useLanguage } from "../context/LanguageContext";

const SERIES = [
  { key: "revenue", color: "#f97316" },
  { key: "orders", color: "#3b82f6" },
  { key: "profit", color: "#10b981" },
];

function CustomTooltip({ active, payload, label, seriesLabels }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2.5 shadow-lg text-sm min-w-[140px]"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        className="mb-2 font-medium text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </div>
      {payload.map((entry) => {
        const isMoney =
          entry.dataKey === "revenue" || entry.dataKey === "profit";
        const v = entry.value;
        const display = isMoney
          ? v >= 1000000
            ? `$${(v / 1000000).toFixed(1)}M`
            : v >= 1000
              ? `$${(v / 1000).toFixed(1)}k`
              : `$${v}`
          : v;
        return (
          <div key={entry.dataKey} className="flex items-center gap-2 mb-0.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: entry.color }}
            />
            <span
              style={{ color: "var(--text-secondary)" }}
              className="text-xs"
            >
              {seriesLabels[entry.dataKey]}
            </span>
            <span
              className="ml-auto font-semibold text-xs"
              style={{ color: "var(--text-primary)" }}
            >
              {display}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function CustomLegend({ seriesLabels }) {
  return (
    <div className="flex items-center gap-4 justify-end flex-wrap mt-1 mb-3">
      {SERIES.map(({ key, color }) => (
        <div key={key} className="flex items-center gap-1.5">
          <span
            className="inline-block w-6 h-0.5 rounded-full"
            style={{ background: color }}
          />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {seriesLabels[key]}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function OverviewChart({
  revenueData = [],
  ordersData = [],
  profitData = [],
  labels = {},
  title,
  subtitle,
}) {
  const { t } = useLanguage();

  const seriesLabels = {
    revenue: labels.revenue || t("dashboardTabRevenue"),
    orders: labels.orders || t("dashboardTabOrders"),
    profit: labels.profit || t("dashboardTabProfit"),
  };

  const chartTitle = title || t("dashboardOverviewTitle");
  const chartSubtitle = subtitle || t("dashboardOverviewSubtitle");

  // Merge all 3 series into one dataset keyed by month
  const merged = revenueData.map((point, i) => ({
    month: point.month,
    revenue: point.value,
    orders: ordersData[i]?.value ?? 0,
    profit: profitData[i]?.value ?? 0,
  }));

  const formatRevenue = (v) => {
    if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `$${(v / 1000).toFixed(0)}k`;
    return `$${v}`;
  };

  return (
    <div className="card h-full">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3
            className="text-base font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {chartTitle}
          </h3>
          <p
            className="text-sm mt-0.5"
            style={{ color: "var(--text-secondary)" }}
          >
            {chartSubtitle}
          </p>
        </div>
      </div>
      <CustomLegend seriesLabels={seriesLabels} />
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={merged}
            margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
          >
            <defs>
              {SERIES.map(({ key, color }) => (
                <linearGradient
                  key={key}
                  id={`lg-${key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="money"
              tickFormatter={formatRevenue}
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <YAxis
              yAxisId="count"
              orientation="right"
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip content={<CustomTooltip seriesLabels={seriesLabels} />} />
            <Line
              yAxisId="money"
              type="monotone"
              dataKey="revenue"
              stroke="#f97316"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: "#f97316", strokeWidth: 0 }}
            />
            <Line
              yAxisId="count"
              type="monotone"
              dataKey="orders"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
            />
            <Line
              yAxisId="money"
              type="monotone"
              dataKey="profit"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
