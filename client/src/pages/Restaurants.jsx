import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import Modal from "../components/Modal";
import { useLanguage } from "../context/LanguageContext";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
} from "../store/services/api";
import { Pencil, Trash2, Search, Download, Plus } from "lucide-react";

const AVATAR_COLORS = ["#6366f1","#3b82f6","#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899"];
function avatarColor(name) { return AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length]; }

export default function RestaurantsPage() {
  const currentUser = useSelector((s) => s.auth.user);
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [adminRequiredModalOpen, setAdminRequiredModalOpen] = useState(false);
  const [resumeCreation, setResumeCreation] = useState(false);

  const { data: users = [], isLoading, error } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();

  const usersArray = Array.isArray(users) ? users : [];
  const restaurants = usersArray.filter((u) => u.role === "restaurant");
  const adminsList = usersArray.filter((u) => u.role === "admin");

  const resolveLinkedAdmin = (r) => {
    if (!r.adminCompany) return null;
    const id = typeof r.adminCompany === "object" ? r.adminCompany._id : r.adminCompany;
    return adminsList.find((a) => a._id === id) || null;
  };

  useEffect(() => {
    if (resumeCreation && adminsList.length > 0) {
      setResumeCreation(false);
      navigate("/restaurants/new", { state: { backTo: "/restaurants" } });
    }
  }, [adminsList.length, resumeCreation, navigate]);

  const handleAddNew = () => {
    if (adminsList.length === 0) { setAdminRequiredModalOpen(true); return; }
    navigate("/restaurants/new", { state: { backTo: "/restaurants" } });
  };
  const handleEdit = (r) => navigate(`/restaurants/${r._id}/edit`, { state: { restaurant: r, backTo: "/restaurants" } });
  const handleDelete = async (id) => { if (window.confirm(t("confirmDeleteRestaurant"))) await deleteUser(id); };

  const handleOpenAdminCreation = () => {
    setAdminRequiredModalOpen(false);
    setResumeCreation(true);
    navigate("/admins/new", { state: { fixedRole: "admin", backTo: "/restaurants", resumeCreation: true } });
  };

  if (isLoading) return <LoadingScreen label={t("loadingRestaurants")} tableRows={6} tableCols={4} />;
  if (error) return <div className="card p-6 text-center text-rose-500">{t("errorLoadingRestaurants")}</div>;

  const rows = restaurants.filter((r) => !search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.email?.toLowerCase().includes(search.toLowerCase()));

  const exportCsv = () => {
    const csv = ["Name,Email,Linked Admin,Created", ...rows.map((r) => { const admin = resolveLinkedAdmin(r); return `"${r.name}","${r.email}","${admin ? admin.name : ""}","${r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}"` })] .join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "restaurants.csv"; a.click();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-1">
            <span>{t("dashboard")}</span><span>/</span><span className="text-slate-600 dark:text-slate-300">{t("allRestaurants")}</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("allRestaurants")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t("restaurantsSubtitle") || "Manage restaurant accounts"}</p>
        </div>
        <button onClick={handleAddNew} className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition shrink-0">
          <Plus size={16} /> {t("addRestaurant")}
        </button>
      </div>

      {/* Search + Export */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search") + "..."} className="input pl-9 py-2 text-sm w-full" />
        </div>
        <button onClick={exportCsv} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <Download size={15} /> {t("exportCsv")}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t("name")}</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t("linkedAdmin")}</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t("permissions")}</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t("createdAt")}</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700/60">
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500">{t("noData")}</td></tr>
            ) : rows.map((r) => {
              const admin = resolveLinkedAdmin(r);
              const bg = avatarColor(r.name);
              return (
                <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {r.logo ? <img src={r.logo} className="h-9 w-9 rounded-full object-cover shrink-0" alt="" /> : <div className="h-9 w-9 rounded-full shrink-0 grid place-items-center text-white text-xs font-bold" style={{ background: bg }}>{(r.name || "?")[0].toUpperCase()}</div>}
                      <div><div className="font-medium text-slate-800 dark:text-slate-100">{r.name}</div><div className="text-xs text-slate-400 dark:text-slate-500">{r.email}</div></div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {admin ? (
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full grid place-items-center text-white text-[10px] font-bold" style={{ background: avatarColor(admin.name) }}>{(admin.name || "?")[0].toUpperCase()}</div>
                        <span className="text-slate-700 dark:text-slate-300 text-xs">{admin.name}</span>
                      </div>
                    ) : <span className="text-slate-400 dark:text-slate-500 text-xs">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{(r.permissions || []).length} {t("permissionsSelected")}</td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{r.createdAt ? new Date(r.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US") : "—"}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEdit(r)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition"><Pencil size={15} /></button>
                      <button onClick={() => handleDelete(r._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Admin Required Modal */}
      <Modal open={adminRequiredModalOpen} onClose={() => setAdminRequiredModalOpen(false)} title={t("adminRequired")}>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-5">{t("adminRequiredForRestaurantMessage") || t("adminRequiredForHotelMessage")}</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setAdminRequiredModalOpen(false)} className="px-4 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">{t("cancel")}</button>
          <button onClick={handleOpenAdminCreation} className="px-4 py-2 rounded-xl text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition">{t("createAdminNow")}</button>
        </div>
      </Modal>
    </div>
  );
}
