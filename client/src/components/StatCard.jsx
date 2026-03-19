import { AreaChart, Area, ResponsiveContainer } from "recharts";
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

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      <div className="p-5 pb-3 flex-1">
        <div className="flex items-start justify-between mb-3">
          <span className="text-sm font-medium text-slate-500">{title}</span>
          {Icon && (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: color + "18" }}
            >
              <Icon size={18} style={{ color }} />
            </div>
          )}
        </div>
        <div className="text-3xl font-bold tracking-tight text-slate-800">
          {value}
        </div>
        {hasTrend && (
          <div
            className={`flex items-center gap-1.5 mt-1.5 text-sm font-medium ${
              isPositive ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{trend}</span>
            <span className="text-slate-400 font-normal text-xs">
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
