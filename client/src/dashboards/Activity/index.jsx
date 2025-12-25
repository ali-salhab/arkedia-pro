import PermissionWrapper from "../../components/PermissionWrapper";
import DataTable from "../../components/DataTable";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetActivitiesQuery,
  useCreateActivityMutation,
  useUpdateActivityMutation,
  useDeleteActivityMutation,
  useGetBookingsQuery,
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
  useGetFinanceQuery,
  useGetReportsQuery,
} from "../../store/services/api";

export default function ActivityDashboard() {
  // Users
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery();
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const { data: activitiesData, isLoading: activitiesLoading } =
    useGetActivitiesQuery();
  const [createActivity] = useCreateActivityMutation();
  const [updateActivity] = useUpdateActivityMutation();
  const [deleteActivity] = useDeleteActivityMutation();

  const { data: bookingsData, isLoading: bookingsLoading } =
    useGetBookingsQuery();
  const [createBooking] = useCreateBookingMutation();
  const [updateBooking] = useUpdateBookingMutation();
  const [deleteBooking] = useDeleteBookingMutation();

  const { data: financeData, isLoading: financeLoading } = useGetFinanceQuery();
  const { data: reportsData, isLoading: reportsLoading } = useGetReportsQuery();

  const toArr = (d) => (Array.isArray(d) ? d : d?.items || []);

  // Filter only activity users
  const activityUsers = toArr(usersData).filter(
    (user) => user.role === "activity"
  );

  const userColumns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
  ];

  const activityColumns = [
    { key: "name", label: "Activity" },
    { key: "type", label: "Type" },
    { key: "duration", label: "Duration" },
    { key: "price", label: "Price" },
  ];

  const bookingColumns = [
    { key: "guestName", label: "Guest" },
    { key: "activityName", label: "Activity" },
    { key: "date", label: "Date" },
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
        <h2 style={{ fontWeight: 600 }}>Activity Dashboard</h2>
        <p style={{ color: "#9ca3af" }}>Manage activities and bookings.</p>
      </div>

      <PermissionWrapper permission="users:view">
        <div className="card">
          <h2 style={{ marginBottom: 12, fontWeight: 600 }}>Activity Users</h2>
          {usersLoading ? (
            <div>Loading...</div>
          ) : (
            <DataTable
              columns={userColumns}
              data={activityUsers}
              editable
              onSave={(row) =>
                row._id
                  ? updateUser(row)
                  : createUser({ ...row, role: "activity" })
              }
              onDelete={(id) => deleteUser(id)}
              exportFilename="activity_users.csv"
            />
          )}
        </div>
      </PermissionWrapper>

      <PermissionWrapper permission="activities:view">
        <div className="card">
          <h2 style={{ marginBottom: 12, fontWeight: 600 }}>Activities</h2>
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
              exportFilename="activities.csv"
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

      <PermissionWrapper permission="finance:view">
        <div className="card">
          <h2 style={{ marginBottom: 12, fontWeight: 600 }}>Revenue</h2>
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
