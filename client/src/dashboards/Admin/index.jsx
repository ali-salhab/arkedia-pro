import { useSelector } from "react-redux";
import {
  useGetUsersQuery,
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
import { DollarSign, Building2, CalendarDays, Users } from "lucide-react";

export default function AdminDashboard() {
  const user = useSelector((state) => state.auth.user);
  const perms = useSelector((state) => state.auth.user?.permissions || []);
  const has = (permission) => perms.includes(permission);
  const { t, lang } = useLanguage();

  const { data: hotelsData } = useGetUsersQuery(
    { role: "hotel" },
    { skip: !has("hotels:view") },
  );
  const { data: restaurantsData } = useGetUsersQuery(
    { role: "restaurant" },
    { skip: !has("restaurants:view") },
  );
  const { data: activitiesData } = useGetUsersQuery(
    { role: "activity" },
    { skip: !has("activities:view") },
  );
  const { data: teamData } = useGetUsersQuery(
    { role: "adminuser" },
    { skip: !has("users:view") },
  );
  const { data: bookingsData } = useGetBookingsQuery(undefined, {
    skip: !has("bookings:view"),
  });
  const { data: financeData } = useGetFinanceQuery(undefined, {
    skip: !has("finance:view"),
  });

  const hotels = toArr(hotelsData);
  const restaurants = toArr(restaurantsData);
  const activities = toArr(activitiesData);
  const team = toArr(teamData);
  const bookings = toArr(bookingsData);
  const finance = toArr(financeData);

  const revenueRows = finance.filter((item) => item.type === "revenue");
  const expenseRows = finance.filter((item) => item.type === "expense");
  const managedAccounts = [...hotels, ...restaurants, ...activities];

  const totalRevenue = revenueRows.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
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
  const managedByMonth = buildMonthlySeries(
    managedAccounts,
    ["createdAt"],
    null,
    lang,
  );
  const teamByMonth = buildMonthlySeries(team, ["createdAt"], null, lang);

  const profitByMonth = revenueByMonth.map((monthPoint, index) => ({
    month: monthPoint.month,
    value: Math.max(0, monthPoint.value - (expensesByMonth[index]?.value || 0)),
  }));

  const revenueTrend = calcTrend(revenueByMonth);
  const bookingsTrend = calcTrend(bookingsByMonth);
  const managedTrend = calcTrend(managedByMonth);
  const teamTrend = calcTrend(teamByMonth);

  const donutData = [
    { name: t("dashboardSegmentHotels"), value: hotels.length },
    { name: t("dashboardSegmentRestaurants"), value: restaurants.length },
    { name: t("dashboardSegmentActivities"), value: activities.length },
  ].filter((item) => item.value > 0);

  const currentMonth = new Date().getMonth();
  const goals = [
    {
      label: t("dashboardGoalRevenue"),
      current: Math.round(revenueByMonth[currentMonth]?.value || 0),
      target: 100000,
      color: "#f97316",
    },
    {
      label: t("dashboardGoalBookings"),
      current: bookingsByMonth[currentMonth]?.value || 0,
      target: 500,
      color: "#14b8a6",
    },
    {
      label: t("dashboardGoalManagedAccounts"),
      current: managedAccounts.length,
      target: 20,
      color: "#3b82f6",
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
          title={t("dashboardCardManagedAccounts")}
          value={managedAccounts.length}
          trend={managedTrend.trend}
          trendPositive={managedTrend.positive}
          sparkData={takeLastMonths(managedByMonth, 7)}
          color="#3b82f6"
          icon={Building2}
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
          title={t("dashboardCardTeamMembers")}
          value={team.length}
          trend={teamTrend.trend}
          trendPositive={teamTrend.positive}
          sparkData={takeLastMonths(teamByMonth, 7)}
          color="#14b8a6"
          icon={Users}
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
            title={t("dashboardAccountTypes")}
            subtitle={t("dashboardAccountTypesSubtitle")}
            centerLabel={t("dashboardTotalLabel")}
          />
          <MonthlyGoals goals={goals} />
        </div>
      </div>
    </div>
  );
}
