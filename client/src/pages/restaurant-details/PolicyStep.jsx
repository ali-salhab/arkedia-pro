import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Info } from "lucide-react";
import RestaurantDetailsStepBar from "../../components/RestaurantDetailsStepBar";
import { useLanguage } from "../../context/LanguageContext";

const STORAGE_KEY = "restaurant_details_policy";

function loadPolicy() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null") || {};
  } catch {
    return {};
  }
}

export default function RestaurantPolicyStep() {
  const navigate = useNavigate();
  const { lang: uiLang, dir } = useLanguage();
  const isAr = uiLang === "ar";

  const saved = loadPolicy();
  const [openingTime, setOpeningTime] = useState(saved.openingTime || "09:00");
  const [closingTime, setClosingTime] = useState(saved.closingTime || "23:00");
  const [reservationPolicy, setReservationPolicy] = useState(
    saved.reservationPolicy || "recommended",
  );
  const [smokingPolicy, setSmokingPolicy] = useState(
    saved.smokingPolicy || "no",
  );
  const [dresscode, setDresscode] = useState(saved.dresscode || "casual");
  const [additionalEn, setAdditionalEn] = useState(saved.additionalEn || "");
  const [additionalAr, setAdditionalAr] = useState(saved.additionalAr || "");

  const T = {
    en: {
      title: "Restaurant Policy",
      subtitle:
        "Set your restaurant's operational policies and guest guidelines.",
      openingTime: "Opening Time",
      closingTime: "Closing Time",
      reservation: "Reservation Policy",
      reservationOptions: {
        required: "Required",
        recommended: "Recommended",
        not_required: "Not Required",
      },
      smoking: "Smoking Policy",
      smokingOptions: {
        yes: "Allowed",
        no: "Not Allowed",
        outdoor_only: "Outdoor Only",
      },
      dresscode: "Dress Code",
      drescodeOptions: {
        casual: "Casual",
        smart_casual: "Smart Casual",
        formal: "Formal",
      },
      additionalEn: "Additional Notes (English)",
      additionalAr: "Additional Notes (Arabic)",
      additionalPlaceholder: "Any additional policies guests should know...",
      next: "Next -> Photos",
    },
    ar: {
      title: "سياسة المطعم",
      subtitle: "حدد سياسات التشغيل والإرشادات الخاصة بضيوف مطعمك.",
      openingTime: "وقت الفتح",
      closingTime: "وقت الإغلاق",
      reservation: "سياسة الحجز",
      reservationOptions: {
        required: "مطلوب",
        recommended: "مستحسن",
        not_required: "غير مطلوب",
      },
      smoking: "سياسة التدخين",
      smokingOptions: { yes: "مسموح", no: "ممنوع", outdoor_only: "خارجي فقط" },
      dresscode: "قواعد اللباس",
      drescodeOptions: {
        casual: "عادي",
        smart_casual: "شبه رسمي",
        formal: "رسمي",
      },
      additionalEn: "ملاحظات إضافية (الإنجليزية)",
      additionalAr: "ملاحظات إضافية (العربية)",
      additionalPlaceholder: "أي سياسات إضافية يجب أن يعلمها الضيوف...",
      next: "التالي -> الصور",
    },
  };

  const copy = T[uiLang] || T.en;

  const handleNext = () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        openingTime,
        closingTime,
        reservationPolicy,
        smokingPolicy,
        dresscode,
        additionalEn,
        additionalAr,
      }),
    );
    navigate("/restaurant/details/photos");
  };

  const fieldStyle = {
    color: "var(--text-secondary)",
    display: "block",
    marginBottom: "0.375rem",
    fontSize: "0.75rem",
    fontWeight: 600,
  };
  const rowClass = "grid grid-cols-1 gap-4 sm:grid-cols-2";

  const Select = ({ label, value, onChange, options }) => (
    <div>
      <label style={fieldStyle}>{label}</label>
      <select
        className="select w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {Object.entries(options).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="page-shell">
      <RestaurantDetailsStepBar />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <div className="card">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck
                size={18}
                style={{ color: "var(--sidebar-active-text)" }}
              />
              <div>
                <h2
                  className="text-lg font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {copy.title}
                </h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {copy.subtitle}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className={rowClass}>
                <div>
                  <label style={fieldStyle}>{copy.openingTime}</label>
                  <input
                    type="time"
                    className="input w-full"
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                  />
                </div>
                <div>
                  <label style={fieldStyle}>{copy.closingTime}</label>
                  <input
                    type="time"
                    className="input w-full"
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                  />
                </div>
              </div>

              <div className={rowClass}>
                <Select
                  label={copy.reservation}
                  value={reservationPolicy}
                  onChange={setReservationPolicy}
                  options={copy.reservationOptions}
                />
                <Select
                  label={copy.smoking}
                  value={smokingPolicy}
                  onChange={setSmokingPolicy}
                  options={copy.smokingOptions}
                />
              </div>

              <Select
                label={copy.dresscode}
                value={dresscode}
                onChange={setDresscode}
                options={copy.drescodeOptions}
              />

              <div>
                <label style={fieldStyle}>{copy.additionalEn}</label>
                <textarea
                  className="input w-full resize-none"
                  style={{ minHeight: 100 }}
                  dir="ltr"
                  placeholder={copy.additionalPlaceholder}
                  value={additionalEn}
                  onChange={(e) => setAdditionalEn(e.target.value)}
                />
              </div>
              <div>
                <label style={fieldStyle}>{copy.additionalAr}</label>
                <textarea
                  className="input w-full resize-none"
                  style={{ minHeight: 100 }}
                  dir="rtl"
                  placeholder={copy.additionalPlaceholder}
                  value={additionalAr}
                  onChange={(e) => setAdditionalAr(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card h-fit">
          <div className="flex items-center gap-2 mb-3">
            <Info size={16} style={{ color: "var(--brand)" }} />
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {isAr ? "نصيحة" : "Tip"}
            </span>
          </div>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {isAr
              ? "تساعد السياسات الواضحة في تحسين تجربة الضيوف وتقليل الاستفسارات."
              : "Clear policies improve guest experience and reduce inquiries."}
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleNext}
          className="btn btn-primary px-8 py-3 text-sm font-semibold rounded-2xl"
          style={{ backgroundColor: "var(--sidebar-active-text)" }}
        >
          {copy.next} ›
        </button>
      </div>
    </div>
  );
}
