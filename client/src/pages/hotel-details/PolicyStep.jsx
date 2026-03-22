import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import HotelDetailsStepBar from "../../components/HotelDetailsStepBar";
import { useLanguage } from "../../context/LanguageContext";

const MAX_LENGTH = 500;

const COPY = {
  en: {
    title: "Hotel Policy",
    error:
      "Please enter your hotel policy with at least 10 English characters.",
    placeholder:
      "Describe cancellation terms, check-in/check-out rules, house rules, and any important guest information.",
    checklistTitle: "Policy Checklist",
    checklist: [
      "Cancellation and refund terms",
      "Check-in / Check-out hours",
      "Accepted payment methods",
      "Pet and smoking policy",
      "Child / extra bed policy",
      "Dress code if applicable",
    ],
    next: "Next -> Photos",
  },
  ar: {
    title: "سياسة الفندق",
    error: "يرجى إدخال سياسة الفندق بما لا يقل عن 10 أحرف باللغة الإنجليزية.",
    placeholder:
      "اكتب سياسة الإلغاء وقواعد تسجيل الوصول والمغادرة والقواعد الداخلية وأي معلومات مهمة للضيف.",
    checklistTitle: "قائمة السياسة",
    checklist: [
      "شروط الإلغاء والاسترداد",
      "مواعيد تسجيل الوصول والمغادرة",
      "وسائل الدفع المقبولة",
      "سياسة الحيوانات الأليفة والتدخين",
      "سياسة الأطفال أو السرير الإضافي",
      "قواعد اللباس إن وجدت",
    ],
    next: "التالي -> الصور",
  },
};

const LangToggle = ({ lang, setLang }) => (
  <div className="flex items-center gap-1.5">
    <button
      onClick={() => setLang("en")}
      className="flex items-center gap-1 h-7 px-2 rounded-lg text-xs font-semibold transition-all"
      style={{
        backgroundColor:
          lang === "en" ? "var(--sidebar-active-text)" : "var(--bg-raised)",
        color: lang === "en" ? "#fff" : "var(--text-secondary)",
        border: `1px solid ${lang === "en" ? "var(--sidebar-active-text)" : "var(--border)"}`,
      }}
    >
      <img
        src="https://flagcdn.com/w20/us.png"
        alt="EN"
        className="h-4 w-5 rounded object-cover"
      />
      EN
    </button>
    <button
      onClick={() => setLang("ar")}
      className="flex items-center gap-1 h-7 px-2 rounded-lg text-xs font-semibold transition-all"
      style={{
        backgroundColor:
          lang === "ar" ? "var(--sidebar-active-text)" : "var(--bg-raised)",
        color: lang === "ar" ? "#fff" : "var(--text-secondary)",
        border: `1px solid ${lang === "ar" ? "var(--sidebar-active-text)" : "var(--border)"}`,
      }}
    >
      <img
        src="https://flagcdn.com/w20/eg.png"
        alt="AR"
        className="h-4 w-5 rounded object-cover"
      />
      AR
    </button>
  </div>
);

export default function HotelPolicyStep() {
  const navigate = useNavigate();
  const { lang: uiLang, dir } = useLanguage();
  const copy = COPY[uiLang] || COPY.en;
  const [lang, setLang] = useState("en");
  const [policyEn, setPolicyEn] = useState(
    () =>
      JSON.parse(sessionStorage.getItem("hotel_details_policy") || "null")
        ?.policyEn || "",
  );
  const [policyAr, setPolicyAr] = useState(
    () =>
      JSON.parse(sessionStorage.getItem("hotel_details_policy") || "null")
        ?.policyAr || "",
  );
  const [error, setError] = useState("");

  const current = lang === "en" ? policyEn : policyAr;

  const setCurrent = (value) => {
    if (lang === "en") {
      setPolicyEn(value);
    } else {
      setPolicyAr(value);
    }
    setError("");
  };

  const handleNext = () => {
    if (!policyEn.trim() || policyEn.trim().length < 10) {
      setError(copy.error);
      return;
    }

    sessionStorage.setItem(
      "hotel_details_policy",
      JSON.stringify({ policyEn, policyAr }),
    );
    navigate("/hotel/details/photos");
  };

  return (
    <div className="page-shell">
      <HotelDetailsStepBar />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2
              className="text-lg font-bold"
              style={{ color: "var(--sidebar-active-text)" }}
            >
              {copy.title}
            </h2>
            <LangToggle lang={lang} setLang={setLang} />
          </div>

          <div className="relative">
            <textarea
              className="input w-full resize-none pb-8"
              style={{ minHeight: 260 }}
              placeholder={copy.placeholder}
              dir={lang === "ar" ? "rtl" : "ltr"}
              maxLength={MAX_LENGTH}
              value={current}
              onChange={(event) => setCurrent(event.target.value)}
            />

            <span
              className="pointer-events-none absolute bottom-3 text-xs"
              style={{
                [dir === "rtl" ? "left" : "right"]: "0.75rem",
                color:
                  current.length >= MAX_LENGTH * 0.9
                    ? "var(--danger)"
                    : "var(--text-muted)",
              }}
            >
              {current.length} / {MAX_LENGTH}
            </span>
          </div>

          {error && <p className="input-error mt-1">{error}</p>}
        </div>

        <div className="flex flex-col gap-4">
          <div
            className="rounded-2xl p-5"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck size={16} style={{ color: "var(--brand)" }} />
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {copy.checklistTitle}
              </span>
            </div>

            <ul className="space-y-2">
              {copy.checklist.map((tip) => (
                <li
                  key={tip}
                  className="flex items-start gap-2 text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span style={{ color: "var(--brand)" }}>·</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={handleNext}
          className="btn btn-primary w-full rounded-2xl py-3 text-base"
          style={{ backgroundColor: "var(--sidebar-active-text)" }}
        >
          {copy.next}
        </button>
      </div>
    </div>
  );
}
