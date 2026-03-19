import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = [
  "#f97316",
  "#14b8a6",
  "#1e3a5f",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
];

export default function DonutChart({
  data = [],
  title = "Distribution",
  subtitle = "",
  centerLabel = "Total",
}) {
  const total = data.reduce((s, d) => s + (d.value || 0), 0);
  const isEmpty = total === 0 || data.length === 0;
  const displayData = isEmpty ? [{ name: "No data", value: 1 }] : data;

  const formatCenter = () => {
    if (isEmpty) return "—";
    if (total >= 1000000) return `${(total / 1000000).toFixed(1)}M`;
    if (total >= 1000) return `${(total / 1000).toFixed(0)}K`;
    return String(total);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      <div className="flex items-center gap-5 mt-4">
        <div
          className="relative flex-shrink-0"
          style={{ width: 128, height: 128 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={58}
                dataKey="value"
                strokeWidth={0}
              >
                {displayData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={isEmpty ? "#e2e8f0" : COLORS[i % COLORS.length]}
                  />
                ))}
              </Pie>
              {!isEmpty && (
                <Tooltip
                  formatter={(v) => [`${((v / total) * 100).toFixed(0)}%`]}
                  contentStyle={{
                    borderRadius: 10,
                    fontSize: 12,
                    border: "1px solid #e2e8f0",
                  }}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-xl font-bold text-slate-800">
              {formatCenter()}
            </div>
            <div className="text-xs text-slate-500">{centerLabel}</div>
          </div>
        </div>
        <div className="flex-1 space-y-2 min-w-0">
          {!isEmpty ? (
            data.map((d, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-slate-600 truncate">{d.name}</span>
                </div>
                <span className="font-semibold text-slate-700 flex-shrink-0">
                  {((d.value / total) * 100).toFixed(0)}%
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">No data</p>
          )}
        </div>
      </div>
    </div>
  );
}
