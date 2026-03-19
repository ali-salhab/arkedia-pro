import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useLanguage } from "../context/LanguageContext";

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
  title,
  subtitle = "",
  centerLabel,
}) {
  const { t } = useLanguage();
  const chartTitle = title || t("dashboardDistributionTitle");
  const chartCenterLabel = centerLabel || t("dashboardTotalLabel");
  const total = data.reduce((s, d) => s + (d.value || 0), 0);
  const isEmpty = total === 0 || data.length === 0;
  const displayData = isEmpty ? [{ name: t("noData"), value: 1 }] : data;

  const formatCenter = () => {
    if (isEmpty) return "—";
    if (total >= 1000000) return `${(total / 1000000).toFixed(1)}M`;
    if (total >= 1000) return `${(total / 1000).toFixed(0)}K`;
    return String(total);
  };

  const tooltipStyles = {
    borderRadius: 10,
    fontSize: 12,
    border: "1px solid var(--border)",
    background: "var(--bg-surface)",
    color: "var(--text-primary)",
  };

  return (
    <div className="card">
      <h3
        className="text-base font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        {chartTitle}
      </h3>
      {subtitle && (
        <p
          className="mt-0.5 text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          {subtitle}
        </p>
      )}
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
                  contentStyle={tooltipStyles}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div
              className="text-xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {formatCenter()}
            </div>
            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {chartCenterLabel}
            </div>
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
                  <span
                    className="truncate"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {d.name}
                  </span>
                </div>
                <span
                  className="font-semibold flex-shrink-0"
                  style={{ color: "var(--text-primary)" }}
                >
                  {((d.value / total) * 100).toFixed(0)}%
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {t("noData")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
