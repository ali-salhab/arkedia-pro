import PermissionWrapper from "../../components/PermissionWrapper";
import DataTable from "../../components/DataTable";
import DashboardControlPanelDetails from "../../components/DashboardControlPanelDetails";
import { useSelector } from "react-redux";
import { useLanguage } from "../../context/LanguageContext";
import {
  useGetUsersQuery,
  useGetHotelsQuery,
  useGetRestaurantsQuery,
  useGetActivitiesQuery,
  useGetBookingsQuery,
  useGetFinanceQuery,
  useGetReportsQuery,
} from "../../store/services/api";

function toArray(data) {
  return Array.isArray(data) ? data : data?.items || [];
}

export default function AdminDashboard() {
  const { t } = useLanguage();
  const permissions = useSelector((s) => s.auth.user?.permissions || []);
  const hasPermission = (permission) => permissions.includes(permission);

  const canViewUsers = hasPermission("users:view");
  const canViewHotels = hasPermission("hotels:view");
  const canViewRestaurants = hasPermission("restaurants:view");
  const canViewActivities = hasPermission("activities:view");
  const canViewBookings = hasPermission("bookings:view");
  const canViewFinance = hasPermission("finance:view");
  const canViewReports = hasPermission("reports:view");

  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery(
    {
      role: "adminuser",
    },
    { skip: !canViewUsers },
  );
  const { data: hotelsData, isLoading: hotelsLoading } = useGetHotelsQuery(
    undefined,
    { skip: !canViewHotels },
  );
  const { data: restaurantsData, isLoading: restaurantsLoading } =
    useGetRestaurantsQuery(undefined, { skip: !canViewRestaurants });
  const { data: activitiesData, isLoading: activitiesLoading } =
    useGetActivitiesQuery(undefined, { skip: !canViewActivities });
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

  const adminTeam = toArray(usersData).filter((u) => u.role === "adminuser");
  const hotels = toArray(hotelsData);
  const restaurants = toArray(restaurantsData);
  const activities = toArray(activitiesData);
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
        `${(row.permissions || []).length} ${t("permissions")}`,
    },
  ];

  const hotelColumns = [
    { key: "name", label: t("name") },
    { key: "location", label: t("location") },
    { key: "stars", label: t("stars") },
  ];

  const restaurantColumns = [
    { key: "name", label: t("name") },
    { key: "location", label: t("location") },
    { key: "capacity", label: t("capacity") },
  ];

  const activityColumns = [
    { key: "name", label: t("name") },
    { key: "type", label: t("type") },
    { key: "price", label: t("price") },
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
        title={t("adminDashboardTitle")}
        subtitle={t("adminDashboardSubtitle")}
        stats={[
          { label: t("users"), value: adminTeam.length },
          { label: t("myHotels"), value: hotels.length },
          { label: t("myRestaurants"), value: restaurants.length },
          { label: t("bookings"), value: bookings.length },
        ]}
      />

      <PermissionWrapper permission="users:view">
        <section className="card">
          <h2 className="section-heading mb-4">👥 {t("users")}</h2>
          {usersLoading ? (
            <p className="section-subheading">{t("loading")}</p>
          ) : (
            <DataTable
              columns={userColumns}
              data={adminTeam}
              exportFilename="admin_team.csv"
            />
          )}
        </section>
      </PermissionWrapper>

      <PermissionWrapper permission="hotels:view">
        <section className="card">
          <h2 className="section-heading mb-4">{t("myHotels")}</h2>
          {hotelsLoading ? (
            <p className="section-subheading">{t("loading")}</p>
          ) : (
            <DataTable
              columns={hotelColumns}
              data={hotels}
              exportFilename="my_hotels.csv"
            />
          )}
        </section>
      </PermissionWrapper>

      <PermissionWrapper permission="restaurants:view">
        <section className="card">
          <h2 className="section-heading mb-4">{t("myRestaurants")}</h2>
          {restaurantsLoading ? (
            <p className="section-subheading">{t("loading")}</p>
          ) : (
            <DataTable
              columns={restaurantColumns}
              data={restaurants}
              exportFilename="my_restaurants.csv"
            />
          )}
        </section>
      </PermissionWrapper>

      <PermissionWrapper permission="activities:view">
        <section className="card">
          <h2 className="section-heading mb-4">{t("myActivities")}</h2>
          {activitiesLoading ? (
            <p className="section-subheading">{t("loading")}</p>
          ) : (
            <DataTable
              columns={activityColumns}
              data={activities}
              exportFilename="my_activities.csv"
            />
          )}
        </section>
      </PermissionWrapper>

      <PermissionWrapper permission="bookings:view">
        <section className="card">
          <h2 className="section-heading mb-4">{t("bookings")}</h2>
          {bookingsLoading ? (
            <p className="section-subheading">{t("loading")}</p>
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
            <p className="section-subheading">{t("loading")}</p>
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
            <p className="section-subheading">{t("loading")}</p>
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
