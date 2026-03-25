import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lightbulb } from "lucide-react";
import HotelDetailsStepBar from "../../components/HotelDetailsStepBar";
import { useLanguage } from "../../context/LanguageContext";

const COPY = {
  en: {
    title: "Hotel Description",
    error:
      "Please add a hotel description with at least 10 English characters.",
    placeholder:
      "Describe your hotel, highlight its unique character, ambiance, service style, and guest experience.",
    characters: "characters",
    tipsTitle: "Writing Tips",
    tips: [
      "Mention the hotel's location benefits",
      "Describe the atmosphere and design style",
      "Highlight signature amenities",
      "Mention nearby attractions",
      "Keep it concise and compelling",
    ],
    languages: "Languages",
    english: "English",
    englishHint: "Primary language and required.",
    arabic: "Arabic",
    arabicHint: "Optional and shown to Arabic-speaking guests.",
    next: "Next -> Icons",
  },
  ar: {
    title: "وصف الفندق",
    error: "يرجى إضافة وصف للفندق لا يقل عن 10 أحرف باللغة الإنجليزية.",
    placeholder:
      "اكتب وصفاً للفندق يوضح طابعه المميز والأجواء والخدمة وتجربة الضيوف.",
    characters: "حرف",
    tipsTitle: "نصائح للكتابة",
    tips: [
      "اذكر مميزات الموقع",
      "صف الأجواء والطابع العام",
      "أبرز المرافق المميزة",
      "اذكر المعالم القريبة",
      "اجعل النص مختصراً ومقنعاً",
    ],
    languages: "اللغات",
    english: "الإنجليزية",
    englishHint: "اللغة الأساسية وهي مطلوبة.",
    arabic: "العربية",
    arabicHint: "اختيارية وتظهر للضيوف الناطقين بالعربية.",
    next: "التالي -> الأيقونات",
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

export default function HotelDescriptionStep() {
  const navigate = useNavigate();
  const { lang: uiLang } = useLanguage();
  const copy = COPY[uiLang] || COPY.en;

  useEffect(() => {
    if (!sessionStorage.getItem("hotel_details_main")) {
      navigate("/hotel/details/main", { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [lang, setLang] = useState("en");
  const [descEn, setDescEn] = useState(
    () =>
      JSON.parse(sessionStorage.getItem("hotel_details_description") || "null")
        ?.descriptionEn || "",
  );
  const [descAr, setDescAr] = useState(
    () =>
      JSON.parse(sessionStorage.getItem("hotel_details_description") || "null")
        ?.descriptionAr || "",
  );
  const [error, setError] = useState("");

  const currentDesc = lang === "en" ? descEn : descAr;

  const setCurrentDesc = (value) => {
    if (lang === "en") {
      setDescEn(value);
    } else {
      setDescAr(value);
    }
    setError("");
  };

  const handleNext = () => {
    if (!descEn.trim() || descEn.trim().length < 10) {
      setError(copy.error);
      return;
    }

    sessionStorage.setItem(
      "hotel_details_description",
      JSON.stringify({ descriptionEn: descEn, descriptionAr: descAr }),
    );
    navigate("/hotel/details/icons");
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

          <textarea
            className="input w-full resize-none"
            style={{ minHeight: 260 }}
            placeholder={copy.placeholder}
            dir={lang === "ar" ? "rtl" : "ltr"}
            value={currentDesc}
            onChange={(event) => setCurrentDesc(event.target.value)}
          />

          {error && <p className="input-error mt-1">{error}</p>}

          <p className="mt-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
            {currentDesc.length} {copy.characters}
          </p>
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
              <Lightbulb size={16} style={{ color: "var(--warning)" }} />
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {copy.tipsTitle}
              </span>
            </div>

            <ul className="space-y-2">
              {copy.tips.map((tip) => (
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

          <div
            className="rounded-2xl p-5"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border)",
            }}
          >
            <p
              className="mb-2 text-xs font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {copy.languages}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              <span
                className="font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                <img
                  src="https://flagcdn.com/w20/us.png"
                  alt="EN"
                  className="mr-1 inline h-3.5 w-4 rounded object-cover"
                />
                {copy.english}
              </span>{" "}
              — {copy.englishHint}
            </p>
            <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
              <span
                className="font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                <img
                  src="https://flagcdn.com/w20/eg.png"
                  alt="AR"
                  className="mr-1 inline h-3.5 w-4 rounded object-cover"
                />
                {copy.arabic}
              </span>{" "}
              — {copy.arabicHint}
            </p>
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
