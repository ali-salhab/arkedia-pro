import DataTable from "../components/DataTable";
import {
  useGetBookingsQuery,
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
} from "../store/services/api";

export default function BookingsPage() {
  const { data: bookings = [], isLoading, error } = useGetBookingsQuery();
  const [createBooking] = useCreateBookingMutation();
  const [updateBooking] = useUpdateBookingMutation();
  const [deleteBooking] = useDeleteBookingMutation();

  const bookingColumns = [
    { key: "guestName", label: "Guest Name" },
    { key: "guestEmail", label: "Email" },
    {
      key: "bookingType",
      label: "Type",
      type: "select",
      options: ["hotel", "restaurant", "activity"],
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ["pending", "confirmed", "cancelled", "completed"],
    },
    {
      key: "checkIn",
      label: "Check In",
      type: "date",
      render: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
    },
    {
      key: "checkOut",
      label: "Check Out",
      type: "date",
      render: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
    },
    { key: "totalPrice", label: "Total", type: "number" },
    {
      key: "createdAt",
      label: "Created",
      editable: false,
      render: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
    },
  ];

  const handleSave = async (id, data) => {
    if (id) {
      await updateBooking({ id, ...data });
    } else {
      await createBooking(data);
    }
  };

  const handleDelete = async (id) => {
    await deleteBooking(id);
  };

  if (isLoading)
    return <div className="p-6 text-center">Loading bookings...</div>;
  if (error)
    return (
      <div className="p-6 text-center text-red-500">Error loading bookings</div>
    );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Bookings Management</h1>
      <DataTable
        columns={bookingColumns}
        data={bookings}
        editable
        onSave={handleSave}
        onDelete={handleDelete}
        exportFilename="bookings"
      />
    </div>
  );
}
