import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({
  title,
  value,
  trend,
  trendPositive,
  sparkData,
  color = "#3b82f6",
  icon: Icon,
}) {
  const isPositive = trendPositive !== false;
  const hasTrend = trend && trend !== "—";

  const values = Array.isArray(sparkData)
    ? sparkData
        .map((point) => Number(point?.value))
        .filter((value) => Number.isFinite(value))
    : [];
  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const maxValue = values.length > 0 ? Math.max(...values) : 0;
  const span = Math.max(1, maxValue - minValue);
  const pad = span * 0.25;
  const yDomain = [Math.max(0, minValue - pad), maxValue + pad];

  return (
    <div className="card overflow-hidden flex flex-col">
      <div className="p-5 pb-3 flex-1">
        <div className="flex items-start justify-between mb-3">
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            {title}
          </span>
          {Icon && (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: color + "18" }}
            >
              <Icon size={18} style={{ color }} />
            </div>
          )}
        </div>
        <div
          className="text-3xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {value}
        </div>
        {hasTrend && (
          <div
            className="flex items-center gap-1.5 mt-1.5 text-sm font-medium"
            style={{ color: isPositive ? "var(--success)" : "var(--danger)" }}
          >
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{trend}</span>
            <span
              className="font-normal text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              vs last month
            </span>
          </div>
        )}
      </div>
      {sparkData && sparkData.length > 0 && (
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={sparkData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <YAxis domain={yDomain} hide />
              <defs>
                <linearGradient
                  id={`spark-${title.replace(/\s+/g, "")}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#spark-${title.replace(/\s+/g, "")})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
