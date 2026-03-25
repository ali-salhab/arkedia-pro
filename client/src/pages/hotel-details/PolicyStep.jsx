import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Info } from "lucide-react";
import HotelDetailsStepBar from "../../components/HotelDetailsStepBar";
import { useLanguage } from "../../context/LanguageContext";

const STORAGE_KEY = "hotel_details_policy";

function loadPolicy() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null") || {};
  } catch {
    return {};
  }
}

export default function HotelPolicyStep() {
  const navigate = useNavigate();
  const { lang: uiLang, dir } = useLanguage();
  const isAr = uiLang === "ar";

  useEffect(() => {
    if (!sessionStorage.getItem("hotel_details_icons")) {
      navigate("/hotel/details/icons", { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const saved = loadPolicy();
  const [checkIn, setCheckIn] = useState(saved.checkIn || "14:00");
  const [checkOut, setCheckOut] = useState(saved.checkOut || "12:00");
  const [petPolicy, setPetPolicy] = useState(saved.petPolicy || "no");
  const [smokingPolicy, setSmokingPolicy] = useState(
    saved.smokingPolicy || "no",
  );
  const [additionalDetails, setAdditionalDetails] = useState(
    saved.additionalDetails || "",
  );

  const label = (en, ar) => (isAr ? ar : en);

  const handleNext = () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        checkIn,
        checkOut,
        petPolicy,
        smokingPolicy,
        additionalDetails,
      }),
    );
    navigate("/hotel/details/photos");
  };

  return (
    <div className="page-shell">
      <HotelDetailsStepBar />

      {/* Page Header */}
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-11 h-11 rounded-xl grid place-items-center"
          style={{ backgroundColor: "#eff6ff" }}
        >
          <ShieldCheck
            size={22}
            style={{ color: "var(--sidebar-active-text)" }}
          />
        </div>
        <div>
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {label("Hotel Policy", "سياسات الفندق")}
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {label(
              "Define check-in/check-out times and guest policies",
              "حدد مواعيد تسجيل الدخول والخروج وسياسات الضيوف",
            )}
          </p>
        </div>
      </div>

      <div className="card space-y-6">
        {/* Row 1: Check-in / Check-out */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              className="block text-sm font-semibold mb-1.5"
              style={{ color: "var(--text-primary)" }}
            >
              {label("⏰ Check-in Time", "⏰ وقت تسجيل الدخول")}
            </label>
            <input
              type="time"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label
              className="block text-sm font-semibold mb-1.5"
              style={{ color: "var(--text-primary)" }}
            >
              {label("⏰ Check-out Time", "⏰ وقت تسجيل الخروج")}
            </label>
            <input
              type="time"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="input"
            />
          </div>
        </div>

        {/* Row 2: Pet & Smoking policy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              className="block text-sm font-semibold mb-1.5"
              style={{ color: "var(--text-primary)" }}
            >
              {label("🐾 Pet Policy", "🐾 سياسة الحيوانات الأليفة")}
            </label>
            <select
              value={petPolicy}
              onChange={(e) => setPetPolicy(e.target.value)}
              className="input"
            >
              <option value="no">{label("Not Allowed", "غير مسموح")}</option>
              <option value="yes">{label("Allowed", "مسموح")}</option>
              <option value="request">
                {label("Upon Request", "بناءً على طلب")}
              </option>
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-semibold mb-1.5"
              style={{ color: "var(--text-primary)" }}
            >
              {label("🚬 Smoking Policy", "🚬 سياسة التدخين")}
            </label>
            <select
              value={smokingPolicy}
              onChange={(e) => setSmokingPolicy(e.target.value)}
              className="input"
            >
              <option value="no">
                {label("Non-Smoking", "غير مسموح بالتدخين")}
              </option>
              <option value="yes">
                {label("Smoking Allowed", "مسموح بالتدخين")}
              </option>
              <option value="designated">
                {label("Designated Areas Only", "مناطق مخصصة فقط")}
              </option>
            </select>
          </div>
        </div>

        {/* Row 3: Children Policy (read-only info) */}
        <div>
          <label
            className="block text-sm font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            {label("👶 Children Policy", "👶 سياسة الأطفال")}
          </label>
          <div
            className="flex items-start gap-2.5 rounded-xl p-4"
            style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}
          >
            <Info
              size={16}
              className="shrink-0 mt-0.5"
              style={{ color: "var(--sidebar-active-text)" }}
            />
            <p className="text-sm leading-relaxed" style={{ color: "#1e40af" }}>
              {label(
                "Children policy is automatically derived from the Double Room (DBL) settings and cannot be edited here.",
                "يتم إنشاء سياسة الأطفال تلقائيًا من إعدادات الغرفة المزدوجة (DBL) ولا يمكن تعديلها هنا.",
              )}
            </p>
          </div>
        </div>

        {/* Row 4: Additional Details */}
        <div>
          <label
            className="block text-sm font-semibold mb-1.5"
            style={{ color: "var(--text-primary)" }}
          >
            {label("Additional Details (optional)", "تفاصيل إضافية (اختياري)")}
          </label>
          <textarea
            className="input w-full resize-none"
            style={{ minHeight: 100 }}
            placeholder={label(
              "Any additional rules or information for guests...",
              "أي قواعد أو معلومات إضافية للضيوف...",
            )}
            value={additionalDetails}
            onChange={(e) => setAdditionalDetails(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleNext}
          className="btn btn-primary w-full rounded-2xl py-3 text-base"
          style={{ backgroundColor: "var(--sidebar-active-text)" }}
        >
          {label("Next -> Photos", "التالي -> الصور")}
        </button>
      </div>
    </div>
  );
}
