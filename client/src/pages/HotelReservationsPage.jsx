import { useMemo, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Download,
  Eye,
  Loader2,
  Printer,
  Search,
  Wallet,
  X,
} from "lucide-react";
import LoadingScreen from "../components/LoadingScreen";
import { useLanguage } from "../context/LanguageContext";
import {
  useGetBookingsQuery,
  useUpdateBookingMutation,
} from "../store/services/api";

const COPY = {
  en: {
    confirmedTitle: "Confirmed Reservations",
    confirmedSubtitle: "View and manage hotel reservations",
    pendingTitle: "Pending Reservations",
    pendingSubtitle: "Track booking stages and pending payments",
    searchPlaceholder: "Search by booking number or guest name...",
    all: "All",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    newBooking: "New",
    waitingTravky: "Travky Pay",
    bookingRef: "Booking #",
    guest: "Guest",
    dates: "Dates",
    amount: "Amount",
    confirmedBy: "Confirmed By",
    status: "Status",
    actions: "Actions",
    stage: "Stage",
    view: "View",
    receiptTitle: "Payment Receipt",
    bookingDetails: "Booking Details",
    dueToHotel: "Amount Due to Hotel",
    netPrice: "Net price",
    paymentMethod: "Payment method",
    paymentRef: "Payment reference",
    print: "Print",
    downloadPdf: "Download PDF",
    nightsCount: "Number of nights",
    guestLabel: "Guest",
    emailLabel: "Email",
    checkIn: "Check-in",
    checkOut: "Check-out",
    empty: "No reservations found.",
    system: "System",
    manual: "Manual",
    pendingDetails: "Stage details",
    confirmBooking: "Confirm booking",
    confirmPayment: "Confirm payment",
    waitingPayment: "Waiting for payment from Travky",
    readyForCheckIn: "Confirmed and ready for check-in",
    recentlyCreated: "Recently created and awaiting confirmation",
    bookingComplete: "Payment completed successfully",
    totalValue: "Total value",
    netLabel: "Net",
  },
  ar: {
    confirmedTitle: "الحجوزات المؤكدة",
    confirmedSubtitle: "عرض وإدارة حجوزات الفندق",
    pendingTitle: "الحجوزات المعلقة",
    pendingSubtitle: "متابعة مراحل الحجز والمدفوعات المعلقة",
    searchPlaceholder: "بحث برقم الحجز أو اسم الضيف...",
    all: "الكل",
    confirmed: "مؤكد",
    cancelled: "ملغي",
    newBooking: "جديد",
    waitingTravky: "دفع تراكفي",
    bookingRef: "رقم الحجز",
    guest: "الضيف",
    dates: "التاريخ",
    amount: "المبلغ",
    confirmedBy: "تأكيد بواسطة",
    status: "الحالة",
    actions: "الإجراءات",
    stage: "المرحلة",
    view: "عرض",
    receiptTitle: "سند دفع",
    bookingDetails: "تفاصيل الحجز",
    dueToHotel: "المبلغ المستحق للفندق",
    netPrice: "صافي السعر",
    paymentMethod: "طريقة الدفع",
    paymentRef: "الرقم المرجعي للدفع",
    print: "طباعة",
    downloadPdf: "تحميل PDF",
    nightsCount: "عدد الليالي",
    guestLabel: "الضيف",
    emailLabel: "البريد",
    checkIn: "تسجيل الدخول",
    checkOut: "تسجيل الخروج",
    empty: "لا توجد حجوزات مطابقة.",
    system: "System",
    manual: "Manual",
    pendingDetails: "تفاصيل المرحلة",
    confirmBooking: "تأكيد الحجز",
    confirmPayment: "تأكيد الدفع",
    waitingPayment: "في انتظار الدفع من تراكفي",
    readyForCheckIn: "تم التأكيد وجاهز لتسجيل الدخول",
    recentlyCreated: "تم إنشاء الحجز وينتظر التأكيد",
    bookingComplete: "تمت عملية الدفع بنجاح",
    totalValue: "القيمة",
    netLabel: "صافي",
  },
};

const STATUS_CFG = {
  pending:     { bg: "#fef3c7", text: "#92400e", en: "Pending",     ar: "معلق" },
  confirmed:   { bg: "#172554", text: "#fff",    en: "Confirmed",   ar: "مؤكد" },
  checked_in:  { bg: "#172554", text: "#fff",    en: "Checked In",  ar: "دخل" },
  checked_out: { bg: "#172554", text: "#fff",    en: "Checked Out", ar: "مكتمل" },
  cancelled:   { bg: "#ef4444", text: "#fff",    en: "Cancelled",   ar: "ملغي" },
  no_show:     { bg: "#e5e7eb", text: "#475569", en: "No Show",     ar: "عدم حضور" },
};

function fmtDate(v) {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("en-CA");
}

function sourceLabel(booking, copy) {
  return booking.source === "online" || booking.confirmationSource === "travky"
    ? copy.system
    : copy.manual;
}

function getPendingStage(booking, copy) {
  if (booking.paymentStatus === "paid" || booking.status === "checked_out") {
    return { badge: copy.confirmed, desc: copy.bookingComplete,    step: 4, badgeBg: "#d1fae5", badgeColor: "#065f46" };
  }
  if (booking.status === "confirmed" || booking.status === "checked_in") {
    const isTravky = booking.source === "online" && booking.paymentStatus !== "paid";
    return {
      badge: isTravky ? copy.waitingTravky : copy.confirmed,
      desc:  isTravky ? copy.waitingPayment : copy.readyForCheckIn,
      step: isTravky ? 3 : 2,
      badgeBg: isTravky ? "#ede9fe" : "#dbeafe",
      badgeColor: isTravky ? "#5b21b6" : "#1d4ed8",
    };
  }
  return { badge: copy.newBooking, desc: copy.recentlyCreated, step: 1, badgeBg: "#fef9c3", badgeColor: "#92400e" };
}

function StatusBadge({ booking, lang }) {
  const cfg = STATUS_CFG[booking.status] || STATUS_CFG.pending;
  return (
    <span
      className="inline-flex items-center justify-center rounded-full px-4 py-1.5 text-[13px] font-black"
      style={{ backgroundColor: cfg.bg, color: cfg.text, minWidth: 72 }}
    >
      {lang === "ar" ? cfg.ar : cfg.en}
    </span>
  );
}

function StepPipeline({ step }) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4].map((s, i) => {
        const done = s <= step;
        return (
          <div key={s} className="flex items-center">
            {done ? (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1e3a5f]">
                <CheckCircle2 size={11} strokeWidth={3} className="text-white" />
              </span>
            ) : (
              <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-300 bg-white" />
            )}
            {i < 3 && (
              <span className="block h-[2px] w-5" style={{ backgroundColor: s < step ? "#1e3a5f" : "#d1d5db" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ReceiptModal({ booking, copy, onClose }) {
  if (!booking) return null;

  const printFn = () => {
    const w = window.open("", "_blank", "width=860,height=700");
    if (!w) return;
    const amt = `${booking.currency || "USD"} ${Number(booking.total || 0).toLocaleString()}`;
    w.document.write(`<!DOCTYPE html><html><head><title>${booking.reference}</title>
      <style>*{box-sizing:border-box}body{font-family:Arial,sans-serif;padding:28px;color:#0f172a;direction:rtl}
      .card{border:1px solid #cbd5e1;border-radius:14px;padding:20px;margin-bottom:16px}
      .ref{font-size:26px;font-weight:900;color:#173f78;text-align:center}.label{color:#64748b;font-size:13px}
      .value{font-weight:700;font-size:14px}.green{background:#ecfdf5;border-color:#86efac}
      table{width:100%}td{padding:6px 0}</style></head><body>
      <div class="card"><div class="label" style="text-align:center">${copy.receiptTitle}</div><div class="ref">${booking.reference}</div></div>
      <div class="card"><h3>${copy.bookingDetails}</h3><table>
        <tr><td class="label">${copy.guestLabel}</td><td class="value">${booking.customerName || "—"}</td></tr>
        <tr><td class="label">${copy.emailLabel}</td><td class="value">${booking.customerEmail || "—"}</td></tr>
        <tr><td class="label">${copy.checkIn}</td><td class="value">${fmtDate(booking.checkIn)}</td></tr>
        <tr><td class="label">${copy.checkOut}</td><td class="value">${fmtDate(booking.checkOut)}</td></tr>
        <tr><td class="label">${copy.nightsCount}</td><td class="value">${booking.nights || 0}</td></tr>
      </table></div>
      <div class="card green"><div style="font-size:12px;color:#065f46;text-align:left">${copy.dueToHotel}</div>
        <div style="font-size:32px;font-weight:900;color:#065f46">${amt}</div>
        <table style="margin-top:12px">
          <tr><td class="label">${copy.paymentMethod}</td><td class="value">${booking.paymentMethod || "—"}</td></tr>
          <tr><td class="label">${copy.paymentRef}</td><td class="value">${booking.paymentReference || booking.reference || "—"}</td></tr>
        </table>
      </div></body></html>`);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 300);
  };

  return (
    <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/60 p-4" dir="rtl">
      <div className="w-full max-w-[480px] rounded-[24px] bg-white shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-1">
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={18} strokeWidth={2.5} />
          </button>
          <h2 className="text-[22px] font-black text-slate-900">{copy.receiptTitle}</h2>
        </div>
        <div className="space-y-4 px-6 py-4">
          {/* ref card */}
          <div className="rounded-[18px] border border-slate-200 bg-slate-50 py-5 text-center">
            <p className="text-[13px] text-slate-400">{copy.receiptTitle}</p>
            <p className="mt-1 text-[26px] font-black" style={{ color: "#173f78" }}>{booking.reference}</p>
          </div>
          {/* details */}
          <div className="rounded-[18px] border border-slate-200 px-5 py-4">
            <p className="mb-3 text-[15px] font-black text-slate-900">{copy.bookingDetails}</p>
            <div className="grid grid-cols-2 gap-y-2.5 text-[14px]">
              {[
                [copy.guestLabel,   booking.customerName  || "—"],
                [copy.emailLabel,   booking.customerEmail || "—"],
                [copy.checkIn,      fmtDate(booking.checkIn)],
                [copy.checkOut,     fmtDate(booking.checkOut)],
                [copy.nightsCount,  String(booking.nights || 0)],
              ].map(([label, value], idx) => (
                <><span key={idx + "l"} className="text-slate-400">{label}</span><span key={idx + "v"} className="font-semibold text-slate-900">{value}</span></>
              ))}
            </div>
          </div>
          {/* amount */}
          <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-5 py-4">
            <p className="text-end text-[13px] font-black text-emerald-700">{copy.dueToHotel}</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-[28px] font-black text-emerald-700">{booking.currency || "USD"} {Number(booking.total || 0).toLocaleString()}</p>
              <p className="text-[14px] font-bold text-emerald-600">{copy.netPrice}</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-y-2 text-[13px]">
              <span className="text-slate-400">{copy.paymentMethod}</span>
              <span className="font-semibold text-slate-800">{booking.paymentMethod || "—"}</span>
              <span className="text-slate-400">{copy.paymentRef}</span>
              <span className="font-semibold text-slate-800">{booking.paymentReference || booking.reference || "—"}</span>
            </div>
          </div>
          {/* buttons */}
          <div className="grid grid-cols-2 gap-3 pb-2">
            <button onClick={printFn} className="flex h-12 items-center justify-center gap-2 rounded-[14px] border border-slate-200 text-[14px] font-black text-slate-800 hover:bg-slate-50 transition-colors">
              <Download size={17} /> {copy.downloadPdf}
            </button>
            <button onClick={printFn} className="flex h-12 items-center justify-center gap-2 rounded-[14px] border border-slate-200 text-[14px] font-black text-slate-800 hover:bg-slate-50 transition-colors">
              <Printer size={17} /> {copy.print}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HotelReservationsPage({ mode = "confirmed" }) {
  const { lang, dir } = useLanguage();
  const copy = COPY[lang] || COPY.en;
  const isRtl = dir === "rtl";

  const { data: bookings = [], isLoading } = useGetBookingsQuery();
  const [updateBooking, { isLoading: updating }] = useUpdateBookingMutation();
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pendingFilter, setPendingFilter] = useState("all");
  const [expandedId, setExpandedId]     = useState(null);
  const [receipt, setReceipt]           = useState(null);

  const hotelBks = useMemo(() =>
    [...bookings]
      .filter((b) => (b.bookingType || "hotel") === "hotel")
      .sort((a, b) => new Date(b.bookingDate || b.createdAt || 0) - new Date(a.bookingDate || a.createdAt || 0)),
    [bookings],
  );

  const confirmedList = hotelBks.filter(
    (b) => ["confirmed", "checked_in", "checked_out", "cancelled"].includes(b.status),
  );
  const pendingList = hotelBks.filter(
    (b) => !["checked_out", "cancelled", "no_show"].includes(b.status),
  );

  const counts = {
    all:       pendingList.length,
    new:       pendingList.filter((b) => b.status === "pending").length,
    confirmed: pendingList.filter((b) => b.status === "confirmed").length,
    travky:    pendingList.filter((b) => b.source === "online" && b.paymentStatus !== "paid").length,
  };
  const totalValue = pendingList.reduce((s, b) => s + Number(b.total || 0), 0);

  const matchSearch = (b) => {
    const q = search.trim().toLowerCase();
    return !q || [b.reference, b.customerName, b.customerEmail].some((v) => String(v || "").toLowerCase().includes(q));
  };

  const shownConfirmed = confirmedList.filter((b) => {
    if (!matchSearch(b)) return false;
    return statusFilter === "all" || b.status === statusFilter;
  });

  const shownPending = pendingList.filter((b) => {
    if (!matchSearch(b)) return false;
    if (pendingFilter === "new")       return b.status === "pending";
    if (pendingFilter === "confirmed") return b.status === "confirmed";
    if (pendingFilter === "travky")    return b.source === "online" && b.paymentStatus !== "paid";
    return true;
  });

  const handleConfirm = (b) => updateBooking({ _id: b._id, status: "confirmed" }).unwrap();
  const handlePay     = (b) => updateBooking({ _id: b._id, paymentStatus: "paid", paidAmount: Number(b.total || 0) }).unwrap();

  if (isLoading) return <LoadingScreen />;

  const TABS = [
    { key: "all",       label: `${copy.all} ${counts.all}` },
    { key: "new",       label: `${copy.newBooking} ${counts.new}` },
    { key: "confirmed", label: `${copy.confirmed} ${counts.confirmed}` },
    { key: "travky",    label: `${copy.waitingTravky} ${counts.travky}` },
  ];

  return (
    <div className="space-y-5 pb-10" style={{ direction: isRtl ? "rtl" : "ltr" }}>

      {/* Page header */}
      <div className="flex items-start" style={{ justifyContent: isRtl ? "flex-end" : "flex-start" }}>
        <div className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
          <div className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[16px] bg-slate-100 text-slate-600">
            {mode === "confirmed" ? <BadgeCheck size={24} /> : <Clock3 size={24} />}
          </div>
          <div style={{ textAlign: isRtl ? "right" : "left" }}>
            <h1 className="text-[28px] font-black leading-tight text-slate-900">
              {mode === "confirmed" ? copy.confirmedTitle : copy.pendingTitle}
            </h1>
            <p className="mt-0.5 text-[14px] text-slate-400">
              {mode === "confirmed" ? copy.confirmedSubtitle : copy.pendingSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* ── CONFIRMED ── */}
      {mode === "confirmed" && (
        <>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-[52px] w-full rounded-[14px] border border-slate-200 bg-white px-4 text-[15px] text-slate-700 outline-none focus:border-[#173f78] md:w-[200px]"
            >
              <option value="all">{copy.all}</option>
              <option value="confirmed">{copy.confirmed}</option>
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
              <option value="cancelled">{copy.cancelled}</option>
            </select>
            <div className="relative flex-1">
              <Search size={16} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRtl ? "left-4" : "right-4"}`} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={copy.searchPlaceholder}
                className="h-[52px] w-full rounded-[14px] border border-slate-200 bg-white px-5 text-[15px] text-slate-700 placeholder-slate-400 outline-none focus:border-[#173f78] transition-colors" />
            </div>
          </div>

          <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
                <thead>
                  <tr className="border-b border-slate-100">
                    {[copy.bookingRef, copy.guest, copy.dates, copy.amount, copy.confirmedBy, copy.status, copy.actions].map((h) => (
                      <th key={h} className="px-5 py-4 text-center text-[14px] font-black text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shownConfirmed.map((b, i) => (
                    <tr key={b._id} className="transition-colors hover:bg-slate-50"
                      style={{ borderTop: i === 0 ? "none" : "1px solid #f1f5f9" }}>
                      <td className="px-5 py-5 text-center">
                        <span className="text-[14px] font-black" style={{ color: "#173f78" }}>{b.reference || "—"}</span>
                      </td>
                      <td className="px-5 py-5 text-center">
                        <div className="text-[15px] font-bold text-slate-900">{b.customerName || "—"}</div>
                        <div className="mt-0.5 text-[13px] text-slate-400">{b.customerEmail || ""}</div>
                      </td>
                      <td className="px-5 py-5 text-center text-[14px] text-slate-500">
                        {fmtDate(b.checkIn)} → {fmtDate(b.checkOut)}
                      </td>
                      <td className="px-5 py-5 text-center">
                        <div className="text-[16px] font-black text-slate-900">{b.currency || "USD"} {Number(b.total || 0).toLocaleString()}</div>
                        <div className="text-[12px] text-slate-400">{copy.netLabel}</div>
                      </td>
                      <td className="px-5 py-5 text-center text-[14px] text-slate-500">
                        <div>{sourceLabel(b, copy)}</div>
                        <div className="mt-1 text-[18px]">🗂️</div>
                      </td>
                      <td className="px-5 py-5 text-center"><StatusBadge booking={b} lang={lang} /></td>
                      <td className="px-5 py-5 text-center">
                        <button onClick={() => setReceipt(b)}
                          className="inline-flex items-center gap-1.5 text-[14px] font-black text-slate-700 hover:text-[#173f78] transition-colors">
                          <Eye size={17} strokeWidth={2.5} /> {copy.view}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {shownConfirmed.length === 0 && (
              <p className="py-12 text-center text-[14px] text-slate-400">{copy.empty}</p>
            )}
          </div>
        </>
      )}

      {/* ── PENDING ── */}
      {mode === "pending" && (
        <>
          {/* stats row */}
          <div className={`flex flex-wrap items-center justify-between gap-2`}>
            <div className="flex items-center gap-2 rounded-[14px] border border-slate-200 bg-white px-4 py-2.5">
              <span className="text-[14px] text-slate-400">{copy.totalValue}:</span>
              <span className="text-[15px] font-black text-slate-900">{pendingList[0]?.currency || "USD"} {totalValue.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock3 size={18} className="text-slate-400" />
              <span className="text-[16px] font-black text-slate-800">{shownPending.length} {copy.pendingTitle}</span>
            </div>
          </div>

          {/* tabs + search */}
          <div className={`flex flex-wrap items-center gap-3 ${isRtl ? "justify-between flex-row-reverse" : "justify-between"}`}>
            <div className="flex flex-wrap items-center gap-2">
              {TABS.map(({ key, label }) => {
                const active = pendingFilter === key;
                return (
                  <button key={key} onClick={() => setPendingFilter(key)}
                    className="rounded-full px-4 py-2 text-[13px] font-bold transition-all"
                    style={active
                      ? { backgroundColor: "#173f78", color: "#fff", border: "1.5px solid transparent" }
                      : { backgroundColor: "#f8fafc", color: "#475569", border: "1.5px solid #e5e7eb" }}>
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="relative min-w-[220px]">
              <Search size={15} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRtl ? "left-3" : "right-3"}`} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={copy.searchPlaceholder}
                className="h-[44px] w-full rounded-[12px] border border-slate-200 bg-white px-4 text-[14px] placeholder-slate-400 outline-none" />
            </div>
          </div>

          {/* table */}
          <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
                <thead>
                  <tr className="border-b border-slate-100">
                    {["#", copy.guest, copy.dates, copy.amount, copy.stage].map((h) => (
                      <th key={h} className="px-5 py-4 text-center text-[14px] font-black text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shownPending.map((b, i) => {
                    const stage   = getPendingStage(b, copy);
                    const isOpen  = expandedId === b._id;
                    return (
                      <>
                        <tr key={b._id} className="transition-colors hover:bg-slate-50"
                          style={{ borderTop: i === 0 ? "none" : "1px solid #f1f5f9" }}>
                          <td className="px-4 py-4">
                            <div className={`flex flex-col items-center gap-1`}>
                              <button onClick={() => setExpandedId(isOpen ? null : b._id)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                              <span className="text-[11px] font-mono text-slate-400">{(b.reference || "").slice(0,12)}</span>
                            </div>
                          </td>
                          <td className="px-5 py-5 text-center">
                            <div className="text-[15px] font-bold text-slate-900">{b.customerName || "—"}</div>
                            <div className="mt-0.5 text-[13px] text-slate-400">{b.customerEmail || ""}</div>
                          </td>
                          <td className="px-5 py-5 text-center text-[14px] text-slate-500">
                            {fmtDate(b.checkIn)} → {fmtDate(b.checkOut)}
                          </td>
                          <td className="px-5 py-5 text-center">
                            <div className="text-[16px] font-black text-slate-900">{b.currency || "USD"} {Number(b.total || 0).toLocaleString()}</div>
                          </td>
                          <td className="px-5 py-5">
                            <div className="flex items-center justify-center gap-3">
                              <span className="rounded-full px-3 py-1 text-[12px] font-black"
                                style={{ backgroundColor: stage.badgeBg, color: stage.badgeColor }}>
                                {stage.badge}
                              </span>
                              <StepPipeline step={stage.step} />
                            </div>
                          </td>
                        </tr>

                        {isOpen && (
                          <tr key={b._id + "-exp"} style={{ borderTop: "1px solid #f1f5f9" }}>
                            <td colSpan={5} className="px-6 py-4 bg-[#f8faff]">
                              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                  <p className="text-[13px] text-slate-400">{copy.pendingDetails}</p>
                                  <p className="mt-0.5 text-[14px] font-semibold text-slate-700">{stage.desc}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <button onClick={() => setReceipt(b)}
                                    className="inline-flex h-[38px] items-center gap-1.5 rounded-[10px] border border-slate-200 px-4 text-[13px] font-bold text-slate-700 hover:bg-white transition-colors">
                                    <Eye size={15} /> {copy.view}
                                  </button>
                                  {b.status === "pending" && (
                                    <button onClick={() => handleConfirm(b)} disabled={updating}
                                      className="inline-flex h-[38px] items-center gap-1.5 rounded-[10px] px-4 text-[13px] font-bold text-white"
                                      style={{ backgroundColor: "#173f78", opacity: updating ? 0.7 : 1 }}>
                                      {updating && <Loader2 size={13} className="animate-spin" />}
                                      <BadgeCheck size={15} /> {copy.confirmBooking}
                                    </button>
                                  )}
                                  {b.paymentStatus !== "paid" && (
                                    <button onClick={() => handlePay(b)} disabled={updating}
                                      className="inline-flex h-[38px] items-center gap-1.5 rounded-[10px] px-4 text-[13px] font-bold text-white"
                                      style={{ backgroundColor: "#8b5cf6", opacity: updating ? 0.7 : 1 }}>
                                      {updating && <Loader2 size={13} className="animate-spin" />}
                                      <Wallet size={15} /> {copy.confirmPayment}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {shownPending.length === 0 && (
              <p className="py-12 text-center text-[14px] text-slate-400">{copy.empty}</p>
            )}
          </div>
        </>
      )}

      <ReceiptModal booking={receipt} copy={copy} onClose={() => setReceipt(null)} />
    </div>
  );
}
