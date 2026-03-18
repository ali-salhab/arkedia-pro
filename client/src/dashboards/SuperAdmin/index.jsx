import PermissionWrapper from "../../components/PermissionWrapper";
import DataTable from "../../components/DataTable";
import DashboardControlPanelDetails from "../../components/DashboardControlPanelDetails";
import { useSelector } from "react-redux";
import { useLanguage } from "../../context/LanguageContext";
import {
  useGetUsersQuery,
  useGetRestaurantsQuery,
  useGetHotelsQuery,
  useGetActivitiesQuery,
  useGetBookingsQuery,
  useGetRoomsQuery,
  useGetFinanceQuery,
  useGetReportsQuery,
} from "../../store/services/api";

function toArray(data) {
  return Array.isArray(data) ? data : data?.items || [];
}

export default function SuperAdminDashboard() {
  const { t } = useLanguage();
  const permissions = useSelector((s) => s.auth.user?.permissions || []);
  const hasPermission = (permission) => permissions.includes(permission);

  const canViewUsers = hasPermission("users:view");
  const canViewRestaurants = hasPermission("restaurants:view");
  const canViewHotels = hasPermission("hotels:view");
  const canViewActivities = hasPermission("activities:view");
  const canViewBookings = hasPermission("bookings:view");
  const canViewRooms = hasPermission("rooms:view");
  const canViewFinance = hasPermission("finance:view");
  const canViewReports = hasPermission("reports:view");

  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery(
    undefined,
    { skip: !canViewUsers },
  );
  const { data: restaurantsData, isLoading: restaurantsLoading } =
    useGetRestaurantsQuery(undefined, { skip: !canViewRestaurants });
  const { data: hotelsData, isLoading: hotelsLoading } = useGetHotelsQuery(
    undefined,
    { skip: !canViewHotels },
  );
  const { data: activitiesData, isLoading: activitiesLoading } =
    useGetActivitiesQuery(undefined, { skip: !canViewActivities });
  const { data: bookingsData, isLoading: bookingsLoading } =
    useGetBookingsQuery(undefined, { skip: !canViewBookings });
  const { data: roomsData, isLoading: roomsLoading } = useGetRoomsQuery(
    undefined,
    { skip: !canViewRooms },
  );
  const { data: financeData, isLoading: financeLoading } = useGetFinanceQuery(
    undefined,
    { skip: !canViewFinance },
  );
  const { data: reportsData, isLoading: reportsLoading } = useGetReportsQuery(
    undefined,
    { skip: !canViewReports },
  );

  const users = toArray(usersData);
  const platformTeam = users.filter((u) => u.role === "superadminuser");
  const hotels = toArray(hotelsData);
  const restaurants = toArray(restaurantsData);
  const activities = toArray(activitiesData);
  const bookings = toArray(bookingsData);
  const rooms = toArray(roomsData);
  const finance = toArray(financeData);
  const reports = toArray(reportsData);

  const userColumns = [
    { key: "name", label: t("name") },
    { key: "email", label: t("email") },
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

  const roomColumns = [
    { key: "number", label: t("roomTableNum") },
    { key: "type", label: t("type") },
    { key: "price", label: t("price") },
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
      <PermissionWrapper permission="users:view">
        <section className="card">
          <div className="mb-4">
            <h2 className="section-heading">{`👥 ${t("superAdminUsers")}`}</h2>
            <p className="section-subheading">
              Dashboard control panel is read-only for user management.
            </p>
          </div>
          {usersLoading ? (
            <p className="section-subheading">{t("loading")}</p>
          ) : (
            <DataTable
              columns={userColumns}
              data={platformTeam}
              exportFilename="platform_team.csv"
            />
          )}
        </section>
      </PermissionWrapper>

      <PermissionWrapper permission="hotels:view">
        <section className="card">
          <h2 className="section-heading mb-4">{t("allHotels")}</h2>
          {hotelsLoading ? (
            <p className="section-subheading">{t("loading")}</p>
          ) : (
            <DataTable
              columns={hotelColumns}
              data={hotels}
              exportFilename="all_hotels.csv"
            />
          )}
        </section>
      </PermissionWrapper>

      <PermissionWrapper permission="restaurants:view">
        <section className="card">
          <h2 className="section-heading mb-4">{t("allRestaurants")}</h2>
          {restaurantsLoading ? (
            <p className="section-subheading">{t("loading")}</p>
          ) : (
            <DataTable
              columns={restaurantColumns}
              data={restaurants}
              exportFilename="all_restaurants.csv"
            />
          )}
        </section>
      </PermissionWrapper>

      <PermissionWrapper permission="activities:view">
        <section className="card">
          <h2 className="section-heading mb-4">{t("allActivities")}</h2>
          {activitiesLoading ? (
            <p className="section-subheading">{t("loading")}</p>
          ) : (
            <DataTable
              columns={activityColumns}
              data={activities}
              exportFilename="all_activities.csv"
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

      <PermissionWrapper permission="rooms:view">
        <section className="card">
          <h2 className="section-heading mb-4">{t("roomsTables")}</h2>
          {roomsLoading ? (
            <p className="section-subheading">{t("loading")}</p>
          ) : (
            <DataTable
              columns={roomColumns}
              data={rooms}
              exportFilename="rooms.csv"
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
