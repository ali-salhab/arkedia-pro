import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import Modal from "../components/Modal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { useLanguage } from "../context/LanguageContext";
import { useGetUsersQuery, useDeleteUserMutation } from "../store/services/api";
import { Pencil, Trash2, Search, Download, Plus } from "lucide-react";

const AVATAR_COLORS = [
  "#6366f1",
  "#3b82f6",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];
function avatarColor(name) {
  return AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

export default function HotelsPage() {
  const currentUser = useSelector((s) => s.auth.user);
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [adminRequiredModalOpen, setAdminRequiredModalOpen] = useState(false);
  const [resumeHotelCreation, setResumeHotelCreation] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: users = [], isLoading, error } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();

  const usersArray = Array.isArray(users) ? users : [];
  const hotels = usersArray.filter((u) => u.role === "hotel");
  const adminsList = usersArray.filter((u) => u.role === "admin");

  const resolveLinkedAdmin = (hotel) => {
    if (!hotel.adminCompany) return null;
    const id =
      typeof hotel.adminCompany === "object"
        ? hotel.adminCompany._id
        : hotel.adminCompany;
    return adminsList.find((a) => a._id === id) || null;
  };

  const disableAddHotel = false;

  useEffect(() => {
    if (resumeHotelCreation && adminsList.length > 0) {
      setResumeHotelCreation(false);
      navigate("/hotels/new", {
        state: {
          fixedRole: "hotel",
          adminsList,
          backTo: "/hotels",
        },
      });
    }
  }, [adminsList.length, resumeHotelCreation, navigate]);

  const handleAddNew = () => {
    if (adminsList.length === 0) {
      setAdminRequiredModalOpen(true);
      return;
    }
    navigate("/hotels/new", {
      state: {
        fixedRole: "hotel",
        adminsList,
        backTo: "/hotels",
      },
    });
  };
  const handleEdit = (hotel) =>
    navigate(`/hotels/${hotel._id}/edit`, {
      state: { hotel, backTo: "/hotels" },
    });
  const handleDelete = (id) => setDeleteTarget(id);
  const confirmDelete = async () => {
    if (deleteTarget) await deleteUser(deleteTarget);
    setDeleteTarget(null);
  };

  const handleOpenAdminCreation = () => {
    setAdminRequiredModalOpen(false);
    setResumeHotelCreation(true);
    navigate("/admins/new", {
      state: {
        fixedRole: "admin",
        backTo: "/hotels",
        resumeHotelCreation: true,
      },
    });
  };

  if (isLoading)
    return (
      <LoadingScreen label={t("loadingHotels")} tableRows={6} tableCols={4} />
    );
  if (error)
    return (
      <div className="card p-6 text-center text-rose-500">
        {t("errorLoadingHotels")}
      </div>
    );

  const rows = hotels.filter(
    (h) =>
      !search ||
      h.name?.toLowerCase().includes(search.toLowerCase()) ||
      h.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const exportCsv = () => {
    const csv = [
      "Name,Email,Linked Admin,Created",
      ...rows.map((h) => {
        const admin = resolveLinkedAdmin(h);
        return `"${h.name}","${h.email}","${admin ? admin.name : ""}","${h.createdAt ? new Date(h.createdAt).toLocaleDateString() : ""}"`;
      }),
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "hotels.csv";
    a.click();
  };

  return (
    <div className="p-6">
      <DeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
      {/* Header */}}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-1">
            <span>{t("dashboard")}</span>
            <span>/</span>
            <span className="text-slate-600 dark:text-slate-300">
              {t("allHotels")}
            </span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t("allHotels")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t("hotelsSubtitle") || "Manage hotel accounts"}
          </p>
        </div>
        <button
          onClick={handleAddNew}
          disabled={disableAddHotel}
          className="flex items-center gap-2 bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-100 px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition shrink-0 disabled:opacity-50"
        >
          <Plus size={16} /> {t("addHotel")}
        </button>
      </div>

      {/* Search + Export */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search") + "..."}
            className="input pl-9 py-2 text-sm w-full"
          />
        </div>
        <button
          onClick={exportCsv}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          <Download size={15} /> {t("exportCsv")}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {t("name")}
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {t("linkedAdmin")}
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {t("permissions")}
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {t("createdAt")}
              </th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700/60">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-slate-400 dark:text-slate-500"
                >
                  {t("noData")}
                </td>
              </tr>
            ) : (
              rows.map((hotel) => {
                const admin = resolveLinkedAdmin(hotel);
                const bg = avatarColor(hotel.name);
                return (
                  <tr
                    key={hotel._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {hotel.logo ? (
                          <img
                            src={hotel.logo}
                            className="h-9 w-9 rounded-full object-cover shrink-0"
                            alt=""
                          />
                        ) : (
                          <div
                            className="h-9 w-9 rounded-full shrink-0 grid place-items-center text-white text-xs font-bold"
                            style={{ background: bg }}
                          >
                            {(hotel.name || "?")[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-slate-800 dark:text-slate-100">
                            {hotel.name}
                          </div>
                          <div className="text-xs text-slate-400 dark:text-slate-500">
                            {hotel.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {admin ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="h-6 w-6 rounded-full grid place-items-center text-white text-[10px] font-bold"
                            style={{ background: avatarColor(admin.name) }}
                          >
                            {(admin.name || "?")[0].toUpperCase()}
                          </div>
                          <span className="text-slate-700 dark:text-slate-300 text-xs">
                            {admin.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 text-xs">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                      {(hotel.permissions || []).length}{" "}
                      {t("permissionsSelected")}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                      {hotel.createdAt
                        ? new Date(hotel.createdAt).toLocaleDateString(
                            lang === "ar" ? "ar-EG" : "en-US",
                          )
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(hotel)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(hotel._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Admin Required Modal */}
      <Modal
        open={adminRequiredModalOpen}
        onClose={() => setAdminRequiredModalOpen(false)}
        title={t("adminRequired")}
      >
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-5">
          {t("adminRequiredForHotelMessage")}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setAdminRequiredModalOpen(false)}
            className="px-4 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleOpenAdminCreation}
            className="px-4 py-2 rounded-xl text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            {t("createAdminNow")}
          </button>
        </div>
      </Modal>
    </div>
  );
}
