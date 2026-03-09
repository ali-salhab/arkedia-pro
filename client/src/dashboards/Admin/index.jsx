import { useState } from "react";
import PermissionWrapper from "../../components/PermissionWrapper";
import DataTable from "../../components/DataTable";
import UserFormModal from "../../components/UserFormModal";
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
  // Fetch only adminuser accounts for the team section
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery({
    role: "adminuser",
  });
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
  const adminTeam = toArr(usersData);

  const [userModal, setUserModal] = useState({ open: false, user: null });

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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h2 style={{ fontWeight: 600, margin: 0 }}>👥 المستخدمون</h2>
            <PermissionWrapper permission="users:add">
              <button
                className="btn btn-primary"
                style={{ fontSize: 13 }}
                onClick={() => setUserModal({ open: true, user: null })}
              >
                + Add Member
              </button>
            </PermissionWrapper>
          </div>
          {usersLoading ? (
            <div>Loading...</div>
          ) : adminTeam.length === 0 ? (
            <p
              style={{
                color: "#9ca3af",
                textAlign: "center",
                padding: "20px 0",
                margin: 0,
              }}
            >
              No team members yet.
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "8px 12px",
                      fontSize: 12,
                      color: "#64748b",
                      fontWeight: 600,
                    }}
                  >
                    NAME
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "8px 12px",
                      fontSize: 12,
                      color: "#64748b",
                      fontWeight: 600,
                    }}
                  >
                    EMAIL
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "8px 12px",
                      fontSize: 12,
                      color: "#64748b",
                      fontWeight: 600,
                    }}
                  >
                    ROLE
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "8px 12px",
                      fontSize: 12,
                      color: "#64748b",
                      fontWeight: 600,
                    }}
                  >
                    PERMISSIONS
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "8px 12px",
                      fontSize: 12,
                      color: "#64748b",
                      fontWeight: 600,
                    }}
                  >
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {adminTeam.map((member) => (
                  <tr
                    key={member._id}
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    >
                      {member.name}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: 13,
                        color: "#64748b",
                      }}
                    >
                      {member.email}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span
                        style={{
                          fontSize: 12,
                          background: "#f0fdf4",
                          color: "#16a34a",
                          padding: "3px 10px",
                          borderRadius: 12,
                          fontWeight: 500,
                          textTransform: "capitalize",
                        }}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span
                        style={{
                          fontSize: 12,
                          background: "#eff6ff",
                          color: "#3b82f6",
                          padding: "3px 10px",
                          borderRadius: 12,
                          fontWeight: 500,
                        }}
                      >
                        {(member.permissions || []).length} permissions
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>
                      <PermissionWrapper permission="users:edit">
                        <button
                          onClick={() =>
                            setUserModal({ open: true, user: member })
                          }
                          title="Edit"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#3b82f6",
                            marginRight: 8,
                            fontSize: 15,
                            padding: "4px 8px",
                            borderRadius: 6,
                          }}
                        >
                          ✏️
                        </button>
                      </PermissionWrapper>
                      <PermissionWrapper permission="users:delete">
                        <button
                          onClick={() => {
                            if (window.confirm("Delete this team member?"))
                              deleteUser(member._id);
                          }}
                          title="Delete"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#ef4444",
                            fontSize: 15,
                            padding: "4px 8px",
                            borderRadius: 6,
                          }}
                        >
                          🗑️
                        </button>
                      </PermissionWrapper>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </PermissionWrapper>
      <UserFormModal
        open={userModal.open}
        onClose={() => setUserModal({ open: false, user: null })}
        onSave={async (data) => {
          if (data._id) await updateUser(data).unwrap();
          else await createUser(data).unwrap();
        }}
        user={userModal.user}
        allowedRoles={["adminuser"]}
      />

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
