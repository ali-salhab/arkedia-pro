import PermissionWrapper from "../../components/PermissionWrapper";
import DataTable from "../../components/DataTable";
import { useLanguage } from "../../context/LanguageContext";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetRestaurantsQuery,
  useCreateRestaurantMutation,
  useUpdateRestaurantMutation,
  useDeleteRestaurantMutation,
  useGetHotelsQuery,
  useCreateHotelMutation,
  useUpdateHotelMutation,
  useDeleteHotelMutation,
  useGetActivitiesQuery,
  useCreateActivityMutation,
  useUpdateActivityMutation,
  useDeleteActivityMutation,
  useGetBookingsQuery,
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
  useGetRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useGetFinanceQuery,
  useGetReportsQuery,
} from "../../store/services/api";

export default function SuperAdminDashboard() {
  const { t } = useLanguage();
  // Users
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery();
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  // Restaurants
  const { data: restaurantsData, isLoading: restaurantsLoading } =
    useGetRestaurantsQuery();
  const [createRestaurant] = useCreateRestaurantMutation();
  const [updateRestaurant] = useUpdateRestaurantMutation();
  const [deleteRestaurant] = useDeleteRestaurantMutation();

  // Hotels
  const { data: hotelsData, isLoading: hotelsLoading } = useGetHotelsQuery();
  const [createHotel] = useCreateHotelMutation();
  const [updateHotel] = useUpdateHotelMutation();
  const [deleteHotel] = useDeleteHotelMutation();

  // Activities
  const { data: activitiesData, isLoading: activitiesLoading } =
    useGetActivitiesQuery();
  const [createActivity] = useCreateActivityMutation();
  const [updateActivity] = useUpdateActivityMutation();
  const [deleteActivity] = useDeleteActivityMutation();

  // Bookings
  const { data: bookingsData, isLoading: bookingsLoading } =
    useGetBookingsQuery();
  const [createBooking] = useCreateBookingMutation();
  const [updateBooking] = useUpdateBookingMutation();
  const [deleteBooking] = useDeleteBookingMutation();

  // Rooms
  const { data: roomsData, isLoading: roomsLoading } = useGetRoomsQuery();
  const [createRoom] = useCreateRoomMutation();
  const [updateRoom] = useUpdateRoomMutation();
  const [deleteRoom] = useDeleteRoomMutation();

  // Finance & Reports (read-only)
  const { data: financeData, isLoading: financeLoading } = useGetFinanceQuery();
  const { data: reportsData, isLoading: reportsLoading } = useGetReportsQuery();

  const toArr = (d) => (Array.isArray(d) ? d : d?.items || []);

  // Filter only super_admin users
  const superAdminUsers = toArr(usersData).filter(
    (user) => user.role === "super_admin",
  );

  const userColumns = [
    { key: "name", label: t("name") },
    { key: "email", label: t("email") },
    { key: "role", label: t("role") },
  ];

  const restaurantColumns = [
    { key: "name", label: t("name") },
    { key: "location", label: t("location") },
    { key: "capacity", label: t("capacity") },
  ];

  const hotelColumns = [
    { key: "name", label: t("name") },
    { key: "location", label: t("location") },
    { key: "stars", label: t("stars") },
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
    { key: "date", label: t("date") },
    { key: "revenue", label: t("revenue") },
    { key: "expenses", label: t("expenses") },
  ];

  const reportColumns = [
    { key: "title", label: t("reportTitle") },
    { key: "generatedAt", label: t("generatedAt") },
  ];

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 style={{ fontWeight: 600 }}>{t("superAdminOverview")}</h2>
        <p style={{ color: "#9ca3af" }}>{t("managePlatformResources")}</p>
      </div>

      <PermissionWrapper permission="users:view">
        <div className="card">
          <h2 style={{ marginBottom: 12, fontWeight: 600 }}>
            {t("superAdminUsers")}
          </h2>
          {usersLoading ? (
            <div>Loading...</div>
          ) : (
            <DataTable
              columns={userColumns}
              data={superAdminUsers}
              editable
              onSave={(row) =>
                row._id
                  ? updateUser(row)
                  : createUser({ ...row, role: "super_admin" })
              }
              onDelete={(id) => deleteUser(id)}
              exportFilename="super_admin_users.csv"
            />
          )}
        </div>
      </PermissionWrapper>

      <PermissionWrapper permission="hotels:view">
        <div className="card">
          <h2 style={{ marginBottom: 12, fontWeight: 600 }}>
            {t("allHotels")}
          </h2>
          {hotelsLoading ? (
            <div>Loading...</div>
          ) : (
            <DataTable
              columns={hotelColumns}
              data={toArr(hotelsData)}
              editable
              onSave={(row) => (row._id ? updateHotel(row) : createHotel(row))}
              onDelete={(id) => deleteHotel(id)}
              exportFilename="all_hotels.csv"
            />
          )}
        </div>
      </PermissionWrapper>

      <PermissionWrapper permission="restaurants:view">
        <div className="card">
          <h2 style={{ marginBottom: 12, fontWeight: 600 }}>
            {t("allRestaurants")}
          </h2>
          {restaurantsLoading ? (
            <div>Loading...</div>
          ) : (
            <DataTable
              columns={restaurantColumns}
              data={toArr(restaurantsData)}
              editable
              onSave={(row) =>
                row._id ? updateRestaurant(row) : createRestaurant(row)
              }
              onDelete={(id) => deleteRestaurant(id)}
              exportFilename="all_restaurants.csv"
            />
          )}
        </div>
      </PermissionWrapper>

      <PermissionWrapper permission="activities:view">
        <div className="card">
          <h2 style={{ marginBottom: 12, fontWeight: 600 }}>
            {t("allActivities")}
          </h2>
          {activitiesLoading ? (
            <div>Loading...</div>
          ) : (
            <DataTable
              columns={activityColumns}
              data={toArr(activitiesData)}
              editable
              onSave={(row) =>
                row._id ? updateActivity(row) : createActivity(row)
              }
              onDelete={(id) => deleteActivity(id)}
              exportFilename="all_activities.csv"
            />
          )}
        </div>
      </PermissionWrapper>

      <PermissionWrapper permission="bookings:view">
        <div className="card">
          <h2 style={{ marginBottom: 12, fontWeight: 600 }}>{t("bookings")}</h2>
          {bookingsLoading ? (
            <div>Loading...</div>
          ) : (
            <DataTable
              columns={bookingColumns}
              data={toArr(bookingsData)}
              editable
              onSave={(row) =>
                row._id ? updateBooking(row) : createBooking(row)
              }
              onDelete={(id) => deleteBooking(id)}
              exportFilename="bookings.csv"
            />
          )}
        </div>
      </PermissionWrapper>

      <PermissionWrapper permission="rooms:view">
        <div className="card">
          <h2 style={{ marginBottom: 12, fontWeight: 600 }}>
            {t("roomsTables")}
          </h2>
          {roomsLoading ? (
            <div>Loading...</div>
          ) : (
            <DataTable
              columns={roomColumns}
              data={toArr(roomsData)}
              editable
              onSave={(row) => (row._id ? updateRoom(row) : createRoom(row))}
              onDelete={(id) => deleteRoom(id)}
              exportFilename="rooms.csv"
            />
          )}
        </div>
      </PermissionWrapper>

      <PermissionWrapper permission="finance:view">
        <div className="card">
          <h2 style={{ marginBottom: 12, fontWeight: 600 }}>{t("finance")}</h2>
          {financeLoading ? (
            <div>Loading...</div>
          ) : (
            <DataTable
              columns={financeColumns}
              data={toArr(financeData)}
              exportFilename="finance.csv"
            />
          )}
        </div>
      </PermissionWrapper>

      <PermissionWrapper permission="reports:view">
        <div className="card">
          <h2 style={{ marginBottom: 12, fontWeight: 600 }}>{t("reports")}</h2>
          {reportsLoading ? (
            <div>Loading...</div>
          ) : (
            <DataTable
              columns={reportColumns}
              data={toArr(reportsData)}
              exportFilename="reports.csv"
            />
          )}
        </div>
      </PermissionWrapper>
    </div>
  );
}
