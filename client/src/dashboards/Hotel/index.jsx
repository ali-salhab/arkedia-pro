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

export default function HotelDashboard() {
  // Users
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery();
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const { data: roomsData, isLoading: roomsLoading } = useGetRoomsQuery();
  const [createRoom] = useCreateRoomMutation();
  const [updateRoom] = useUpdateRoomMutation();
  const [deleteRoom] = useDeleteRoomMutation();

  const { data: bookingsData, isLoading: bookingsLoading } =
    useGetBookingsQuery();
  const [createBooking] = useCreateBookingMutation();
  const [updateBooking] = useUpdateBookingMutation();
  const [deleteBooking] = useDeleteBookingMutation();

  const { data: financeData, isLoading: financeLoading } = useGetFinanceQuery();
  const { data: reportsData, isLoading: reportsLoading } = useGetReportsQuery();

  const toArr = (d) => (Array.isArray(d) ? d : d?.items || []);

  // Filter only hotel users
  const hotelUsers = toArr(usersData).filter((user) => user.role === "hotel");

  const userColumns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
  ];

  const roomColumns = [
    { key: "number", label: "Room #" },
    { key: "type", label: "Type" },
    { key: "price", label: "Price" },
    { key: "status", label: "Status" },
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
        <h2 style={{ fontWeight: 600 }}>Hotel Dashboard</h2>
        <p style={{ color: "#9ca3af" }}>
          Manage rooms and bookings for your hotel.
        </p>
      </div>

      <PermissionWrapper permission="users:view">
        <div className="card">
          <h2 style={{ marginBottom: 12, fontWeight: 600 }}>Hotel Users</h2>
          {usersLoading ? (
            <div>Loading...</div>
          ) : (
            <DataTable
              columns={userColumns}
              data={hotelUsers}
              editable
              onSave={(row) =>
                row._id
                  ? updateUser(row)
                  : createUser({ ...row, role: "hotel" })
              }
              onDelete={(id) => deleteUser(id)}
              exportFilename="hotel_users.csv"
            />
          )}
        </div>
      </PermissionWrapper>

      <PermissionWrapper permission="rooms:view">
        <div className="card">
          <h2 style={{ marginBottom: 12, fontWeight: 600 }}>Rooms</h2>
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
