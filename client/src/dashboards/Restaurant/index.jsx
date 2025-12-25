import PermissionWrapper from "../../components/PermissionWrapper";
import DataTable from "../../components/DataTable";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useGetBookingsQuery,
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
  useGetFinanceQuery,
  useGetReportsQuery,
} from "../../store/services/api";

export default function RestaurantDashboard() {
  // Users
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery();
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  // Using "rooms" for tables in restaurant context
  const { data: tablesData, isLoading: tablesLoading } = useGetRoomsQuery();
  const [createTable] = useCreateRoomMutation();
  const [updateTable] = useUpdateRoomMutation();
  const [deleteTable] = useDeleteRoomMutation();

  const { data: bookingsData, isLoading: bookingsLoading } =
    useGetBookingsQuery();
  const [createBooking] = useCreateBookingMutation();
  const [updateBooking] = useUpdateBookingMutation();
  const [deleteBooking] = useDeleteBookingMutation();

  const { data: financeData, isLoading: financeLoading } = useGetFinanceQuery();
  const { data: reportsData, isLoading: reportsLoading } = useGetReportsQuery();

  const toArr = (d) => (Array.isArray(d) ? d : d?.items || []);

  // Filter only restaurant users
  const restaurantUsers = toArr(usersData).filter(
    (user) => user.role === "restaurant"
  );

  const userColumns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
  ];

  const tableColumns = [
    { key: "number", label: "Table #" },
    { key: "capacity", label: "Seats" },
    { key: "status", label: "Status" },
  ];

  const reservationColumns = [
    { key: "guestName", label: "Guest" },
    { key: "checkIn", label: "Date/Time" },
    { key: "partySize", label: "Party Size" },
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
        <h2 style={{ fontWeight: 600 }}>Restaurant Dashboard</h2>
        <p style={{ color: "#9ca3af" }}>
          Manage tables and reservations for your restaurant.
        </p>
      </div>

      <PermissionWrapper permission="users:view">
        <div className="card">
          <h2 style={{ marginBottom: 12, fontWeight: 600 }}>
            Restaurant Users
          </h2>
          {usersLoading ? (
            <div>Loading...</div>
          ) : (
            <DataTable
              columns={userColumns}
              data={restaurantUsers}
              editable
              onSave={(row) =>
                row._id
                  ? updateUser(row)
                  : createUser({ ...row, role: "restaurant" })
              }
              onDelete={(id) => deleteUser(id)}
              exportFilename="restaurant_users.csv"
            />
          )}
        </div>
      </PermissionWrapper>

      <PermissionWrapper permission="rooms:view">
        <div className="card">
          <h2 style={{ marginBottom: 12, fontWeight: 600 }}>Tables</h2>
          {tablesLoading ? (
            <div>Loading...</div>
          ) : (
            <DataTable
              columns={tableColumns}
              data={toArr(tablesData)}
              editable
              onSave={(row) => (row._id ? updateTable(row) : createTable(row))}
              onDelete={(id) => deleteTable(id)}
              exportFilename="tables.csv"
            />
          )}
        </div>
      </PermissionWrapper>

      <PermissionWrapper permission="bookings:view">
        <div className="card">
          <h2 style={{ marginBottom: 12, fontWeight: 600 }}>Reservations</h2>
          {bookingsLoading ? (
            <div>Loading...</div>
          ) : (
            <DataTable
              columns={reservationColumns}
              data={toArr(bookingsData)}
              editable
              onSave={(row) =>
                row._id ? updateBooking(row) : createBooking(row)
              }
              onDelete={(id) => deleteBooking(id)}
              exportFilename="reservations.csv"
            />
          )}
        </div>
      </PermissionWrapper>

      <PermissionWrapper permission="finance:view">
        <div className="card">
          <h2 style={{ marginBottom: 12, fontWeight: 600 }}>Finance (P&L)</h2>
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
