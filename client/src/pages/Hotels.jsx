import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import { SkeletonTable } from "../components/SkeletonLoader";
import UserFormModal from "../components/UserFormModal";
import { useLanguage } from "../context/LanguageContext";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "../store/services/api";

export default function HotelsPage() {
  const permissions = useSelector((s) => s.auth.user?.permissions || []);
  const hasPermission = (permission) => permissions.includes(permission);
  const canViewHotels = hasPermission("hotels:view");
  const canAddHotels = hasPermission("hotels:add");
  const canEditHotels = hasPermission("hotels:edit");
  const canDeleteHotels = hasPermission("hotels:delete");
  const canViewAdmins = hasPermission("admins:view");
  const canAddAdmins = hasPermission("admins:add");

  const {
    data: hotelsData = [],
    isLoading: hotelsLoading,
    isFetching: hotelsFetching,
    error: hotelsError,
  } = useGetUsersQuery({ role: "hotel" }, { skip: !canViewHotels });

  const {
    data: adminsData = [],
    isLoading: adminsLoading,
    isFetching: adminsFetching,
    error: adminsError,
  } = useGetUsersQuery({ role: "admin" }, { skip: !canViewAdmins });

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminRequiredModalOpen, setAdminRequiredModalOpen] = useState(false);
  const [resumeHotelCreation, setResumeHotelCreation] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const { t } = useLanguage();

  const isMutating = isCreating || isUpdating || isDeleting;
  const isBusy = isMutating || hotelsFetching || adminsFetching;
  const disableAddHotel =
    isBusy ||
    !canAddHotels ||
    !canViewAdmins ||
    adminsLoading ||
    Boolean(adminsError);

  const hotelAccounts = Array.isArray(hotelsData) ? hotelsData : [];
  const adminsList = Array.isArray(adminsData) ? adminsData : [];

  const hotelColumns = [
    { key: "name", label: t("name") },
    { key: "email", label: t("email") },
    {
      key: "adminId",
      label: t("linkedAdmin"),
      render: (v) => {
        const admin = adminsList.find((a) => a._id === v || a._id === v?._id);
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
          <span style={{ fontSize: 24 }}>🏨</span>
        ),
    },
    {
      key: "createdAt",
      label: t("createdAt"),
      render: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
    },
  ];

  useEffect(() => {
    if (resumeHotelCreation && adminsList.length > 0) {
      setResumeHotelCreation(false);
      setAdminModalOpen(false);
      setEditingHotel(null);
      setModalOpen(true);
    }
  }, [adminsList.length, resumeHotelCreation]);

  const handleAddNew = () => {
    if (!canAddHotels) return;
    if (!canViewAdmins) {
      window.alert(`${t("error")} 403: Missing admins:view permission`);
      return;
    }
    if (adminsLoading || adminsFetching) return;
    if (adminsError) {
      window.alert(t("errorLoadingAdmins"));
      return;
    }

    setEditingHotel(null);
    if (adminsList.length === 0) {
      setAdminRequiredModalOpen(true);
      return;
    }
    setModalOpen(true);
  };

  const handleEdit = (hotel) => {
    setEditingHotel(hotel);
    setModalOpen(true);
  };

  const handleSave = async (data) => {
    if (data._id) {
      await updateUser({ _id: data._id, ...data }).unwrap();
    } else {
      await createUser({ ...data, role: "hotel" }).unwrap();
    }
  };

  const handleAdminSave = async (data) => {
    if (!canAddAdmins) {
      throw new Error("Missing admins:add permission");
    }
    await createUser({ ...data, role: "admin" }).unwrap();
  };

  const handleOpenAdminCreation = () => {
    setAdminRequiredModalOpen(false);
    setResumeHotelCreation(true);
    setAdminModalOpen(true);
  };

  const handleCloseAdminModal = () => {
    setAdminModalOpen(false);
    setResumeHotelCreation(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t("areYouSureDeleteHotelAccount"))) {
      await deleteUser(id);
    }
  };

  if (!canViewHotels) {
    return (
      <div className="card text-center text-sm font-medium text-rose-500">
        {t("error")} 403: Missing hotels:view permission
      </div>
    );
  }

  if (hotelsLoading)
    return (
      <div style={{ padding: 24 }}>
        <SkeletonTable rows={5} cols={4} />
      </div>
    );

  if (hotelsError)
    return (
      <div className="p-6 text-center text-red-500">{t("errorLoadingData")}</div>
    );

  return (
    <div style={{ padding: 24 }}>
      {/* Loading bar — shows during refetch after create/update/delete */}
      {(isBusy || adminsLoading) && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            zIndex: 9999,
            background:
              "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #3b82f6 100%)",
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
            {t("hotelAccounts")}
          </h1>
          <p style={{ color: "#9ca3af", fontSize: 14, marginTop: 4 }}>
            {t("hotelAccountsSubtitle")}
          </p>
        </div>
        <button
          onClick={handleAddNew}
          disabled={disableAddHotel}
          style={{
            background: disableAddHotel ? "#93c5fd" : "#3b82f6",
            padding: "12px 24px",
            borderRadius: 8,
            border: "none",
            color: "#fff",
            fontWeight: 600,
            cursor: disableAddHotel ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            opacity: disableAddHotel ? 0.7 : 1,
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
              <span style={{ fontSize: 18 }}>+</span> {t("addHotelAccount")}
            </>
          )}
        </button>
      </div>

                {(canEditHotels || canDeleteHotels) && (
                  <div style={{ display: "flex", gap: 8 }}>
                    {canEditHotels && (
                      <button
                        onClick={() => handleEdit(hotel)}
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          background: "#3b82f6",
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
                    {canDeleteHotels && (
                      <button
                        onClick={() => handleDelete(hotel._id)}
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
          <div style={{ fontSize: 24, marginBottom: 8 }}>🔗</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#60a5fa" }}>
            {hotelAccounts.filter((h) => h.adminId).length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            {t("linkedToAdmin")}
          </div>
        </div>
      </div>

      {/* Hotel Accounts Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        {hotelAccounts.map((hotel) => {
          const linkedAdmin = adminsList.find(
            (a) => a._id === hotel.adminId || a._id === hotel.adminId?._id,
          );
          return (
            <div
              key={hotel._id}
              style={{
                background: "#ffffff",
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid #e2e8f0",
              }}
            >
              {/* Header */}
              <div
                style={{
                  height: 185,
                  background: hotel.logo
                    ? `url(${hotel.logo}) center/cover no-repeat`
                    : "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                {!hotel.logo && <span style={{ fontSize: 56 }}>🏨</span>}
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

              {/* Info */}
              <div style={{ padding: 16 }}>
                {/* Row 1: name + admin badge */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#1e293b",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      minWidth: 0,
                    }}
                  >
                    {hotel.name}
                  </h3>
                  {linkedAdmin && (
                    <span
                      style={{
                        flexShrink: 0,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        padding: "3px 8px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#2563eb",
                        whiteSpace: "nowrap",
                      }}
                    >
                      👔 {linkedAdmin.name}
                    </span>
                  )}
                </div>
                {/* Row 2: email */}
                <p
                  style={{
                    margin: "0 0 14px 0",
                    fontSize: 12,
                    color: "#9ca3af",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {hotel.email}
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => handleEdit(hotel)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      background: "#3b82f6",
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
                  <button
                    onClick={() => handleDelete(hotel._id)}
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
                </div>
              </div>
            </div>
          );
        })}

        {hotelAccounts.length === 0 && (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: 48,
              color: "#9ca3af",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏨</div>
            <p>{t("noHotelAccountsYet")}</p>
          </div>
        )}
      </div>

      {/* Table View */}
      <div className="card" style={{ marginTop: 32 }}>
        <h3 style={{ marginBottom: 16, fontWeight: 600 }}>
          {t("hotelAccountsTable")}
        </h3>
        <DataTable
          columns={hotelColumns}
          data={hotelAccounts}
          editable={false}
          exportFilename="hotel_accounts"
        />
      </div>

      <UserFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        user={editingHotel}
        fixedRole="hotel"
        adminsList={adminsList}
      />

      <Modal
        open={adminRequiredModalOpen}
        onClose={() => setAdminRequiredModalOpen(false)}
        title={t("adminRequiredForHotelTitle")}
      >
        <p
          style={{
            margin: "0 0 20px 0",
            color: "#64748b",
            lineHeight: 1.7,
            fontSize: 14,
          }}
        >
          {t("adminRequiredForHotelMessage")}
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <button
            className="btn"
            onClick={() => setAdminRequiredModalOpen(false)}
          >
            {t("cancel")}
          </button>
          {canAddAdmins && (
            <button
              className="btn btn-primary"
              onClick={handleOpenAdminCreation}
            >
              {t("createAdminNow")}
            </button>
          )}
        </div>
      </Modal>

      <UserFormModal
        open={adminModalOpen}
        onClose={handleCloseAdminModal}
        onSave={handleAdminSave}
        fixedRole="admin"
      />
    </div>
  );
}
