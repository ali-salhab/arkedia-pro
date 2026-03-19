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
import { DollarSign, Shield, CalendarDays, Building2 } from "lucide-react";

export default function SuperAdminDashboard() {
  const user = useSelector((state) => state.auth.user);
  const perms = useSelector((state) => state.auth.user?.permissions || []);
  const has = (permission) => perms.includes(permission);
  const { t, lang } = useLanguage();

  const { data: usersData } = useGetUsersQuery(undefined, {
    skip: !has("users:view"),
  });
  const { data: bookingsData } = useGetBookingsQuery(undefined, {
    skip: !has("bookings:view"),
  });
  const { data: financeData } = useGetFinanceQuery(undefined, {
    skip: !has("finance:view"),
  });

  const allUsers = toArr(usersData);
  const bookings = toArr(bookingsData);
  const finance = toArr(financeData);

  const admins = allUsers.filter((item) => item.role === "admin");
  const hotels = allUsers.filter((item) => item.role === "hotel");
  const restaurants = allUsers.filter((item) => item.role === "restaurant");
  const activities = allUsers.filter((item) => item.role === "activity");
  const managedEntities = [...hotels, ...restaurants, ...activities];

  const revenueRows = finance.filter((item) => item.type === "revenue");
  const expenseRows = finance.filter((item) => item.type === "expense");

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
  const adminsByMonth = buildMonthlySeries(admins, ["createdAt"], null, lang);
  const managedByMonth = buildMonthlySeries(
    managedEntities,
    ["createdAt"],
    null,
    lang,
  );

  const profitByMonth = revenueByMonth.map((monthPoint, index) => ({
    month: monthPoint.month,
    value: Math.max(0, monthPoint.value - (expensesByMonth[index]?.value || 0)),
  }));

  const revenueTrend = calcTrend(revenueByMonth);
  const bookingsTrend = calcTrend(bookingsByMonth);
  const adminsTrend = calcTrend(adminsByMonth);
  const managedTrend = calcTrend(managedByMonth);

  const donutData = [
    { name: t("dashboardSegmentHotels"), value: hotels.length },
    { name: t("dashboardSegmentRestaurants"), value: restaurants.length },
    { name: t("dashboardSegmentActivities"), value: activities.length },
    { name: t("dashboardSegmentAdmins"), value: admins.length },
  ].filter((item) => item.value > 0);

  const currentMonth = new Date().getMonth();
  const goals = [
    {
      label: t("dashboardGoalPlatformRevenue"),
      current: Math.round(revenueByMonth[currentMonth]?.value || 0),
      target: 500000,
      color: "#f97316",
    },
    {
      label: t("dashboardGoalBookings"),
      current: bookingsByMonth[currentMonth]?.value || 0,
      target: 2000,
      color: "#14b8a6",
    },
    {
      label: t("dashboardGoalManagedEntities"),
      current: managedEntities.length,
      target: 100,
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
          {t("dashboardPlatformOverview")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={t("dashboardCardPlatformRevenue")}
          value={formatCompactCurrency(totalRevenue, lang)}
          trend={revenueTrend.trend}
          trendPositive={revenueTrend.positive}
          sparkData={takeLastMonths(revenueByMonth, 7)}
          color="#f97316"
          icon={DollarSign}
        />
        <StatCard
          title={t("dashboardCardAdminAccounts")}
          value={admins.length}
          trend={adminsTrend.trend}
          trendPositive={adminsTrend.positive}
          sparkData={takeLastMonths(adminsByMonth, 7)}
          color="#ef4444"
          icon={Shield}
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
          title={t("dashboardCardManagedEntities")}
          value={managedEntities.length}
          trend={managedTrend.trend}
          trendPositive={managedTrend.positive}
          sparkData={takeLastMonths(managedByMonth, 7)}
          color="#14b8a6"
          icon={Building2}
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
            title={t("dashboardEntityDistribution")}
            subtitle={t("dashboardEntityDistributionSubtitle")}
            centerLabel={t("dashboardTotalLabel")}
          />
          <MonthlyGoals goals={goals} />
        </div>
      </div>
    </div>
  );
}
