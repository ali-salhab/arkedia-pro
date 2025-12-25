import DataTable from "../components/DataTable";
import {
  useGetRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} from "../store/services/api";

export default function RoomsPage() {
  const { data: rooms = [], isLoading, error } = useGetRoomsQuery();
  const [createRoom] = useCreateRoomMutation();
  const [updateRoom] = useUpdateRoomMutation();
  const [deleteRoom] = useDeleteRoomMutation();

  const roomColumns = [
    { key: "roomNumber", label: "Room/Table #" },
    { key: "type", label: "Type" },
    { key: "capacity", label: "Capacity", type: "number" },
    { key: "price", label: "Price", type: "number" },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ["available", "occupied", "maintenance"],
    },
    {
      key: "createdAt",
      label: "Created",
      editable: false,
      render: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
    },
  ];

  const handleSave = async (id, data) => {
    if (id) {
      await updateRoom({ id, ...data });
    } else {
      await createRoom(data);
    }
  };

  const handleDelete = async (id) => {
    await deleteRoom(id);
  };

  if (isLoading) return <div className="p-6 text-center">Loading rooms...</div>;
  if (error)
    return (
      <div className="p-6 text-center text-red-500">Error loading rooms</div>
    );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Rooms / Tables Management</h1>
      <DataTable
        columns={roomColumns}
        data={rooms}
        editable
        onSave={handleSave}
        onDelete={handleDelete}
        exportFilename="rooms"
      />
    </div>
  );
}
