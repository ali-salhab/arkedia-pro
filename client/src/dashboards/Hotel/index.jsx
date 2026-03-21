import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  useGetUsersQuery,
  useGetRoomsQuery,
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
import { DollarSign, Users, CalendarDays, BedDouble, Eye } from "lucide-react";

export default function HotelDashboard() {
  const user = useSelector((state) => state.auth.user);
  const perms = useSelector((state) => state.auth.user?.permissions || []);
  const has = (permission) => perms.includes(permission);
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const { data: usersData } = useGetUsersQuery(undefined, {
    skip: !has("users:view"),
  });
  const { data: roomsData } = useGetRoomsQuery(undefined, {
    skip: !has("rooms:view"),
  });
  const { data: bookingsData } = useGetBookingsQuery(undefined, {
    skip: !has("bookings:view"),
  });
  const { data: financeData } = useGetFinanceQuery(undefined, {
    skip: !has("finance:view"),
  });

  const team = toArr(usersData);
  const rooms = toArr(roomsData);
  const bookings = toArr(bookingsData);
  const finance = toArr(financeData);

  const revenueRows = finance.filter((item) => item.type === "revenue");
  const expenseRows = finance.filter((item) => item.type === "expense");

  const totalRevenue = revenueRows.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );

  const availableRooms = rooms.filter(
    (item) => item.status === "available" || !item.status,
  ).length;

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
  const roomsByMonth = buildMonthlySeries(rooms, ["createdAt"], null, lang);

  const profitByMonth = revenueByMonth.map((monthPoint, index) => ({
    month: monthPoint.month,
    value: Math.max(0, monthPoint.value - (expensesByMonth[index]?.value || 0)),
  }));

  const revenueTrend = calcTrend(revenueByMonth);
  const bookingsTrend = calcTrend(bookingsByMonth);
  const teamTrend = calcTrend(teamByMonth);
  const roomsTrend = calcTrend(roomsByMonth);

  const donutData = [
    {
      name: t("dashboardSegmentConfirmed"),
      value: bookings.filter((item) => item.status === "confirmed").length,
    },
    {
      name: t("dashboardSegmentPending"),
      value: bookings.filter((item) => item.status === "pending").length,
    },
    {
      name: t("dashboardSegmentCheckedIn"),
      value: bookings.filter((item) => item.status === "checked_in").length,
    },
    {
      name: t("dashboardSegmentCancelled"),
      value: bookings.filter((item) => item.status === "cancelled").length,
    },
  ].filter((item) => item.value > 0);

  const currentMonth = new Date().getMonth();
  const occupancyRate =
    rooms.length > 0
      ? Math.round(((rooms.length - availableRooms) / rooms.length) * 100)
      : 0;

  const goals = [
    {
      label: t("dashboardGoalRevenue"),
      current: Math.round(revenueByMonth[currentMonth]?.value || 0),
      target: 50000,
      color: "#f97316",
    },
    {
      label: t("dashboardGoalBookings"),
      current: bookingsByMonth[currentMonth]?.value || 0,
      target: 100,
      color: "#14b8a6",
    },
    {
      label: t("dashboardGoalOccupancyRate"),
      current: occupancyRate,
      target: 100,
      color: "#3b82f6",
      unit: "%",
    },
  ];

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {t("dashboard")}
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            {t("dashboardWelcomeLine")} {user?.name}.{" "}
            {t("dashboardBusinessOverview")}
          </p>
        </div>
        <button
          onClick={() => navigate("/hotel/details/view")}
          className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold flex-shrink-0"
          style={{
            backgroundColor: "var(--sidebar-active-text)",
            color: "#fff",
          }}
        >
          <Eye size={15} />
          Preview Hotel
        </button>
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
          title={t("dashboardCardAvailableRooms")}
          value={availableRooms}
          trend={roomsTrend.trend}
          trendPositive={roomsTrend.positive}
          sparkData={takeLastMonths(roomsByMonth, 7)}
          color="#f59e0b"
          icon={BedDouble}
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
