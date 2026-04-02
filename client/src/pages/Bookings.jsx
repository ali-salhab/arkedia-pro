import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import LoadingScreen from "../components/LoadingScreen";
import {
  useGetBookingsQuery,
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
} from "../store/services/api";
import PermissionWrapper from "../components/PermissionWrapper";
import {
  Plus, Search, Calendar, CheckCircle2, LogIn, AlertCircle,
  Pencil, Trash2, Hash, User, BedDouble, CalendarDays, DollarSign,
  ClipboardList, SlidersHorizontal, X
} from "lucide-react";

const STATUS_CONFIG = {
  pending:     { label: "Pending",     cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  confirmed:   { label: "Confirmed",   cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  checked_in:  { label: "Checked In",  cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  checked_out: { label: "Checked Out", cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  cancelled:   { label: "Cancelled",   cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  no_show:     { label: "No Show",     cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
};

const PAYMENT_CONFIG = {
  unpaid:   { label: "Unpaid",   cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  partial:  { label: "Partial",  cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  paid:     { label: "Paid",     cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  refunded: { label: "Refunded", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
};

function fmt(d) {
  return d ? new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";
}

export default function BookingsPage() {
  const { t, dir } = useLanguage();
  const isRtl = dir === "rtl";
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: bookings = [], isLoading } = useGetBookingsQuery();
  const [deleteBooking] = useDeleteBookingMutation();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (pathname.endsWith("/confirmed")) {
      setFilterStatus("confirmed");
      return;
    }

    if (pathname.endsWith("/pending")) {
      setFilterStatus("pending");
      return;
    }

    setFilterStatus("all");
  }, [pathname]);

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (b.customerName || "").toLowerCase().includes(q) ||
      (b.customerEmail || "").toLowerCase().includes(q) ||
      (b.reference || "").toLowerCase().includes(q) ||
      (b.roomNumber || "").toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    const matchPayment = filterPayment === "all" || b.paymentStatus === filterPayment;
    return matchSearch && matchStatus && matchPayment;
  });

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    checkedIn: bookings.filter((b) => b.status === "checked_in").length,
    unpaid: bookings.filter((b) => b.paymentStatus === "unpaid" || b.paymentStatus === "partial").length,
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    await deleteBooking(confirmDelete._id).unwrap();
    setConfirmDelete(null);
  };

  const openAdd = () => navigate("/bookings/new", { state: { backTo: pathname } });
  const openEdit = (b) => navigate(`/bookings/${b._id}/edit`, { state: { booking: b, backTo: pathname } });

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-300" style={{ direction: isRtl ? "rtl" : "ltr" }}>
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t("bookings")}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">{t("bkPage_subtitle") || "Manage all your reservations here."}</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={15} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
            <input
              className={`h-10 ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[13px] font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-56`}
              placeholder={t("bkPage_searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Status filter */}
          <select
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[13px] font-medium text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">{t("bkPage_allStatuses")}</option>
            <option value="pending">{t("bk_statusPending")}</option>
            <option value="confirmed">{t("bk_statusConfirmed")}</option>
            <option value="checked_in">{t("bk_statusCheckedIn")}</option>
            <option value="checked_out">{t("bk_statusCheckedOut")}</option>
            <option value="cancelled">{t("bk_statusCancelled")}</option>
            <option value="no_show">{t("bk_statusNoShow")}</option>
          </select>
          {/* Payment filter */}
          <select
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[13px] font-medium text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
          >
            <option value="all">{t("bkPage_allPayments")}</option>
            <option value="unpaid">{t("bk_psUnpaid")}</option>
            <option value="partial">{t("bk_psPartial")}</option>
            <option value="paid">{t("bk_psPaid")}</option>
            <option value="refunded">{t("bk_psRefunded")}</option>
          </select>
        </div>

        <PermissionWrapper permission="bookings:add">
          <button
            onClick={openAdd}
            className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 transition-all"
          >
            {t("bkPage_newBooking")}
          </button>
        </PermissionWrapper>
      </div>

      {/* Table / Empty */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white/60 dark:bg-slate-900/40 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ClipboardList size={28} className="text-slate-400" strokeWidth={1.5} />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-semibold text-[15px]">{t("bkPage_noBookings")}</p>
          <PermissionWrapper permission="bookings:add">
            <button onClick={openAdd} className="h-10 px-5 rounded-xl bg-blue-600 text-white font-bold text-[13px] flex items-center gap-2 shadow-md">
              {t("bkPage_newBooking")}
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
                    { label: t("bkPage_colRef"), Icon: Hash },
                    { label: t("bkPage_colGuest"), Icon: User },
                    { label: t("bkPage_colRoom"), Icon: BedDouble },
                    { label: t("bkPage_colCheckIn"), Icon: CalendarDays },
                    { label: t("bkPage_colCheckOut"), Icon: CalendarDays },
                    { label: t("bkPage_colTotal"), Icon: DollarSign },
                    { label: t("bkPage_colStatus") },
                    { label: t("bkPage_colPayment") },
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
                {filtered.map((b) => {
                  const sc = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                  const pc = PAYMENT_CONFIG[b.paymentStatus] || PAYMENT_CONFIG.unpaid;
                  return (
                    <tr key={b._id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                      <td className="px-4 py-4 text-center">
                        <span className="font-mono text-[12px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                          {b.reference || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <p className="font-bold text-slate-900 dark:text-white">{b.customerName}</p>
                        {b.customerEmail && <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5">{b.customerEmail}</p>}
                      </td>
                      <td className="px-4 py-4 text-center text-slate-600 dark:text-slate-400 font-semibold">
                        {b.roomNumber ? `#${b.roomNumber}` : "—"}
                      </td>
                      <td className="px-4 py-4 text-center text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">{fmt(b.checkIn)}</td>
                      <td className="px-4 py-4 text-center text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">{fmt(b.checkOut)}</td>
                      <td className="px-4 py-4 text-center font-black text-slate-900 dark:text-white whitespace-nowrap">
                        {b.currency || "USD"} {(b.total || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${sc.cls}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${pc.cls}`}>
                          {pc.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <PermissionWrapper permission="bookings:edit">
                            <button onClick={() => openEdit(b)} className="h-8 w-8 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors" title={t("edit")}>
                              <Pencil size={14} strokeWidth={2.5} />
                            </button>
                          </PermissionWrapper>
                          <PermissionWrapper permission="bookings:delete">
                            <button onClick={() => setConfirmDelete(b)} className="h-8 w-8 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition-colors" title={t("delete")}>
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
          {/* Footer row count */}
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-[12px] text-slate-400 font-semibold">{filtered.length} {filtered.length === 1 ? "booking" : "bookings"}</p>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[1100] p-4 animate-in fade-in duration-200">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-3xl border border-slate-200/60 dark:border-slate-800/50 shadow-2xl p-8 w-full max-w-sm">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-5">
              <Trash2 size={22} className="text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-[18px] font-black text-slate-900 dark:text-white mb-2">{t("bkPage_deleteBookingTitle")}</h3>
            <p className="text-slate-600 dark:text-slate-300 font-semibold mb-1">{confirmDelete.customerName}</p>
            {confirmDelete.reference && (
              <p className="font-mono text-[12px] text-slate-400 mb-4">{confirmDelete.reference}</p>
            )}
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-6">{t("roomsPage_deleteCannotUndo")}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 h-11 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-[14px]">
                {t("cancel")}
              </button>
              <button onClick={handleDeleteConfirm} className="flex-1 h-11 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-[14px] shadow-lg shadow-red-500/25 transition-colors">
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
