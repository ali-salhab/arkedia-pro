import { useSelector } from "react-redux";
import {
  useGetUsersQuery,
  useGetActivitiesQuery,
  useGetBookingsQuery,
  useGetFinanceQuery,
} from "../../store/services/api";
import { useLanguage } from "../../context/LanguageContext";
import {
  toArr,
  buildMonthlySeries,
  calcTrend,
  formatCompactCurrency,
  takeLastMonths,
} from "../../utils/dashboardMetrics";
import StatCard from "../../components/StatCard";
import OverviewChart from "../../components/OverviewChart";
import DonutChart from "../../components/DonutChart";
import MonthlyGoals from "../../components/MonthlyGoals";
import { DollarSign, Users, CalendarDays, Zap } from "lucide-react";

export default function ActivityDashboard() {
  const user = useSelector((s) => s.auth.user);
  const perms = useSelector((s) => s.auth.user?.permissions || []);
  const has = (p) => perms.includes(p);
  const { t, lang } = useLanguage();

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

  const team = toArr(ud);
  const activities = toArr(ad);
  const bookings = toArr(bd);
  const finance = toArr(fd);

  const revenueRows = finance.filter((f) => f.type === "revenue");
  const expenseRows = finance.filter((f) => f.type === "expense");
  const totalRevenue = revenueRows.reduce(
    (s, f) => s + (Number(f.amount) || 0),
    0,
  );

  const revenueByMonth = buildMonthlySeries(
    revenueRows,
    ["date", "bookingDate", "createdAt"],
    "amount",
    lang,
  );
  const bookingsByMonth = buildMonthlySeries(
    bookings,
    ["checkIn", "bookingDate", "createdAt"],
    null,
    lang,
  );
  const expensesByMonth = buildMonthlySeries(
    expenseRows,
    ["date", "bookingDate", "createdAt"],
    "amount",
    lang,
  );
  const teamByMonth = buildMonthlySeries(team, ["createdAt"], null, lang);
  const activitiesByMonth = buildMonthlySeries(
    activities,
    ["createdAt"],
    null,
    lang,
  );

  const profitByMonth = revenueByMonth.map((p, i) => ({
    month: p.month,
    value: Math.max(0, p.value - (expensesByMonth[i]?.value || 0)),
  }));

  const revenueTrend = calcTrend(revenueByMonth);
  const bookingsTrend = calcTrend(bookingsByMonth);
  const teamTrend = calcTrend(teamByMonth);
  const activitiesTrend = calcTrend(activitiesByMonth);

  const donutData = [
    {
      name: t("dashboardSegmentConfirmed"),
      value: bookings.filter((b) => b.status === "confirmed").length,
    },
    {
      name: t("dashboardSegmentPending"),
      value: bookings.filter((b) => b.status === "pending").length,
    },
    {
      name: t("dashboardSegmentCheckedIn"),
      value: bookings.filter((b) => b.status === "checked_in").length,
    },
    {
      name: t("dashboardSegmentCancelled"),
      value: bookings.filter((b) => b.status === "cancelled").length,
    },
  ].filter((d) => d.value > 0);

  const currentMonth = new Date().getMonth();
  const goals = [
    {
      label: t("dashboardGoalRevenue"),
      current: Math.round(revenueByMonth[currentMonth]?.value || 0),
      target: 20000,
      color: "#f97316",
    },
    {
      label: t("dashboardGoalBookings"),
      current: bookingsByMonth[currentMonth]?.value || 0,
      target: 150,
      color: "#14b8a6",
    },
    {
      label: t("dashboardGoalActivitiesListed"),
      current: activities.length,
      target: 50,
      color: "#8b5cf6",
    },
  ];

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          {t("dashboard")}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          {t("dashboardWelcomeLine")} {user?.name}.{" "}
          {t("dashboardBusinessOverview")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={t("dashboardCardTotalRevenue")}
          value={formatCompactCurrency(totalRevenue, lang)}
          trend={revenueTrend.trend}
          trendPositive={revenueTrend.positive}
          sparkData={takeLastMonths(revenueByMonth, 7)}
          color="#f97316"
          icon={DollarSign}
        />
        <StatCard
          title={t("dashboardCardTeamMembers")}
          value={team.length}
          trend={teamTrend.trend}
          trendPositive={teamTrend.positive}
          sparkData={takeLastMonths(teamByMonth, 7)}
          color="#14b8a6"
          icon={Users}
        />
        <StatCard
          title={t("dashboardCardTotalBookings")}
          value={bookings.length}
          trend={bookingsTrend.trend}
          trendPositive={bookingsTrend.positive}
          sparkData={takeLastMonths(bookingsByMonth, 7)}
          color="#1e3a5f"
          icon={CalendarDays}
        />
        <StatCard
          title={t("dashboardCardActivities")}
          value={activities.length}
          trend={activitiesTrend.trend}
          trendPositive={activitiesTrend.positive}
          sparkData={takeLastMonths(activitiesByMonth, 7)}
          color="#8b5cf6"
          icon={Zap}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <OverviewChart
            revenueData={revenueByMonth}
            ordersData={bookingsByMonth}
            profitData={profitByMonth}
            labels={{ orders: t("dashboardTabBookings") }}
          />
        </div>
        <div className="flex flex-col gap-5">
          <DonutChart
            data={donutData}
            title={t("dashboardBookingStatus")}
            subtitle={t("dashboardBookingStatusSubtitle")}
            centerLabel={t("dashboardVisitsLabel")}
          />
          <MonthlyGoals goals={goals} />
        </div>
      </div>
    </div>
  );
}
