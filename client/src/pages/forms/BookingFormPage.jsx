import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BookingFormModal from "../../components/BookingFormModal";
import {
  useCreateBookingMutation,
  useUpdateBookingMutation,
} from "../../store/services/api";
import { useLanguage } from "../../context/LanguageContext";

export default function BookingFormPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { t, dir } = useLanguage();
  const isRtl = dir === "rtl";
  const booking = state?.booking || null;
  const backTo = state?.backTo || -1;

  const [createBooking] = useCreateBookingMutation();
  const [updateBooking] = useUpdateBookingMutation();

  const handleSave = async (data) => {
    if (booking?._id) {
      await updateBooking({ _id: booking._id, ...data }).unwrap();
    } else {
      await createBooking(data).unwrap();
    }
    navigate(backTo);
  };

  const handleClose = () => navigate(backTo);

  return (
    <div className="w-full space-y-6 pb-10 animate-in fade-in duration-300" style={{ direction: isRtl ? "rtl" : "ltr" }}>
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-500 font-bold mb-2 uppercase tracking-wide text-[12px]">
            <span>{t("dashboard")}</span>
            <span className="opacity-50 text-[10px]">▶</span>
            <span className="text-blue-600 dark:text-blue-400">{t("bookings")}</span>
          </div>
          <h1 className="m-0 text-slate-900 dark:text-white text-3xl md:text-4xl font-black tracking-tight">
            {booking ? t("bk_editTitle") : t("bk_addTitle")}
          </h1>
        </div>
        <button
          onClick={handleClose}
          className="h-11 px-5 rounded-2xl font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-all text-[14px] shrink-0"
        >
          <ArrowLeft size={16} className={isRtl ? "rotate-180" : ""} />
          {isRtl ? "رجوع" : "Back"}
        </button>
      </div>

      <BookingFormModal
        open={true}
        pageMode={true}
        onClose={handleClose}
        onSave={handleSave}
        booking={booking}
      />
    </div>
  );
}
