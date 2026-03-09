import { useState } from "react";
import PermissionWrapper from "../../components/PermissionWrapper";
import DataTable from "../../components/DataTable";
import UserFormModal from "../../components/UserFormModal";
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
  const platformTeam = toArr(usersData).filter((u) => u.role === "super_admin");

  const [userModal, setUserModal] = useState({ open: false, user: null });

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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h2 style={{ fontWeight: 600, margin: 0 }}>👥 Platform Team</h2>
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
          ) : platformTeam.length === 0 ? (
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
                {platformTeam.map((member) => (
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
        fixedRole="super_admin"
      />

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
