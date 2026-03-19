import { useSelector } from "react-redux";
import {
  useGetUsersQuery,
  useGetRoomsQuery,
  useGetBookingsQuery,
  useGetFinanceQuery,
} from "../../store/services/api";
import StatCard from "../../components/StatCard";
import OverviewChart from "../../components/OverviewChart";
import DonutChart from "../../components/DonutChart";
import MonthlyGoals from "../../components/MonthlyGoals";
import { DollarSign, Users, CalendarDays, UtensilsCrossed } from "lucide-react";

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

export default function RestaurantDashboard() {
  const user = useSelector((s) => s.auth.user);
  const perms = useSelector((s) => s.auth.user?.permissions || []);
  const has = (p) => perms.includes(p);

  const { data: ud } = useGetUsersQuery(undefined, {
    skip: !has("users:view"),
  });
  const { data: td } = useGetRoomsQuery(undefined, {
    skip: !has("rooms:view"),
  });
  const { data: bd } = useGetBookingsQuery(undefined, {
    skip: !has("bookings:view"),
  });
  const { data: fd } = useGetFinanceQuery(undefined, {
    skip: !has("finance:view"),
  });

  const team = toArr(ud),
    tables = toArr(td),
    bookings = toArr(bd),
    finance = toArr(fd);
  const revenue = finance.filter((f) => f.type === "revenue");
  const expenses = finance.filter((f) => f.type === "expense");
  const totalRevenue = revenue.reduce((s, f) => s + (Number(f.amount) || 0), 0);
  const availableTables = tables.filter(
    (t) => t.status === "available" || !t.status,
  ).length;

  const revByMonth = byMonth(revenue, "date", "amount");
  const rsrvByMonth = byMonth(bookings, "checkIn");
  const expByMonth = byMonth(expenses, "date", "amount");
  const profitByMonth = revByMonth.map((r, i) => ({
    month: r.month,
    value: Math.max(0, r.value - (expByMonth[i]?.value || 0)),
  }));

  const revTrend = calcTrend(revByMonth);
  const rsrvTrend = calcTrend(rsrvByMonth);

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
      name: "Seated",
      value: bookings.filter((b) => b.status === "checked_in").length,
    },
    {
      name: "Cancelled",
      value: bookings.filter((b) => b.status === "cancelled").length,
    },
  ].filter((d) => d.value > 0);

  const m = new Date().getMonth();
  const utilization =
    tables.length > 0
      ? Math.round(((tables.length - availableTables) / tables.length) * 100)
      : 0;

  const goals = [
    {
      label: "Revenue Target",
      current: Math.round(revByMonth[m]?.value || 0),
      target: 30000,
      color: "#f97316",
    },
    {
      label: "Reservations Target",
      current: rsrvByMonth[m]?.value || 0,
      target: 200,
      color: "#14b8a6",
    },
    {
      label: "Table Utilization",
      current: utilization,
      target: 100,
      color: "#3b82f6",
      unit: "%",
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
          title="Total Reservations"
          value={bookings.length}
          trend={rsrvTrend.trend}
          trendPositive={rsrvTrend.positive}
          sparkData={rsrvByMonth.slice(-7)}
          color="#1e3a5f"
          icon={CalendarDays}
        />
        <StatCard
          title="Available Tables"
          value={availableTables}
          trend="—"
          sparkData={Array.from({ length: 7 }, () => ({
            value: availableTables,
          }))}
          color="#f59e0b"
          icon={UtensilsCrossed}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <OverviewChart
            revenueData={revByMonth}
            ordersData={rsrvByMonth}
            profitData={profitByMonth}
            labels={{ orders: "Reservations" }}
          />
        </div>
        <div className="flex flex-col gap-5">
          <DonutChart
            data={donutData}
            title="Reservation Status"
            subtitle="Where your reservations stand"
            centerLabel="Visits"
          />
          <MonthlyGoals goals={goals} />
        </div>
      </div>
    </div>
  );
}
