import PermissionWrapper from "../../components/PermissionWrapper";
import DataTable from "../../components/DataTable";
import DashboardControlPanelDetails from "../../components/DashboardControlPanelDetails";
import { SkeletonTable } from "../../components/SkeletonLoader";
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

export default function HotelDashboard() {
  const { t } = useLanguage();
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery();
  const { data: roomsData, isLoading: roomsLoading } = useGetRoomsQuery();
  const { data: bookingsData, isLoading: bookingsLoading } =
    useGetBookingsQuery();
  const { data: financeData, isLoading: financeLoading } = useGetFinanceQuery();
  const { data: reportsData, isLoading: reportsLoading } = useGetReportsQuery();

  const hotelTeam = toArray(usersData);
  const rooms = toArray(roomsData);
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

  const roomColumns = [
    { key: "number", label: t("roomTableNum") },
    { key: "type", label: t("type") },
    { key: "price", label: t("price") },
    { key: "status", label: t("status") },
  ];

  const bookingColumns = [
    { key: "guestName", label: t("guest") },
    { key: "checkIn", label: t("checkIn") },
    { key: "checkOut", label: t("checkOut") },
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
        title={t("hotelAccounts")}
        subtitle={t("dashboardReadOnlyNotice")}
        stats={[
          { label: t("users"), value: hotelTeam.length },
          { label: t("roomsTables"), value: rooms.length },
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
              data={hotelTeam}
              exportFilename="hotel_team.csv"
            />
          )}
        </section>
      </PermissionWrapper>

      <PermissionWrapper permission="rooms:view">
        <section className="card">
          <h2 className="section-heading mb-4">{t("roomsTables")}</h2>
          {roomsLoading ? (
            <SkeletonTable rows={3} cols={4} />
          ) : (
            <DataTable
              columns={roomColumns}
              data={rooms}
              exportFilename="rooms.csv"
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
              columns={bookingColumns}
              data={bookings}
              exportFilename="bookings.csv"
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
