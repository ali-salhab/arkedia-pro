import { useState } from "react";
import { useSelector } from "react-redux";
import DataTable from "../components/DataTable";
import { SkeletonTable } from "../components/SkeletonLoader";
import UserFormModal from "../components/UserFormModal";
import { useLanguage } from "../context/LanguageContext";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "../store/services/api";

export default function ActivitiesPage() {
  const currentUser = useSelector((s) => s.auth.user);
  const permissions = useSelector((s) => s.auth.user?.permissions || []);
  const hasPermission = (permission) => permissions.includes(permission);
  const canViewActivities = hasPermission("activities:view");
  const canAddActivities = hasPermission("activities:add");
  const canEditActivities = hasPermission("activities:edit");
  const canDeleteActivities = hasPermission("activities:delete");
  const canViewAdmins = hasPermission("admins:view");
  const isPlatformRole = ["super_admin", "superadminuser"].includes(
    currentUser?.role,
  );
  const currentUserId = currentUser?._id || currentUser?.sub || null;
  const ownerScopeId = ["admin", "hotel", "restaurant", "activity"].includes(
    currentUser?.role,
  )
    ? currentUserId
    : currentUser?.adminId || null;

  const {
    data: activitiesData = [],
    isLoading: activitiesLoading,
    isFetching: activitiesFetching,
    error: activitiesError,
  } = useGetUsersQuery({ role: "activity" }, { skip: !canViewActivities });

  const {
    data: adminsData = [],
    isLoading: adminsLoading,
    isFetching: adminsFetching,
    error: adminsError,
  } = useGetUsersQuery(
    { role: "admin" },
    { skip: !(isPlatformRole && canViewAdmins) },
  );

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const { t } = useLanguage();

  const isMutating = isCreating || isUpdating || isDeleting;
  const isBusy = isMutating || activitiesFetching || adminsFetching;
  const disableAddActivity =
    isBusy ||
    !canAddActivities ||
    (isPlatformRole &&
      (!canViewAdmins || adminsLoading || Boolean(adminsError)));

  const activityAccountsRaw = Array.isArray(activitiesData)
    ? activitiesData
    : [];
  const activityAccounts = !isPlatformRole
    ? ownerScopeId
      ? activityAccountsRaw.filter((item) => {
          const ownerId = item?.adminId?._id || item?.adminId || null;
          return ownerId && String(ownerId) === String(ownerScopeId);
        })
      : []
    : activityAccountsRaw;
  const adminsList = Array.isArray(adminsData) ? adminsData : [];

  const resolveLinkedAdmin = (accountAdminId) => {
    const ownerId = accountAdminId?._id || accountAdminId || null;
    if (!ownerId) return null;

    const listedAdmin = adminsList.find(
      (a) => String(a._id) === String(ownerId),
    );
    if (listedAdmin) return listedAdmin;

    if (
      !isPlatformRole &&
      ownerScopeId &&
      String(ownerId) === String(ownerScopeId)
    ) {
      if (
        currentUser?.role === "admin" &&
        currentUserId &&
        String(ownerId) === String(currentUserId)
      ) {
        return currentUser;
      }
      return { name: t("linkedToAdmin") };
    }

    return null;
  };

  const activityColumns = [
    { key: "name", label: t("name") },
    { key: "email", label: t("email") },
    {
      key: "adminId",
      label: t("linkedAdmin"),
      render: (v) => {
        const admin = resolveLinkedAdmin(v);
        return admin ? (
          <span style={{ color: "#60a5fa", fontSize: 12 }}>{admin.name}</span>
        ) : (
          <span style={{ color: "#ef4444", fontSize: 12 }}>
            ⚠️ {t("noAdminLinked")}
          </span>
        );
      },
    },
    {
      key: "logo",
      label: t("logo"),
      render: (v) =>
        v ? (
          <img
            src={v}
            alt="logo"
            style={{
              width: 48,
              height: 36,
              borderRadius: 6,
              objectFit: "cover",
            }}
          />
        ) : (
          <span style={{ fontSize: 24 }}>🎯</span>
        ),
    },
    {
      key: "createdAt",
      label: t("createdAt"),
      render: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
    },
  ];

  const handleAddNew = () => {
    if (!canAddActivities) return;
    if (isPlatformRole && !canViewAdmins) {
      window.alert(`${t("error")} 403: Missing admins:view permission`);
      return;
    }
    if (isPlatformRole && (adminsLoading || adminsFetching)) return;
    if (isPlatformRole && adminsError) {
      window.alert(t("errorLoadingAdmins"));
      return;
    }

    setEditingActivity(null);
    setModalOpen(true);
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setModalOpen(true);
  };

  const handleSave = async (data) => {
    if (data._id) {
      await updateUser({ _id: data._id, ...data }).unwrap();
    } else {
      await createUser({ ...data, role: "activity" }).unwrap();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t("confirmDeleteActivity"))) {
      await deleteUser(id);
    }
  };

  if (!canViewActivities) {
    return (
      <div className="card text-center text-sm font-medium text-rose-500">
        {t("error")} 403: Missing activities:view permission
      </div>
    );
  }

  if (activitiesLoading)
    return (
      <div style={{ padding: 24 }}>
        <SkeletonTable rows={5} cols={4} />
      </div>
    );

  if (activitiesError)
    return (
      <div className="p-6 text-center text-red-500">
        {t("errorLoadingData")}
      </div>
    );

  return (
    <div style={{ padding: 24 }}>
      {isBusy && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            zIndex: 9999,
            background:
              "linear-gradient(90deg, #8b5cf6 0%, #6366f1 50%, #8b5cf6 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.2s infinite linear",
          }}
        />
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
            {t("activityAccounts")}
          </h1>
          <p style={{ color: "#9ca3af", fontSize: 14, marginTop: 4 }}>
            {t("activityAccountsSubtitle")}
          </p>
        </div>
        <button
          onClick={handleAddNew}
          disabled={disableAddActivity}
          style={{
            background: disableAddActivity ? "#c4b5fd" : "#8b5cf6",
            padding: "12px 24px",
            borderRadius: 8,
            border: "none",
            color: "#fff",
            fontWeight: 600,
            cursor: disableAddActivity ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            opacity: disableAddActivity ? 0.7 : 1,
            transition: "all 0.2s",
          }}
        >
          {isBusy ? (
            <>
              <span
                style={{
                  display: "inline-block",
                  width: 16,
                  height: 16,
                  border: "2px solid #fff",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }}
              />
              {t("saving")}
            </>
          ) : (
            <>
              <span style={{ fontSize: 18 }}>+</span> {t("addActivityAccount")}
            </>
          )}
        </button>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: "#f8fafc",
            borderRadius: 12,
            padding: 16,
            borderLeft: "4px solid #8b5cf6",
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 8 }}>🎯</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#8b5cf6" }}>
            {activityAccounts.length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            {t("activityAccounts")}
          </div>
        </div>
        <div
          style={{
            background: "#f8fafc",
            borderRadius: 12,
            padding: 16,
            borderLeft: "4px solid #60a5fa",
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 8 }}>🔗</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#60a5fa" }}>
            {activityAccounts.filter((a) => a.adminId).length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            {t("linkedToAdmin")}
          </div>
        </div>
        <div
          style={{
            background: "#f8fafc",
            borderRadius: 12,
            padding: 16,
            borderLeft: "4px solid #ef4444",
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#ef4444" }}>
            {activityAccounts.filter((a) => !a.adminId).length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            {t("noAdminLinked")}
          </div>
        </div>
      </div>

      {/* Activity Accounts Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        {activityAccounts.map((activity) => {
          const linkedAdmin = resolveLinkedAdmin(activity.adminId);
          return (
            <div
              key={activity._id}
              style={{
                background: "#ffffff",
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  height: 120,
                  background: activity.logo
                    ? `url(${activity.logo}) center/cover no-repeat`
                    : "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                {!activity.logo && <span style={{ fontSize: 56 }}>🎯</span>}
                {!linkedAdmin && (
                  <span
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      background: "#ef4444",
                      color: "#fff",
                      padding: "4px 8px",
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  >
                    ⚠️ {t("noAdminWarning")}
                  </span>
                )}
              </div>
              <div style={{ padding: 16 }}>
                <h3
                  style={{
                    margin: "0 0 4px 0",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#1e293b",
                  }}
                >
                  {activity.name}
                </h3>
                <p
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: 13,
                    color: "#9ca3af",
                  }}
                >
                  {activity.email}
                </p>
                {linkedAdmin && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "#f5f3ff",
                      border: "1px solid #ddd6fe",
                      padding: "4px 10px",
                      borderRadius: 20,
                      fontSize: 12,
                      color: "#7c3aed",
                      marginBottom: 12,
                    }}
                  >
                    👔 {linkedAdmin.name}
                  </div>
                )}
                {(canEditActivities || canDeleteActivities) && (
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    {canEditActivities && (
                      <button
                        onClick={() => handleEdit(activity)}
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          background: "#8b5cf6",
                          border: "none",
                          borderRadius: 6,
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        {t("edit")}
                      </button>
                    )}
                    {canDeleteActivities && (
                      <button
                        onClick={() => handleDelete(activity._id)}
                        style={{
                          padding: "8px 12px",
                          background: "#ef4444",
                          border: "none",
                          borderRadius: 6,
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        {t("delete")}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {activityAccounts.length === 0 && (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: 48,
              color: "#9ca3af",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
            <p>{t("noActivityAccounts")}</p>
          </div>
        )}
      </div>

      {/* Table View */}
      <div className="card" style={{ marginTop: 32 }}>
        <h3 style={{ marginBottom: 16, fontWeight: 600 }}>
          {t("activityAccountsTable")}
        </h3>
        <DataTable
          columns={activityColumns}
          data={activityAccounts}
          editable={false}
          exportFilename="activity_accounts"
        />
      </div>

      <UserFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        user={editingActivity}
        fixedRole="activity"
        adminsList={adminsList}
      />
    </div>
  );
}
