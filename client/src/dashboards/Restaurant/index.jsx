import PermissionWrapper from "../../components/PermissionWrapper";
import DataTable from "../../components/DataTable";
import DashboardControlPanelDetails from "../../components/DashboardControlPanelDetails";
import { SkeletonTable } from "../../components/SkeletonLoader";
import { useSelector } from "react-redux";
import { useLanguage } from "../../context/LanguageContext";
import {
  useGetUsersQuery,
  useGetRoomsQuery,
  useGetBookingsQuery,
  useGetFinanceQuery,
  useGetReportsQuery,
} from "../../store/services/api";

function toArray(data) {
  return Array.isArray(data) ? data : data?.items || [];
}

export default function RestaurantDashboard() {
  const { t } = useLanguage();
  const permissions = useSelector((s) => s.auth.user?.permissions || []);
  const hasPermission = (permission) => permissions.includes(permission);

  const canViewUsers = hasPermission("users:view");
  const canViewRooms = hasPermission("rooms:view");
  const canViewBookings = hasPermission("bookings:view");
  const canViewFinance = hasPermission("finance:view");
  const canViewReports = hasPermission("reports:view");

  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery(
    undefined,
    { skip: !canViewUsers },
  );
  const { data: tablesData, isLoading: tablesLoading } = useGetRoomsQuery(
    undefined,
    { skip: !canViewRooms },
  );
  const { data: bookingsData, isLoading: bookingsLoading } =
    useGetBookingsQuery(undefined, { skip: !canViewBookings });
  const { data: financeData, isLoading: financeLoading } = useGetFinanceQuery(
    undefined,
    { skip: !canViewFinance },
  );
  const { data: reportsData, isLoading: reportsLoading } = useGetReportsQuery(
    undefined,
    { skip: !canViewReports },
  );

  const restaurantTeam = toArray(usersData);
  const tables = toArray(tablesData);
  const bookings = toArray(bookingsData);
  const finance = toArray(financeData);
  const reports = toArray(reportsData);

  const userColumns = [
    { key: "name", label: t("name") },
    { key: "email", label: t("email") },
    { key: "role", label: t("role") },
    {
      key: "permissions",
      label: t("permissions"),
      render: (_value, row) =>
        `${(row.permissions || []).length} ${t("permissionsSelected")}`,
    },
  ];

  const tableColumns = [
    { key: "number", label: t("roomTableNum") },
    { key: "capacity", label: t("capacity") },
    { key: "status", label: t("status") },
  ];

  const reservationColumns = [
    { key: "guestName", label: t("guest") },
    { key: "checkIn", label: t("checkIn") },
    { key: "partySize", label: t("capacity") },
    { key: "status", label: t("status") },
  ];

  const financeColumns = [
    {
      key: "type",
      label: t("type"),
      render: (value) => (value === "expense" ? t("expenses") : t("revenue")),
    },
    { key: "description", label: t("description") },
    {
      key: "amount",
      label: t("amount"),
      render: (value, row) =>
        `${row.currency || "USD"} ${Number(value || 0).toFixed(2)}`,
    },
    { key: "date", label: t("date") },
  ];

  const reportColumns = [
    { key: "title", label: t("reportTitle") },
    { key: "generatedAt", label: t("generatedAt") },
  ];

  return (
    <div className="space-y-6">
      <DashboardControlPanelDetails
        title={t("restaurantsManagement")}
        subtitle={t("dashboardReadOnlyNotice")}
        stats={[
          { label: t("users"), value: restaurantTeam.length },
          { label: t("roomsTables"), value: tables.length },
          { label: t("bookings"), value: bookings.length },
          { label: t("reports"), value: reports.length },
        ]}
      />

      <PermissionWrapper permission="users:view">
        <section className="card">
          <h2 className="section-heading mb-4">👥 {t("users")}</h2>
          {usersLoading ? (
            <SkeletonTable rows={3} cols={4} />
          ) : (
            <DataTable
              columns={userColumns}
              data={restaurantTeam}
              exportFilename="restaurant_team.csv"
            />
          )}
        </section>
      </PermissionWrapper>

      <PermissionWrapper permission="rooms:view">
        <section className="card">
          <h2 className="section-heading mb-4">{t("roomsTables")}</h2>
          {tablesLoading ? (
            <SkeletonTable rows={3} cols={3} />
          ) : (
            <DataTable
              columns={tableColumns}
              data={tables}
              exportFilename="tables.csv"
            />
          )}
        </section>
      </PermissionWrapper>

      <PermissionWrapper permission="bookings:view">
        <section className="card">
          <h2 className="section-heading mb-4">{t("bookings")}</h2>
          {bookingsLoading ? (
            <SkeletonTable rows={3} cols={4} />
          ) : (
            <DataTable
              columns={reservationColumns}
              data={bookings}
              exportFilename="reservations.csv"
            />
          )}
        </section>
      </PermissionWrapper>

      <PermissionWrapper permission="finance:view">
        <section className="card">
          <h2 className="section-heading mb-4">{t("finance")}</h2>
          {financeLoading ? (
            <SkeletonTable rows={3} cols={4} />
          ) : (
            <DataTable
              columns={financeColumns}
              data={finance}
              exportFilename="finance.csv"
            />
          )}
        </section>
      </PermissionWrapper>

      <PermissionWrapper permission="reports:view">
        <section className="card">
          <h2 className="section-heading mb-4">{t("reports")}</h2>
          {reportsLoading ? (
            <SkeletonTable rows={3} cols={4} />
          ) : (
            <DataTable
              columns={reportColumns}
              data={reports}
              exportFilename="reports.csv"
            />
          )}
        </section>
      </PermissionWrapper>
    </div>
  );
}
