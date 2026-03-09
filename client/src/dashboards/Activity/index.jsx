import { useState } from "react";
import PermissionWrapper from "../../components/PermissionWrapper";
import DataTable from "../../components/DataTable";
import UserFormModal from "../../components/UserFormModal";
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

  const [userModal, setUserModal] = useState({ open: false, user: null });

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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontWeight: 600, margin: 0 }}>👥 My Team</h2>
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
          ) : toArr(usersData).length === 0 ? (
            <p style={{ color: "#9ca3af", textAlign: "center", padding: "20px 0", margin: 0 }}>
              No team members yet.
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 12, color: "#64748b", fontWeight: 600 }}>NAME</th>
                  <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 12, color: "#64748b", fontWeight: 600 }}>EMAIL</th>
                  <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 12, color: "#64748b", fontWeight: 600 }}>PERMISSIONS</th>
                  <th style={{ textAlign: "right", padding: "8px 12px", fontSize: 12, color: "#64748b", fontWeight: 600 }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {toArr(usersData).map((member) => (
                  <tr key={member._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 12px", fontSize: 14, fontWeight: 500 }}>{member.name}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "#64748b" }}>{member.email}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ fontSize: 12, background: "#eff6ff", color: "#3b82f6", padding: "3px 10px", borderRadius: 12, fontWeight: 500 }}>
                        {(member.permissions || []).length} permissions
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>
                      <PermissionWrapper permission="users:edit">
                        <button
                          onClick={() => setUserModal({ open: true, user: member })}
                          title="Edit"
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#3b82f6", marginRight: 8, fontSize: 15, padding: "4px 8px", borderRadius: 6 }}
                        >✏️</button>
                      </PermissionWrapper>
                      <PermissionWrapper permission="users:delete">
                        <button
                          onClick={() => { if (window.confirm("Delete this team member?")) deleteUser(member._id); }}
                          title="Delete"
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 15, padding: "4px 8px", borderRadius: 6 }}
                        >🗑️</button>
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
        fixedRole="activity"
      />

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
