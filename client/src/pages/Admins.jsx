import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import { useLanguage } from "../context/LanguageContext";
import { useGetUsersQuery, useDeleteUserMutation } from "../store/services/api";
import { Pencil, Trash2, Search, Download, Plus } from "lucide-react";

const AVATAR_COLORS = ["#6366f1","#3b82f6","#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899"];
function avatarColor(name) { return AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length]; }

export default function AdminsPage() {
  const currentUser = useSelector((s) => s.auth.user);
  const canAdd = ["super_admin","superadminuser"].includes(currentUser?.role);
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: users = [], isLoading, error } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();

  const admins = (Array.isArray(users) ? users : []).filter((u) => u.role === "admin");
  const rows = admins.filter((u) => !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = () => navigate("/admins/new", { state: { fixedRole: "admin", backTo: "/admins" } });
  const handleEdit = (u) => navigate(`/admins/${u._id}/edit`, { state: { user: u, fixedRole: "admin", backTo: "/admins" } });
  const handleDelete = async (id) => { if (window.confirm(t("confirmDeleteUser"))) await deleteUser(id); };

  if (isLoading) return <LoadingScreen label={t("loadingUsers")} tableRows={5} tableCols={4} />;
  if (error) return <div className="card p-6 text-center text-rose-500">{t("errorLoadingUsers")}</div>;

  const exportCsv = () => {
    const csv = ["Name,Email,Permissions,Created", ...rows.map((u) => `"${u.name}","${u.email}","${(u.permissions||[]).length}","${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ""}"`)] .join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "admins.csv"; a.click();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-1">
            <span>{t("dashboard")}</span><span>/</span><span className="text-slate-600 dark:text-slate-300">{t("admins")}</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("admins")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t("adminsSubtitle") || "Manage admin accounts"}</p>
        </div>
        {canAdd && (
          <button onClick={handleAdd} className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition shrink-0">
            <Plus size={16} /> {t("addAdmin")}
          </button>
        )}
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
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t("permissions")}</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t("createdAt")}</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700/60">
            {rows.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500">{t("noData")}</td></tr>
            ) : rows.map((u) => {
              const bg = avatarColor(u.name);
              return (
                <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {u.logo ? <img src={u.logo} className="h-9 w-9 rounded-full object-cover shrink-0" alt="" /> : <div className="h-9 w-9 rounded-full shrink-0 grid place-items-center text-white text-xs font-bold" style={{ background: bg }}>{(u.name || "?")[0].toUpperCase()}</div>}
                      <div><div className="font-medium text-slate-800 dark:text-slate-100">{u.name}</div><div className="text-xs text-slate-400 dark:text-slate-500">{u.email}</div></div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{(u.permissions || []).length} {t("permissionsSelected")}</td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US") : "—"}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEdit(u)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition"><Pencil size={15} /></button>
                      <button onClick={() => handleDelete(u._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
