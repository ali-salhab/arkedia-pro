import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import LoadingScreen from "../components/LoadingScreen";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import PermissionWrapper from "../components/PermissionWrapper";
import DataModal from "../components/DataModal";
import { Pencil, Trash2, Search, Plus, BedDouble, Tag, DollarSign, Activity } from "lucide-react";
import {
  useGetRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} from "../store/services/api";

const STATUS_BADGE = {
  available: { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  occupied: { cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  maintenance: { cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  reserved: { cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
};

const TYPE_ICON = {
  room: "🛏️",
  suite: "🌟",
  studio: "🏠",
  villa: "🏡",
  table: "🍽️",
  service: "⚙️",
};

export default function RoomsPage() {
  const { t, dir } = useLanguage();
  const isRtl = dir === "rtl";
  const navigate = useNavigate();
  
  const { data: rooms = [], isLoading, error } = useGetRoomsQuery();
  const [createRoom] = useCreateRoomMutation();
  const [updateRoom] = useUpdateRoomMutation();
  const [deleteRoom] = useDeleteRoomMutation();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = rooms.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      String(r.number).includes(q) ||
      (r.name || "").toLowerCase().includes(q) ||
      (r.type || "").toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteRoom(deleteTarget).unwrap();
    setDeleteTarget(null);
  };

  const openAdd = () => navigate("/rooms/new", { state: { backTo: "/rooms" } });
  const openEdit = (r) => navigate(`/rooms/${r._id}/edit`, { state: { room: r, backTo: "/rooms" } });

  if (isLoading) return <LoadingScreen label={t("loadingRooms")} tableRows={6} tableCols={5} />;
  if (error) return <div className="p-6 text-center text-rose-500 font-bold">{t("errorLoadingRooms") || "Error loading rooms"}</div>;

  const roomToDelete = filtered.find(r => r._id === deleteTarget);

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-300" style={{ direction: isRtl ? "rtl" : "ltr" }}>
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t("roomsTables") || "Rooms / Tables"}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">{t("roomsSubtitle") || "Manage units and availability"}</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={15} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
            <input
              className={`h-10 ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[13px] font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-56`}
              placeholder={t("roomsPage_searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Filter Status */}
          <select
            className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[13px] font-medium text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">{t("roomsPage_allStatuses")}</option>
            <option value="available">{t("rm_statusAvailable")}</option>
            <option value="occupied">{t("rm_statusOccupied")}</option>
            <option value="maintenance">{t("rm_statusMaintenance")}</option>
            <option value="reserved">{t("rm_statusReserved")}</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <DataModal resourcePath="rooms" resourceLabel={t("roomsTables") || "Rooms / Tables"} />
          <PermissionWrapper permission="rooms:add">
            <button
              onClick={openAdd}
              className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 transition-all"
            >
              {t("roomsPage_addRoom")}
            </button>
          </PermissionWrapper>
        </div>
      </div>

      {/* Table / Empty */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white/60 dark:bg-slate-900/40 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BedDouble size={28} className="text-slate-400" strokeWidth={1.5} />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-semibold text-[15px]">{t("roomsPage_noRooms")}</p>
          <PermissionWrapper permission="rooms:add">
            <button onClick={openAdd} className="h-10 px-5 rounded-xl bg-blue-600 text-white font-bold text-[13px] flex items-center gap-2 shadow-md">
              {t("roomsPage_addRoom")}
            </button>
          </PermissionWrapper>
        </div>
      ) : (
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-800/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/30">
                  {[
                    { label: t("room") || "Room", Icon: BedDouble },
                    { label: t("details") || "Details", Icon: Tag },
                    { label: t("price") || "Rate", Icon: DollarSign },
                    { label: t("status") || "Status", Icon: Activity },
                    { label: "" },
                  ].map((h, i) => (
                    <th key={i} className="px-4 py-3.5 text-center text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 whitespace-nowrap">
                      <span className="flex items-center justify-center gap-1.5">
                        {h.Icon && <h.Icon size={12} />}
                        {h.label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((r) => {
                  const badge = STATUS_BADGE[r.status] || { cls: "bg-slate-100 text-slate-600" };
                  const imgUrl = r.thumbnail || (r.images && r.images[0]);
                  return (
                    <tr key={r._id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-3 text-center">
                          {imgUrl ? (
                            <img src={imgUrl} className="h-12 w-16 rounded-xl object-cover shrink-0 shadow-sm border border-slate-200 dark:border-slate-700" alt="" />
                          ) : (
                            <div className="h-12 w-16 rounded-xl shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-blue-600 shadow-sm border border-slate-200 dark:border-slate-700 text-xl">
                              {TYPE_ICON[r.type] || "🛏️"}
                            </div>
                          )}
                          <div className="text-start">
                            <p className="font-bold text-slate-900 dark:text-white leading-snug">
                              Room #{r.number} {r.name ? ` — ${r.name}` : ""}
                            </p>
                            <p className="text-[12px] font-medium text-slate-400 dark:text-slate-500">
                              {r.category || r.type} {r.floor ? `· Floor ${r.floor}` : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center text-slate-600 dark:text-slate-400 font-medium">
                        <div className="flex justify-center gap-3">
                          {r.capacity && <span>👥 {r.capacity}</span>}
                          {r.sizeM2 && <span>📐 {r.sizeM2}m²</span>}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="font-bold justify-center flex items-center text-slate-900 dark:text-white">
                          {r.currency || "USD"} {r.pricePerNight || 0}
                          <span className="text-[11px] text-slate-400 font-semibold ml-1">/ {t("bk_night")}</span>
                        </div>
                        {r.discount > 0 && (
                          <div className="text-[10px] text-center font-black uppercase text-amber-600 dark:text-amber-500 mt-0.5 tracking-wider">
                            {r.discount}% off
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${badge.cls}`}>
                          {t(`rm_status${(r.status || "available").charAt(0).toUpperCase() + (r.status || "available").slice(1)}`) || r.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <PermissionWrapper permission="rooms:edit">
                            <button onClick={() => openEdit(r)} className="h-8 w-8 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors" title={t("edit")}>
                              <Pencil size={14} strokeWidth={2.5} />
                            </button>
                          </PermissionWrapper>
                          <PermissionWrapper permission="rooms:delete">
                            <button onClick={() => setDeleteTarget(r._id)} className="h-8 w-8 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition-colors" title={t("delete")}>
                              <Trash2 size={14} strokeWidth={2.5} />
                            </button>
                          </PermissionWrapper>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-[12px] text-slate-400 font-semibold">{filtered.length} {filtered.length === 1 ? "room" : "rooms"}</p>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
