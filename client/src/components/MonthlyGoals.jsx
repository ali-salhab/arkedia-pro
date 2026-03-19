import { useLanguage } from "../context/LanguageContext";

function GoalBar({ label, current, target, color = "#3b82f6", unit = "" }) {
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between items-center text-sm mb-1.5">
        <span
          className="font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          {label}
        </span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {current}
          {unit} / {target}
          {unit}
        </span>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: "var(--bg-raised)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div
        className="mt-0.5 text-right text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        {pct.toFixed(0)}%
      </div>
    </div>
  );
}

export default function MonthlyGoals({ goals = [] }) {
  const { t } = useLanguage();

  return (
    <div className="card">
      <h3
        className="text-base font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        {t("dashboardMonthlyGoalsTitle")}
      </h3>
      <p
        className="mt-0.5 mb-5 text-sm"
        style={{ color: "var(--text-secondary)" }}
      >
        {t("dashboardMonthlyGoalsSubtitle")}
      </p>
      <div className="space-y-4">
        {goals.length > 0 ? (
          goals.map((g, i) => <GoalBar key={i} {...g} />)
        ) : (
          <p
            className="py-4 text-center text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            {t("dashboardNoGoals")}
          </p>
        )}
      </div>
    </div>
  );
}
