import DataTable from "../components/DataTable";
import {
  useGetActivitiesQuery,
  useCreateActivityMutation,
  useUpdateActivityMutation,
  useDeleteActivityMutation,
} from "../store/services/api";

export default function ActivitiesPage() {
  const { data: activities = [], isLoading, error } = useGetActivitiesQuery();
  const [createActivity] = useCreateActivityMutation();
  const [updateActivity] = useUpdateActivityMutation();
  const [deleteActivity] = useDeleteActivityMutation();

  const activityColumns = [
    { key: "name", label: "Name" },
    { key: "type", label: "Type" },
    { key: "location", label: "Location" },
    { key: "price", label: "Price", type: "number" },
    { key: "duration", label: "Duration" },
    {
      key: "createdAt",
      label: "Created",
      editable: false,
      render: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
    },
  ];

  const handleSave = async (id, data) => {
    if (id) {
      await updateActivity({ id, ...data });
    } else {
      await createActivity(data);
    }
  };

  const handleDelete = async (id) => {
    await deleteActivity(id);
  };

  if (isLoading)
    return <div className="p-6 text-center">Loading activities...</div>;
  if (error)
    return (
      <div className="p-6 text-center text-red-500">
        Error loading activities
      </div>
    );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Activities Management</h1>
      <DataTable
        columns={activityColumns}
        data={activities}
        editable
        onSave={handleSave}
        onDelete={handleDelete}
        exportFilename="activities"
      />
    </div>
  );
}
