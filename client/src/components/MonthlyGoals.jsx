function GoalBar({ label, current, target, color = "#3b82f6", unit = "" }) {
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between items-center text-sm mb-1.5">
        <span className="text-slate-600 font-medium">{label}</span>
        <span className="text-slate-500 text-xs">
          {current}
          {unit} / {target}
          {unit}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="text-right text-xs text-slate-400 mt-0.5">
        {pct.toFixed(0)}%
      </div>
    </div>
  );
}

export default function MonthlyGoals({ goals = [] }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <h3 className="text-base font-bold text-slate-800">Monthly Goals</h3>
      <p className="text-sm text-slate-500 mt-0.5 mb-5">
        Track progress toward targets
      </p>
      <div className="space-y-4">
        {goals.length > 0 ? (
          goals.map((g, i) => <GoalBar key={i} {...g} />)
        ) : (
          <p className="text-sm text-slate-400 text-center py-4">
            No active goals
          </p>
        )}
      </div>
    </div>
  );
}
