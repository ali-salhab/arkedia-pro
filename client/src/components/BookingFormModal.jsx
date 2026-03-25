import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useGetRoomsQuery } from "../store/services/api";
import {
  User, Mail, Phone, Globe, Users, Baby, CalendarDays, BedDouble,
  DollarSign, CreditCard, FileText, AlertCircle, Loader2,
  ChevronDown, CheckCircle2, X, Building2, UtensilsCrossed, Target,
  Hash, Moon, Percent, Wallet, ReceiptText, ArrowRight, Clipboard
} from "lucide-react";

const EMPTY_FORM = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  nationality: "",
  adultsCount: 1,
  childrenCount: 0,
  bookingType: "hotel",
  checkIn: "",
  checkOut: "",
  roomId: "",
  roomNumber: "",
  pricePerNight: 0,
  discount: 0,
  taxRate: 0,
  currency: "USD",
  paymentMethod: "cash",
  paymentStatus: "unpaid",
  paidAmount: 0,
  status: "pending",
  source: "direct",
  specialRequests: "",
  internalNotes: "",
  customerNotes: "",
};

const STATUS_CONFIG = {
  pending:    { label: "PENDING",     cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  confirmed:  { label: "CONFIRMED",   cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  checked_in: { label: "CHECKED IN",  cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  checked_out:{ label: "CHECKED OUT", cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  cancelled:  { label: "CANCELLED",   cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  no_show:    { label: "NO SHOW",     cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
};

const PAYMENT_STATUS_CONFIG = {
  unpaid:   { label: "UNPAID",   cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  partial:  { label: "PARTIAL",  cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  paid:     { label: "PAID",     cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  refunded: { label: "REFUNDED", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
};

function generateRef() {
  return "BK-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).substr(2, 4).toUpperCase();
}

function nightsBetween(ci, co) {
  if (!ci || !co) return 0;
  return Math.max(0, Math.round((new Date(co) - new Date(ci)) / 86400000));
}

const inputCls = "w-full px-4 py-3.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 text-[15px]"; 
const labelCls = "block text-[13px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2";
const sectionTitleCls = "text-[14px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3 mb-5 flex items-center gap-2";

export default function BookingFormModal({ open, onClose, onSave, booking = null, pageMode = false }) {
  const { dir, t } = useLanguage();
  const isRtl = dir === "rtl";
  const [form, setForm] = useState(EMPTY_FORM);
  const [tab, setTab] = useState("guest");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { data: rooms = [] } = useGetRoomsQuery();
  const availableRooms = rooms.filter((r) => r.status === "available" || (booking && r._id === booking.roomId));

  useEffect(() => {
    if (booking) {
      setForm({
        ...EMPTY_FORM,
        ...booking,
        checkIn: booking.checkIn ? booking.checkIn.slice(0, 10) : "",
        checkOut: booking.checkOut ? booking.checkOut.slice(0, 10) : "",
      });
    } else {
      setForm({ ...EMPTY_FORM });
    }
    setTab("guest");
    setError("");
  }, [booking, open]);

  if (!open && !pageMode) return null;

  const set = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const nights = nightsBetween(form.checkIn, form.checkOut);
  const baseTotal = Number(form.pricePerNight || 0) * nights;
  const discountAmt = baseTotal * (Number(form.discount || 0) / 100);
  const subtotal = baseTotal - discountAmt;
  const taxAmt = subtotal * (Number(form.taxRate || 0) / 100);
  const grandTotal = subtotal + taxAmt;
  const balance = grandTotal - Number(form.paidAmount || 0);

  const handleRoomSelect = (e) => {
    const rid = e.target.value;
    const rm = rooms.find((r) => r._id === rid);
    setForm((p) => ({
      ...p,
      roomId: rid,
      roomNumber: rm?.number || "",
      pricePerNight: rm?.pricePerNight || 0,
      currency: rm?.currency || p.currency,
    }));
  };

  const handleSubmit = async () => {
    if (!form.customerName.trim()) { setError(t("bk_errName")); setTab("guest"); return; }
    if (!form.checkIn) { setError(t("bk_errCheckIn")); setTab("stay"); return; }
    if (!form.checkOut) { setError(t("bk_errCheckOut")); setTab("stay"); return; }
    if (new Date(form.checkOut) <= new Date(form.checkIn)) { setError(t("bk_errDates")); setTab("stay"); return; }
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        reference: booking?.reference || generateRef(),
        bookingDate: booking?.bookingDate || new Date().toISOString(),
        nights,
        total: grandTotal,
        adultsCount: Number(form.adultsCount),
        childrenCount: Number(form.childrenCount),
        pricePerNight: Number(form.pricePerNight),
        discount: Number(form.discount),
        taxRate: Number(form.taxRate),
        paidAmount: Number(form.paidAmount),
      };
      await onSave(payload);
      onClose();
    } catch (e) {
      setError(e?.data?.message || t("bk_errSave"));
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: "guest",   label: t("bk_tabGuest"),   Icon: User },
    { id: "stay",    label: t("bk_tabStay"),    Icon: BedDouble },
    { id: "payment", label: t("bk_tabPayment"), Icon: CreditCard },
    { id: "notes",   label: t("bk_tabNotes"),   Icon: FileText },
  ];

  const statusConf = STATUS_CONFIG[form.status] || STATUS_CONFIG.pending;
  const payConf = PAYMENT_STATUS_CONFIG[form.paymentStatus] || PAYMENT_STATUS_CONFIG.unpaid;

  const innerContent = (
    <div className={`bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl w-full ${pageMode ? "" : "max-w-[760px] max-h-[92vh] flex flex-col rounded-3xl shadow-2xl"} rounded-3xl border border-slate-200/60 dark:border-slate-800/50`} style={{ direction: isRtl ? "rtl" : "ltr" }}>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-8 pt-7 pb-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-black text-slate-900 dark:text-white text-2xl m-0">
              {booking ? t("bk_editTitle") : t("bk_addTitle")}
            </h2>
            <span className={`text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${statusConf.cls}`}>
              {statusConf.label}
            </span>
            <span className={`text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${payConf.cls}`}>
              {payConf.label}
            </span>
          </div>
          {booking?.reference && (
            <div className="mt-1.5 text-slate-400 dark:text-slate-500 text-[12px] font-mono font-bold flex items-center gap-1.5">
              <Hash size={12} /> {booking.reference}
            </div>
          )}
        </div>
        {!pageMode && (
          <button onClick={onClose} className="h-9 w-9 shrink-0 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-red-100 hover:text-red-500 transition-colors">
            <X size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 px-8 pt-4 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800 flex-wrap shrink-0">
        {TABS.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-[14px] font-bold transition-all border-b-2 -mb-px ${
              tab === tb.id
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-blue-500 shadow-sm"
                : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <tb.Icon size={15} strokeWidth={2.5} /> {tb.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className={`overflow-y-auto px-8 py-7 flex-1`}>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-2xl text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-3">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* ── GUEST TAB ── */}
        {tab === "guest" && (
          <div className="flex flex-col gap-6">
            <p className={sectionTitleCls}><User size={15}/> {t("bk_secGuestInfo")}</p>
            <div>
              <label className={labelCls}>{t("bk_fieldName")} *</label>
              <div className="relative">
                <User size={16} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                <input className={`${inputCls} ${isRtl ? 'pr-11' : 'pl-11'}`} value={form.customerName} onChange={(e) => set("customerName", e.target.value)} placeholder="e.g. John Smith" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>{t("bk_fieldEmail")}</label>
                <div className="relative">
                  <Mail size={16} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                  <input className={`${inputCls} ${isRtl ? 'pr-11' : 'pl-11'}`} type="email" value={form.customerEmail} onChange={(e) => set("customerEmail", e.target.value)} placeholder="john@email.com" />
                </div>
              </div>
              <div>
                <label className={labelCls}>{t("bk_fieldPhone")}</label>
                <div className="relative">
                  <Phone size={16} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                  <input className={`${inputCls} ${isRtl ? 'pr-11' : 'pl-11'}`} type="tel" value={form.customerPhone} onChange={(e) => set("customerPhone", e.target.value)} placeholder="+1 555 000 0000" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>{t("bk_fieldNationality")}</label>
                <div className="relative">
                  <Globe size={16} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                  <input className={`${inputCls} ${isRtl ? 'pr-11' : 'pl-11'}`} value={form.nationality} onChange={(e) => set("nationality", e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelCls}>{t("bk_fieldSource")}</label>
                <select className={inputCls} value={form.source} onChange={(e) => set("source", e.target.value)}>
                  <option value="direct">{t("bk_srcDirect")}</option>
                  <option value="online">{t("bk_srcOnline")}</option>
                  <option value="phone">{t("bk_srcPhone")}</option>
                  <option value="walk_in">{t("bk_srcWalkIn")}</option>
                  <option value="agency">{t("bk_srcAgency")}</option>
                </select>
              </div>
            </div>

            <p className={sectionTitleCls}><Users size={15}/> {t("bk_secGuestCount")}</p>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>{t("bk_fieldAdults")}</label>
                <div className="relative">
                  <Users size={16} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                  <input className={`${inputCls} ${isRtl ? 'pr-11' : 'pl-11'}`} type="number" min="1" max="20" value={form.adultsCount} onChange={(e) => set("adultsCount", e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelCls}>{t("bk_fieldChildren")}</label>
                <div className="relative">
                  <Baby size={16} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                  <input className={`${inputCls} ${isRtl ? 'pr-11' : 'pl-11'}`} type="number" min="0" max="10" value={form.childrenCount} onChange={(e) => set("childrenCount", e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STAY TAB ── */}
        {tab === "stay" && (
          <div className="flex flex-col gap-6">
            <p className={sectionTitleCls}><CalendarDays size={15}/> {t("bk_secStay")}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>{t("bk_fieldBookingType")}</label>
                <select className={inputCls} value={form.bookingType} onChange={(e) => set("bookingType", e.target.value)}>
                  <option value="hotel">{t("bk_typeHotel")}</option>
                  <option value="restaurant">{t("bk_typeRestaurant")}</option>
                  <option value="activity">{t("bk_typeActivity")}</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>{t("bk_fieldBookingStatus")}</label>
                <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
                  <option value="pending">{t("bk_statusPending")}</option>
                  <option value="confirmed">{t("bk_statusConfirmed")}</option>
                  <option value="checked_in">{t("bk_statusCheckedIn")}</option>
                  <option value="checked_out">{t("bk_statusCheckedOut")}</option>
                  <option value="cancelled">{t("bk_statusCancelled")}</option>
                  <option value="no_show">{t("bk_statusNoShow")}</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>{t("bk_fieldCheckIn")}</label>
                <input className={inputCls} type="date" value={form.checkIn} onChange={(e) => set("checkIn", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>{t("bk_fieldCheckOut")}</label>
                <input className={inputCls} type="date" value={form.checkOut} min={form.checkIn || undefined} onChange={(e) => set("checkOut", e.target.value)} />
              </div>
            </div>

            {nights > 0 && (
              <div className="flex items-center gap-3 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                <Moon size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="text-blue-800 dark:text-blue-300 font-black text-[15px]">
                  {t("bk_duration")}: {nights} {nights === 1 ? t("bk_night") : t("bk_nights")}
                </span>
              </div>
            )}

            <p className={sectionTitleCls}><BedDouble size={15}/> {t("bk_secRoom")}</p>
            <div>
              <label className={labelCls}>{t("bk_fieldSelectRoom")}</label>
              <select className={inputCls} value={form.roomId} onChange={handleRoomSelect}>
                <option value="">-- {t("bk_noRoomAssigned")} --</option>
                {availableRooms.map((r) => (
                  <option key={r._id} value={r._id}>
                    #{r.number} {r.name ? `— ${r.name}` : ""} ({r.type}) — {r.currency} {r.pricePerNight}/{t("bk_night")}
                  </option>
                ))}
              </select>
            </div>
            {form.roomId && (
              <div>
                <label className={labelCls}>{t("bk_fieldPricePerNight")}</label>
                <div className="relative">
                  <DollarSign size={16} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                  <input className={`${inputCls} ${isRtl ? 'pr-11' : 'pl-11'}`} type="number" min="0" value={form.pricePerNight} onChange={(e) => set("pricePerNight", e.target.value)} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PAYMENT TAB ── */}
        {tab === "payment" && (
          <div className="flex flex-col gap-6">
            <p className={sectionTitleCls}><CreditCard size={15}/> {t("bk_secPayment")}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>{t("bk_fieldPaymentMethod")}</label>
                <select className={inputCls} value={form.paymentMethod} onChange={(e) => set("paymentMethod", e.target.value)}>
                  <option value="cash">{t("bk_pmCash")}</option>
                  <option value="card">{t("bk_pmCard")}</option>
                  <option value="bank_transfer">{t("bk_pmBank")}</option>
                  <option value="online">{t("bk_pmOnline")}</option>
                  <option value="other">{t("bk_pmOther")}</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>{t("bk_fieldPaymentStatus")}</label>
                <select className={inputCls} value={form.paymentStatus} onChange={(e) => set("paymentStatus", e.target.value)}>
                  <option value="unpaid">{t("bk_psUnpaid")}</option>
                  <option value="partial">{t("bk_psPartial")}</option>
                  <option value="paid">{t("bk_psPaid")}</option>
                  <option value="refunded">{t("bk_psRefunded")}</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>{t("bk_fieldDiscount")} (%)</label>
                <div className="relative">
                  <Percent size={16} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                  <input className={`${inputCls} ${isRtl ? 'pr-11' : 'pl-11'}`} type="number" min="0" max="100" value={form.discount} onChange={(e) => set("discount", e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelCls}>{t("bk_fieldTaxRate")} (%)</label>
                <div className="relative">
                  <Percent size={16} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                  <input className={`${inputCls} ${isRtl ? 'pr-11' : 'pl-11'}`} type="number" min="0" max="100" value={form.taxRate} onChange={(e) => set("taxRate", e.target.value)} />
                </div>
              </div>
            </div>
            <div>
              <label className={labelCls}>{t("bk_fieldPaid")} ({form.currency})</label>
              <div className="relative max-w-xs">
                <Wallet size={16} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                <input className={`${inputCls} ${isRtl ? 'pr-11' : 'pl-11'}`} type="number" min="0" value={form.paidAmount} onChange={(e) => set("paidAmount", e.target.value)} />
              </div>
            </div>

            {/* Invoice summary */}
            <div className="p-6 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-200 dark:border-emerald-800/50">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black text-[14px] uppercase tracking-widest mb-5">
                <ReceiptText size={16} /> {t("bk_summaryTitle")}
              </div>
              <div className="flex flex-col gap-3 text-[14px]">
                <div className="flex justify-between text-slate-600 dark:text-slate-400 font-medium">
                  <span>{t("bk_summaryNightsRate")}</span>
                  <span>{nights} × {form.currency} {Number(form.pricePerNight).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 font-medium">
                  <span>{t("bk_summarySubtotal")}</span>
                  <span>{form.currency} {baseTotal.toFixed(2)}</span>
                </div>
                {form.discount > 0 && (
                  <div className="flex justify-between text-red-600 dark:text-red-400 font-medium">
                    <span>{t("bk_summaryDiscount")} ({form.discount}%)</span>
                    <span>- {form.currency} {discountAmt.toFixed(2)}</span>
                  </div>
                )}
                {form.taxRate > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400 font-medium">
                    <span>{t("bk_summaryTax")} ({form.taxRate}%)</span>
                    <span>+ {form.currency} {taxAmt.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-[18px] text-emerald-700 dark:text-emerald-400 border-t border-emerald-200 dark:border-emerald-800 pt-4 mt-1">
                  <span>{t("bk_summaryTotal")}</span>
                  <span>{form.currency} {grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 font-medium">
                  <span>{t("bk_summaryPaid")}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{form.currency} {Number(form.paidAmount).toFixed(2)}</span>
                </div>
                <div className={`flex justify-between font-black text-[16px] border-t border-slate-200 dark:border-slate-700 pt-3 mt-1 ${balance > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                  <span>{t("bk_summaryBalance")}</span>
                  <span>{form.currency} {balance.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── NOTES TAB ── */}
        {tab === "notes" && (
          <div className="flex flex-col gap-6">
            <p className={sectionTitleCls}><FileText size={15}/> {t("bk_secNotes")}</p>
            <div>
              <label className={labelCls}>{t("bk_fieldSpecialReq")}</label>
              <textarea
                className={`${inputCls} min-h-[100px] resize-y`}
                value={form.specialRequests}
                onChange={(e) => set("specialRequests", e.target.value)}
                placeholder={t("bk_fieldSpecialReqPlaceholder")}
              />
            </div>
            <div>
              <label className={labelCls}>{t("bk_fieldGuestNotes")}</label>
              <textarea
                className={`${inputCls} min-h-[90px] resize-y`}
                value={form.customerNotes}
                onChange={(e) => set("customerNotes", e.target.value)}
                placeholder={t("bk_fieldGuestNotesPlaceholder")}
              />
            </div>
            <div>
              <label className={labelCls}>{t("bk_fieldInternalNotes")}</label>
              <textarea
                className={`${inputCls} min-h-[90px] resize-y`}
                value={form.internalNotes}
                onChange={(e) => set("internalNotes", e.target.value)}
                placeholder={t("bk_fieldInternalNotesPlaceholder")}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-4 px-8 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 rounded-b-3xl shrink-0">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-[13px] font-bold">
          {grandTotal > 0 && (
            <>
              <ReceiptText size={16} className="text-emerald-500" />
              {form.currency} {grandTotal.toFixed(2)} / {nights} {nights === 1 ? t("bk_night") : t("bk_nights")}
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!pageMode && (
            <button className="h-11 px-5 rounded-2xl font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-[14px]" onClick={onClose}>
              {t("cancel")}
            </button>
          )}
          <button
            className="h-11 px-7 rounded-2xl font-black text-[14px] flex items-center gap-2 group transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 disabled:opacity-60 disabled:shadow-none disabled:hover:translate-y-0"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <><Loader2 size={17} className="animate-spin" /> {t("saving")}</>
            ) : (
              <><CheckCircle2 size={17} strokeWidth={2.5} /> {booking ? t("bk_btnUpdate") : t("bk_btnCreate")}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (pageMode) {
    return (
      <div className="w-full animate-in fade-in duration-300" style={{ direction: isRtl ? "rtl" : "ltr" }}>
        {innerContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-start justify-center z-[1000] overflow-y-auto p-4 md:p-8 animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="my-auto w-full flex justify-center">
        {innerContent}
      </div>
    </div>
  );
}
