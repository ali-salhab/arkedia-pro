import DataTable from "../components/DataTable";
import {
  useGetRestaurantsQuery,
  useCreateRestaurantMutation,
  useUpdateRestaurantMutation,
  useDeleteRestaurantMutation,
} from "../store/services/api";

export default function RestaurantsPage() {
  const { data: restaurants = [], isLoading, error } = useGetRestaurantsQuery();
  const [createRestaurant] = useCreateRestaurantMutation();
  const [updateRestaurant] = useUpdateRestaurantMutation();
  const [deleteRestaurant] = useDeleteRestaurantMutation();

  const restaurantColumns = [
    { key: "name", label: "Name" },
    { key: "cuisine", label: "Cuisine" },
    { key: "address", label: "Address" },
    { key: "city", label: "City" },
    { key: "country", label: "Country" },
    {
      key: "createdAt",
      label: "Created",
      editable: false,
      render: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
    },
  ];

  const handleSave = async (id, data) => {
    if (id) {
      await updateRestaurant({ id, ...data });
    } else {
      await createRestaurant(data);
    }
  };

  const handleDelete = async (id) => {
    await deleteRestaurant(id);
  };

  if (isLoading)
    return <div className="p-6 text-center">Loading restaurants...</div>;
  if (error)
    return (
      <div className="p-6 text-center text-red-500">
        Error loading restaurants
      </div>
    );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Restaurants Management</h1>
      <DataTable
        columns={restaurantColumns}
        data={restaurants}
        editable
        onSave={handleSave}
        onDelete={handleDelete}
        exportFilename="restaurants"
      />
    </div>
  );
}
