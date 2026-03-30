import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import Modal from "../components/Modal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import DataModal from "../components/DataModal";
import { useLanguage } from "../context/LanguageContext";
import { setCredentials } from "../store/slices/authSlice";
import { useGetUsersQuery, useDeleteUserMutation, useImpersonateMutation } from "../store/services/api";
import {
  Pencil,
  Trash2,
  Search,
  Plus,
  Building2,
  ShieldCheck,
  CalendarDays,
  UserCheck,
  ExternalLink,
} from "lucide-react";

const AVATAR_COLORS = [
  "from-indigo-500 to-blue-500",
  "from-blue-500 to-sky-500",
  "from-sky-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-red-500",
  "from-violet-500 to-purple-500",
  "from-pink-500 to-rose-500",
];
function avatarColor(name) {
  return AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

export default function HotelsPage() {
  const currentUser = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const { t, lang, dir } = useLanguage();
  const isRtl = dir === "rtl";
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [adminRequiredModalOpen, setAdminRequiredModalOpen] = useState(false);
  const [resumeHotelCreation, setResumeHotelCreation] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: users = [], isLoading, error } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [impersonate, { isLoading: impersonating }] = useImpersonateMutation();

  const usersArray = Array.isArray(users) ? users : [];
  const hotels = usersArray.filter((u) => u.role === "hotel");
  const adminsList = usersArray.filter((u) => u.role === "admin");

  const resolveLinkedAdmin = (hotel) => {
    if (!hotel.adminId) return null;
    if (typeof hotel.adminId === "object" && hotel.adminId._id) return hotel.adminId;
    return adminsList.find((a) => a._id === hotel.adminId) || null;
  };

  useEffect(() => {
    if (resumeHotelCreation && adminsList.length > 0) {
      setResumeHotelCreation(false);
      navigate("/hotels/new", {
        state: { fixedRole: "hotel", adminsList, backTo: "/hotels" },
      });
    }
  }, [adminsList.length, resumeHotelCreation, navigate]);

  const handleAddNew = () => {
    if (adminsList.length === 0) {
      setAdminRequiredModalOpen(true);
      return;
    }
    navigate("/hotels/new", {
      state: { fixedRole: "hotel", adminsList, backTo: "/hotels" },
    });
  };
  const handleEdit = (hotel) =>
    navigate(`/hotels/${hotel._id}/edit`, {
      state: {
        hotel,
        fixedRole: hotel.role || "hotel",
        adminsList,
        backTo: "/hotels",
      },
    });
  const handleDelete = (id) => setDeleteTarget(id);
  const handleOpenDashboard = async (userId) => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth") || "{}");
      localStorage.setItem("admin_origin", JSON.stringify({ user: currentUser, accessToken: auth.accessToken, refreshToken: auth.refreshToken }));
      const result = await impersonate({ userId }).unwrap();
      dispatch(setCredentials(result));
      navigate("/hotel");
    } catch (err) { console.error("Impersonate failed:", err); }
  };
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
      <div className="p-6 text-center text-rose-500 font-bold">
        {t("errorLoadingHotels")}
      </div>
    );

  const rows = hotels.filter(
    (h) =>
      !search ||
      h.name?.toLowerCase().includes(search.toLowerCase()) ||
      h.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const hotelToDelete = rows.find((h) => h._id === deleteTarget);

  return (
    <div
      className="space-y-6 pb-10 animate-in fade-in duration-300"
      style={{ direction: isRtl ? "rtl" : "ltr" }}
    >
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {t("allHotels")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
          {t("hotelsSubtitle") || "Manage hotel accounts"}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search
              size={15}
              className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRtl ? "right-3.5" : "left-3.5"}`}
            />
            <input
              className={`h-10 ${isRtl ? "pr-9 pl-4" : "pl-9 pr-4"} rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[13px] font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-56 lg:w-72`}
              placeholder={t("search") + "..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DataModal resourcePath="hotels" resourceLabel={t("allHotels")} />
          <button
            onClick={handleAddNew}
            className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 transition-all"
          >
            {t("addHotel")}
          </button>
        </div>
      </div>

      {/* Table / Empty */}
      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white/60 dark:bg-slate-900/40 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Building2 size={28} className="text-slate-400" strokeWidth={1.5} />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-semibold text-[15px]">
            {t("noData")}
          </p>
          <button
            onClick={handleAddNew}
            className="h-10 px-5 rounded-xl bg-blue-600 text-white font-bold text-[13px] flex items-center gap-2 shadow-md"
          >
            {t("addHotel")}
          </button>
        </div>
      ) : (
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-800/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/30">
                  {[
                    { label: t("name"), Icon: Building2 },
                    { label: t("linkedAdmin"), Icon: UserCheck },
                    { label: t("permissions"), Icon: ShieldCheck },
                    { label: t("createdAt"), Icon: CalendarDays },
                    { label: "" },
                  ].map((h, i) => (
                    <th
                      key={i}
                      className="px-4 py-3.5 text-center text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 whitespace-nowrap"
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        {h.Icon && <h.Icon size={12} />}
                        {h.label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rows.map((hotel) => {
                  const admin = resolveLinkedAdmin(hotel);
                  const bgGrad = avatarColor(hotel.name);
                  return (
                    <tr
                      key={hotel._id}
                      className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-3 text-center">
                          {hotel.logo ? (
                            <img
                              src={hotel.logo}
                              className="h-10 w-10 rounded-xl object-cover shrink-0 shadow-sm border border-slate-200 dark:border-slate-700"
                              alt=""
                            />
                          ) : (
                            <div
                              className={`h-10 w-10 rounded-xl shrink-0 flex items-center justify-center text-white text-[13px] font-black bg-gradient-to-br ${bgGrad} shadow-sm border border-slate-200/50 dark:border-slate-700/50`}
                            >
                              {(hotel.name || "?")[0].toUpperCase()}
                            </div>
                          )}
                          <div className="text-start">
                            <p className="font-bold text-slate-900 dark:text-white leading-snug">
                              {hotel.name}
                            </p>
                            <p className="text-[12px] font-medium text-slate-400 dark:text-slate-500">
                              {hotel.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {admin ? (
                          <div className="flex items-center justify-center gap-2">
                            <div
                              className={`h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold bg-gradient-to-br ${avatarColor(admin.name)} shadow-sm`}
                            >
                              {(admin.name || "?")[0].toUpperCase()}
                            </div>
                            <span className="text-slate-700 dark:text-slate-300 font-semibold text-[13px]">
                              {admin.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-[13px] font-medium">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center text-slate-600 dark:text-slate-400 font-semibold">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[12px]">
                          {(hotel.permissions || []).length}
                        </span>{" "}
                        {t("permissionsSelected")}
                      </td>
                      <td className="px-4 py-4 text-center text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                        {hotel.createdAt
                          ? new Date(hotel.createdAt).toLocaleDateString(
                              lang === "ar" ? "ar-EG" : "en-US",
                            )
                          : "—"}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenDashboard(hotel._id)}
                            disabled={impersonating}
                            className="h-8 w-8 flex items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors disabled:opacity-40"
                            title={t("openDashboard") || "Open Dashboard"}
                          >
                            <ExternalLink size={14} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => handleEdit(hotel)}
                            className="h-8 w-8 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                            title={t("edit")}
                          >
                            <Pencil size={14} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => handleDelete(hotel._id)}
                            className="h-8 w-8 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition-colors"
                            title={t("delete")}
                          >
                            <Trash2 size={14} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-[12px] text-slate-400 font-semibold">
              {rows.length} {rows.length === 1 ? "hotel" : "hotels"}
            </p>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[1100] p-4 animate-in fade-in duration-200">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-3xl border border-slate-200/60 dark:border-slate-800/50 shadow-2xl p-8 w-full max-w-sm">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-5">
              <Trash2 size={22} className="text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-[18px] font-black text-slate-900 dark:text-white mb-2">
              {t("deleteConfirmTitle") || "Delete Hotel"}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 font-semibold mb-1">
              {hotelToDelete?.name}
            </p>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-6">
              {t("deleteCannotUndo") || "This action cannot be undone."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 h-11 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-[14px]"
              >
                {t("cancel")}
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 h-11 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-[14px] shadow-lg shadow-red-500/25 transition-colors"
              >
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}

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
            className="px-4 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-600 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleOpenAdminCreation}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg transition"
          >
            {t("createAdminNow")}
          </button>
        </div>
      </Modal>
    </div>
  );
}
