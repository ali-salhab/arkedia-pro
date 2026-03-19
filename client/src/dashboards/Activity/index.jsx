import { useSelector } from "react-redux";
import {
  useGetUsersQuery,
  useGetActivitiesQuery,
  useGetBookingsQuery,
  useGetFinanceQuery,
} from "../../store/services/api";
import StatCard from "../../components/StatCard";
import OverviewChart from "../../components/OverviewChart";
import DonutChart from "../../components/DonutChart";
import MonthlyGoals from "../../components/MonthlyGoals";
import { DollarSign, Users, CalendarDays, Zap } from "lucide-react";

function toArr(d) {
  return Array.isArray(d) ? d : d?.items || [];
}
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
function byMonth(items, dateField, valueField = null) {
  const map = MONTHS.map((month) => ({ month, value: 0 }));
  items.forEach((item) => {
    const d = new Date(item[dateField]);
    if (!isNaN(d))
      map[d.getMonth()].value += valueField ? Number(item[valueField]) || 0 : 1;
  });
  return map;
}
function calcTrend(monthData) {
  const m = new Date().getMonth();
  const curr = monthData[m]?.value || 0;
  const prev = monthData[(m - 1 + 12) % 12]?.value || 0;
  const pct = prev === 0 ? 0 : (((curr - prev) / prev) * 100).toFixed(1);
  return {
    trend: `${Number(pct) >= 0 ? "+" : ""}${pct}%`,
    positive: Number(pct) >= 0,
  };
}
function fmtMoney(n) {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${Math.round(n)}`;
}

export default function ActivityDashboard() {
  const user = useSelector((s) => s.auth.user);
  const perms = useSelector((s) => s.auth.user?.permissions || []);
  const has = (p) => perms.includes(p);

  const { data: ud } = useGetUsersQuery(undefined, {
    skip: !has("users:view"),
  });
  const { data: ad } = useGetActivitiesQuery(undefined, {
    skip: !has("activities:view"),
  });
  const { data: bd } = useGetBookingsQuery(undefined, {
    skip: !has("bookings:view"),
  });
  const { data: fd } = useGetFinanceQuery(undefined, {
    skip: !has("finance:view"),
  });

  const team = toArr(ud),
    activities = toArr(ad),
    bookings = toArr(bd),
    finance = toArr(fd);
  const revenue = finance.filter((f) => f.type === "revenue");
  const expenses = finance.filter((f) => f.type === "expense");
  const totalRevenue = revenue.reduce((s, f) => s + (Number(f.amount) || 0), 0);

  const revByMonth = byMonth(revenue, "date", "amount");
  const bkByMonth = byMonth(bookings, "checkIn");
  const expByMonth = byMonth(expenses, "date", "amount");
  const profitByMonth = revByMonth.map((r, i) => ({
    month: r.month,
    value: Math.max(0, r.value - (expByMonth[i]?.value || 0)),
  }));

  const revTrend = calcTrend(revByMonth);
  const bkTrend = calcTrend(bkByMonth);

  const donutData = [
    {
      name: "Confirmed",
      value: bookings.filter((b) => b.status === "confirmed").length,
    },
    {
      name: "Pending",
      value: bookings.filter((b) => b.status === "pending").length,
    },
    {
      name: "Checked In",
      value: bookings.filter((b) => b.status === "checked_in").length,
    },
    {
      name: "Cancelled",
      value: bookings.filter((b) => b.status === "cancelled").length,
    },
  ].filter((d) => d.value > 0);

  const m = new Date().getMonth();
  const goals = [
    {
      label: "Revenue Target",
      current: Math.round(revByMonth[m]?.value || 0),
      target: 20000,
      color: "#f97316",
    },
    {
      label: "Bookings Target",
      current: bkByMonth[m]?.value || 0,
      target: 150,
      color: "#14b8a6",
    },
    {
      label: "Activities Listed",
      current: activities.length,
      target: 50,
      color: "#8b5cf6",
    },
  ];

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Welcome back, {user?.name}. Here's what's happening with your business
          today.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Total Revenue"
          value={fmtMoney(totalRevenue)}
          trend={revTrend.trend}
          trendPositive={revTrend.positive}
          sparkData={revByMonth.slice(-7)}
          color="#f97316"
          icon={DollarSign}
        />
        <StatCard
          title="Team Members"
          value={team.length}
          trend="—"
          sparkData={Array.from({ length: 7 }, () => ({ value: team.length }))}
          color="#14b8a6"
          icon={Users}
        />
        <StatCard
          title="Total Bookings"
          value={bookings.length}
          trend={bkTrend.trend}
          trendPositive={bkTrend.positive}
          sparkData={bkByMonth.slice(-7)}
          color="#1e3a5f"
          icon={CalendarDays}
        />
        <StatCard
          title="Activities"
          value={activities.length}
          trend="—"
          sparkData={Array.from({ length: 7 }, () => ({
            value: activities.length,
          }))}
          color="#8b5cf6"
          icon={Zap}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <OverviewChart
            revenueData={revByMonth}
            ordersData={bkByMonth}
            profitData={profitByMonth}
            labels={{ orders: "Bookings" }}
          />
        </div>
        <div className="flex flex-col gap-5">
          <DonutChart
            data={donutData}
            title="Booking Status"
            subtitle="Where your bookings stand"
            centerLabel="Visits"
          />
          <MonthlyGoals goals={goals} />
        </div>
      </div>
    </div>
  );
}
