import PermissionWrapper from "../../components/PermissionWrapper";
import DataTable from "../../components/DataTable";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetHotelsQuery,
  useCreateHotelMutation,
  useUpdateHotelMutation,
  useDeleteHotelMutation,
  useGetRestaurantsQuery,
  useCreateRestaurantMutation,
  useUpdateRestaurantMutation,
  useDeleteRestaurantMutation,
  useGetActivitiesQuery,
  useCreateActivityMutation,
  useUpdateActivityMutation,
  useDeleteActivityMutation,
  useGetBookingsQuery,
  useGetFinanceQuery,
  useGetReportsQuery,
} from "../../store/services/api";

export default function AdminDashboard() {
  // Users
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery();
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const { data: hotelsData, isLoading: hotelsLoading } = useGetHotelsQuery();
  const [createHotel] = useCreateHotelMutation();
  const [updateHotel] = useUpdateHotelMutation();
  const [deleteHotel] = useDeleteHotelMutation();

  const { data: restaurantsData, isLoading: restaurantsLoading } =
    useGetRestaurantsQuery();
  const [createRestaurant] = useCreateRestaurantMutation();
  const [updateRestaurant] = useUpdateRestaurantMutation();
  const [deleteRestaurant] = useDeleteRestaurantMutation();

  const { data: activitiesData, isLoading: activitiesLoading } =
    useGetActivitiesQuery();
  const [createActivity] = useCreateActivityMutation();
  const [updateActivity] = useUpdateActivityMutation();
  const [deleteActivity] = useDeleteActivityMutation();

  const { data: bookingsData, isLoading: bookingsLoading } =
    useGetBookingsQuery();
  const { data: financeData, isLoading: financeLoading } = useGetFinanceQuery();
  const { data: reportsData, isLoading: reportsLoading } = useGetReportsQuery();

  const toArr = (d) => (Array.isArray(d) ? d : d?.items || []);

  // Filter only admin users
  const adminUsers = toArr(usersData).filter((user) => user.role === "admin");

  const userColumns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
  ];

  const hotelColumns = [
    { key: "name", label: "Name" },
    { key: "location", label: "Location" },
    { key: "stars", label: "Stars" },
  ];

  const restaurantColumns = [
    { key: "name", label: "Name" },
    { key: "location", label: "Location" },
    { key: "capacity", label: "Capacity" },
  ];

  const activityColumns = [
    { key: "name", label: "Name" },
    { key: "type", label: "Type" },
    { key: "price", label: "Price" },
  ];

  const bookingColumns = [
    { key: "guestName", label: "Guest" },
    { key: "checkIn", label: "Check-in" },
    { key: "checkOut", label: "Check-out" },
    { key: "status", label: "Status" },
  ];

  const financeColumns = [
    { key: "date", label: "Date" },
    { key: "revenue", label: "Revenue" },
    { key: "expenses", label: "Expenses" },
  ];

  const reportColumns = [
    { key: "title", label: "Report" },
    { key: "generatedAt", label: "Generated" },
  ];

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 style={{ fontWeight: 600 }}>Admin Company Dashboard</h2>
        <p style={{ color: "#9ca3af" }}>
          Manage hotels, restaurants, and activities for your company.
        </p>
      </div>

      <PermissionWrapper permission="users:view">
        <div className="card">
          <h2 style={{ marginBottom: 12, fontWeight: 600 }}>Admin Users</h2>
          {usersLoading ? (
            <div>Loading...</div>
          ) : (
            <DataTable
              columns={userColumns}
              data={adminUsers}
              editable
              onSave={(row) =>
                row._id
                  ? updateUser(row)
                  : createUser({ ...row, role: "admin" })
              }
              onDelete={(id) => deleteUser(id)}
              exportFilename="admin_users.csv"
            />
          )}
        </div>
      </PermissionWrapper>

      <PermissionWrapper permission="hotels:view">
        <div className="card">
          <h2 style={{ marginBottom: 12, fontWeight: 600 }}>My Hotels</h2>
          {hotelsLoading ? (
            <div>Loading...</div>
          ) : (
            <DataTable
              columns={hotelColumns}
              data={toArr(hotelsData)}
              editable
              onSave={(row) => (row._id ? updateHotel(row) : createHotel(row))}
              onDelete={(id) => deleteHotel(id)}
              exportFilename="my_hotels.csv"
            />
          )}
        </div>
      </PermissionWrapper>

      <PermissionWrapper permission="restaurants:view">
        <div className="card">
          <h2 style={{ marginBottom: 12, fontWeight: 600 }}>My Restaurants</h2>
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
              exportFilename="my_restaurants.csv"
            />
          )}
        </div>
      </PermissionWrapper>

      <PermissionWrapper permission="activities:view">
        <div className="card">
          <h2 style={{ marginBottom: 12, fontWeight: 600 }}>My Activities</h2>
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
              exportFilename="my_activities.csv"
            />
          )}
        </div>
      </PermissionWrapper>

      <PermissionWrapper permission="bookings:view">
        <div className="card">
          <h2 style={{ marginBottom: 12, fontWeight: 600 }}>Bookings</h2>
          {bookingsLoading ? (
            <div>Loading...</div>
          ) : (
            <DataTable
              columns={bookingColumns}
              data={toArr(bookingsData)}
              exportFilename="bookings.csv"
            />
          )}
        </div>
      </PermissionWrapper>

      <PermissionWrapper permission="finance:view">
        <div className="card">
          <h2 style={{ marginBottom: 12, fontWeight: 600 }}>Finance</h2>
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
          <h2 style={{ marginBottom: 12, fontWeight: 600 }}>Reports</h2>
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
